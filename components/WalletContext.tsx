import { TransferScope } from "@/constants/transfer";
import {
  getPrivateBalances,
  getPrivateWalletAddress,
  getSupportedTokens,
  initWallet,
  requestFaucet,
  StoredWallet,
  submitTransfer,
  SupportedToken,
  TransferReceipt,
} from "@/lib/backend";
import { readStoredWallet, saveStoredWallet } from "@/lib/walletStorage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export interface QueuedTransfer {
  scope: TransferScope;
  recipient: string;
  amountInput: string;
  amountBaseUnits: string;
  token: SupportedToken;
}

interface TransferState {
  status: "idle" | "running" | "succeeded" | "failed";
  error: string | null;
  receipt: TransferReceipt | null;
}

interface FaucetState {
  status: "idle" | "running" | "succeeded" | "failed";
  error: string | null;
}

interface WalletContextValue {
  isInitializing: boolean;
  walletError: string | null;
  privateAddress: string | null;
  publicAddress: string | null;
  tokens: SupportedToken[];
  selectedToken: SupportedToken | null;
  privateBalancesByToken: Record<string, string>;
  pendingTransfer: QueuedTransfer | null;
  transferState: TransferState;
  faucetState: FaucetState;
  setSelectedToken: (token: SupportedToken) => void;
  refreshWallet: () => Promise<void>;
  requestTestTokens: (scope: TransferScope) => Promise<void>;
  queueTransfer: (transfer: QueuedTransfer) => void;
  submitPendingTransfer: () => Promise<void>;
  clearTransferFlow: () => void;
}

const DEFAULT_TRANSFER_STATE: TransferState = {
  status: "idle",
  error: null,
  receipt: null,
};

const DEFAULT_FAUCET_STATE: FaucetState = {
  status: "idle",
  error: null,
};

const WalletContext = createContext<WalletContextValue | null>(null);

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong while talking to the backend.";
}

function getRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function getStringValue(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }

  return null;
}

function getAmountValue(record: Record<string, unknown>) {
  for (const key of ["amount", "balance", "value"]) {
    const value = record[key];
    if (typeof value === "string" && /^\d+$/.test(value)) {
      return value;
    }

    if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
      return String(Math.trunc(value));
    }
  }

  return null;
}

function normalizePrivateBalances(entries: unknown, tokens: SupportedToken[]) {
  const balancesByToken = Object.fromEntries(
    tokens.map((token) => [token.address.toLowerCase(), "0"]),
  ) as Record<string, string>;

  if (!Array.isArray(entries)) {
    return balancesByToken;
  }

  for (const entry of entries) {
    const record = getRecord(entry);
    if (!record) {
      continue;
    }

    const nestedToken = getRecord(record.token);
    const addressCandidates = [
      getStringValue(record, ["token", "tokenAddress", "address", "contractAddress"]),
      nestedToken
        ? getStringValue(nestedToken, ["address", "token", "contractAddress"])
        : null,
    ].filter((candidate): candidate is string => Boolean(candidate));

    const symbolCandidates = [
      getStringValue(record, ["symbol", "ticker"]),
      nestedToken ? getStringValue(nestedToken, ["symbol", "ticker"]) : null,
    ].filter((candidate): candidate is string => Boolean(candidate));

    const matchedToken =
      tokens.find((token) =>
        addressCandidates.some(
          (candidate) => token.address.toLowerCase() === candidate.toLowerCase(),
        ),
      ) ??
      tokens.find((token) =>
        symbolCandidates.some(
          (candidate) => token.symbol.toLowerCase() === candidate.toLowerCase(),
        ),
      );

    const amount = getAmountValue(record);
    if (!matchedToken || !amount) {
      continue;
    }

    balancesByToken[matchedToken.address.toLowerCase()] = amount;
  }

  return balancesByToken;
}

function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<StoredWallet | null>(null);
  const [privateAddress, setPrivateAddress] = useState<string | null>(null);
  const [tokens, setTokens] = useState<SupportedToken[]>([]);
  const [selectedTokenAddress, setSelectedTokenAddress] = useState<string | null>(
    null,
  );
  const [privateBalancesByToken, setPrivateBalancesByToken] = useState<
    Record<string, string>
  >({});
  const [pendingTransfer, setPendingTransfer] = useState<QueuedTransfer | null>(
    null,
  );
  const [transferState, setTransferState] = useState<TransferState>(
    DEFAULT_TRANSFER_STATE,
  );
  const [faucetState, setFaucetState] = useState<FaucetState>(DEFAULT_FAUCET_STATE);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const selectedToken =
    tokens.find((token) => token.address === selectedTokenAddress) ?? tokens[0] ?? null;

  async function refreshWalletSnapshot(nextWallet: StoredWallet, nextTokens: SupportedToken[]) {
    const [addressResponse, balancesResponse] = await Promise.all([
      getPrivateWalletAddress(nextWallet),
      getPrivateBalances(nextWallet),
    ]);

    setPrivateAddress(addressResponse.address);
    setPrivateBalancesByToken(
      normalizePrivateBalances(balancesResponse.balances, nextTokens),
    );
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadWallet() {
      setIsInitializing(true);

      try {
        const supportedTokens = await getSupportedTokens();
        let nextWallet = await readStoredWallet();

        if (!nextWallet) {
          nextWallet = await initWallet();
          await saveStoredWallet(nextWallet);
        }

        if (isCancelled) {
          return;
        }

        setWallet(nextWallet);
        setTokens(supportedTokens);
        setSelectedTokenAddress((currentAddress) => {
          if (
            currentAddress &&
            supportedTokens.some((token) => token.address === currentAddress)
          ) {
            return currentAddress;
          }

          return (
            supportedTokens.find((token) => token.symbol === "TEST")?.address ??
            supportedTokens[0]?.address ??
            null
          );
        });

        await refreshWalletSnapshot(nextWallet, supportedTokens);
        if (isCancelled) {
          return;
        }

        setWalletError(null);
      } catch (error) {
        if (!isCancelled) {
          setWalletError(getErrorMessage(error));
        }
      } finally {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }
    }

    void loadWallet();

    return () => {
      isCancelled = true;
    };
  }, []);

  async function refreshWallet() {
    if (!wallet) {
      return;
    }

    try {
      await refreshWalletSnapshot(wallet, tokens);
      setWalletError(null);
    } catch (error) {
      setWalletError(getErrorMessage(error));
    }
  }

  async function requestTestTokens(scope: TransferScope) {
    if (!wallet || faucetState.status === "running") {
      return;
    }

    const testToken = tokens.find((token) => token.symbol === "TEST");
    if (!testToken) {
      setFaucetState({
        status: "failed",
        error: "The TEST token is not configured on this backend.",
      });
      return;
    }

    setFaucetState({
      status: "running",
      error: null,
    });

    try {
      await requestFaucet(wallet, {
        target: scope === "private" ? "unlink" : "eoa",
        tokenAddress: testToken.address,
      });

      await delay(scope === "private" ? 20000 : 8000);
      await refreshWallet();
      setSelectedTokenAddress(testToken.address);
      setFaucetState({
        status: "succeeded",
        error: null,
      });
    } catch (error) {
      setFaucetState({
        status: "failed",
        error: getErrorMessage(error),
      });
    }
  }

  function queueTransfer(transfer: QueuedTransfer) {
    setPendingTransfer(transfer);
    setTransferState(DEFAULT_TRANSFER_STATE);
  }

  async function submitPendingTransfer() {
    if (!wallet || !pendingTransfer || transferState.status === "running") {
      return;
    }

    setTransferState({
      status: "running",
      error: null,
      receipt: null,
    });

    try {
      const receipt = await submitTransfer(wallet, {
        scope: pendingTransfer.scope,
        recipient: pendingTransfer.recipient,
        amountBaseUnits: pendingTransfer.amountBaseUnits,
        tokenAddress: pendingTransfer.token.address,
      });

      await refreshWallet();
      setTransferState({
        status: "succeeded",
        error: null,
        receipt,
      });
    } catch (error) {
      setTransferState({
        status: "failed",
        error: getErrorMessage(error),
        receipt: null,
      });
    }
  }

  function clearTransferFlow() {
    setPendingTransfer(null);
    setTransferState(DEFAULT_TRANSFER_STATE);
  }

  return (
    <WalletContext.Provider
      value={{
        isInitializing,
        walletError,
        privateAddress,
        publicAddress: wallet?.evmAddress ?? null,
        tokens,
        selectedToken,
        privateBalancesByToken,
        pendingTransfer,
        transferState,
        faucetState,
        setSelectedToken: (token) => {
          setSelectedTokenAddress(token.address);
        },
        refreshWallet,
        requestTestTokens,
        queueTransfer,
        submitPendingTransfer,
        clearTransferFlow,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }

  return context;
}
