import { TransferScope } from "@/constants/transfer";

export interface StoredWallet {
  unlinkMnemonic: string;
  evmPrivateKey: string;
  evmAddress: string;
}

export interface SupportedToken {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
}

export interface TransferReceipt {
  [key: string]: unknown;
}

export interface SweepDeposit {
  address: string;
  amount: string;
}

export type FaucetTarget = "eoa" | "unlink";

const DEFAULT_BACKEND_URL = "https://api.blindapp.space";

function getBackendUrl() {
  return DEFAULT_BACKEND_URL;
}

function extractApiError(payload: unknown) {
  if (typeof payload === "string" && payload.trim().length > 0) {
    return payload;
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const message = Reflect.get(payload, "message");
  if (typeof message === "string" && message.trim().length > 0) {
    return message;
  }

  const error = Reflect.get(payload, "error");
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return null;
}

async function request<T>(path: string, init?: RequestInit) {
  const url = `${getBackendUrl()}${path}`;
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const text = await response.text();
  let payload: unknown = null;

  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }

  if (!response.ok) {
    const errorMessage =
      extractApiError(payload) ?? `Backend request failed with ${response.status}.`;

    throw new Error(
      `${init?.method ?? "GET"} ${path} failed with ${response.status}: ${errorMessage}`,
    );
  }

  return payload as T;
}

export function getConfiguredBackendUrl() {
  return DEFAULT_BACKEND_URL;
}

export async function initWallet() {
  return request<StoredWallet>("/init", {
    method: "POST",
  });
}

export async function getSupportedTokens() {
  const response = await request<{ tokens: SupportedToken[] }>("/tokens");
  return response.tokens;
}

export async function getPrivateWalletAddress(wallet: StoredWallet) {
  return request<{ address: string }>("/wallet/address", {
    method: "POST",
    body: JSON.stringify(wallet),
  });
}

export async function getPrivateBalances(wallet: StoredWallet) {
  return request<{ balances: unknown[] }>("/wallet/unlink", {
    method: "POST",
    body: JSON.stringify(wallet),
  });
}

export async function getSweepableDeposits(wallet: StoredWallet) {
  const response = await request<{ tokensToDeposit: SweepDeposit[] }>(
    "/wallet/sweep",
    {
      method: "POST",
      body: JSON.stringify({ evmPrivateKey: wallet.evmPrivateKey }),
    },
  );

  return response.tokensToDeposit;
}

export async function depositFromEoa(
  wallet: StoredWallet,
  params: {
    tokenAddress: string;
    amount: string;
  },
) {
  return request<TransferReceipt>("/deposit", {
    method: "POST",
    body: JSON.stringify({
      unlinkMnemonic: wallet.unlinkMnemonic,
      evmPrivateKey: wallet.evmPrivateKey,
      token: params.tokenAddress,
      amount: params.amount,
    }),
  });
}

export async function submitTransfer(
  wallet: StoredWallet,
  params: {
    scope: TransferScope;
    recipient: string;
    amountBaseUnits: string;
    tokenAddress: string;
  },
) {
  const path = params.scope === "private" ? "/transfer" : "/withdraw";
  const body =
    params.scope === "private"
      ? {
          ...wallet,
          recipientAddress: params.recipient,
          amount: params.amountBaseUnits,
          token: params.tokenAddress,
        }
      : {
          ...wallet,
          recipientEvmAddress: params.recipient,
          amount: params.amountBaseUnits,
          token: params.tokenAddress,
        };

  return request<TransferReceipt>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function requestFaucet(
  wallet: StoredWallet,
  params: {
    target: FaucetTarget;
    tokenAddress?: string;
  },
) {
  return request<TransferReceipt>("/faucet", {
    method: "POST",
    body: JSON.stringify({
      ...wallet,
      target: params.target,
      token: params.tokenAddress,
    }),
  });
}
