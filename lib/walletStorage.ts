import { StoredWallet } from "@/lib/backend";
import * as SecureStore from "expo-secure-store";

const WALLET_STORAGE_KEY = "blind.wallet";

function isStoredWallet(value: unknown): value is StoredWallet {
  if (!value || typeof value !== "object") {
    return false;
  }

  return (
    typeof Reflect.get(value, "unlinkMnemonic") === "string" &&
    typeof Reflect.get(value, "evmPrivateKey") === "string" &&
    typeof Reflect.get(value, "evmAddress") === "string"
  );
}

export async function readStoredWallet() {
  const rawValue = await SecureStore.getItemAsync(WALLET_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    if (isStoredWallet(parsedValue)) {
      return parsedValue;
    }
  } catch {
    // Ignore corrupted local data and regenerate the wallet below.
  }

  await SecureStore.deleteItemAsync(WALLET_STORAGE_KEY);
  return null;
}

export async function saveStoredWallet(wallet: StoredWallet) {
  await SecureStore.setItemAsync(WALLET_STORAGE_KEY, JSON.stringify(wallet));
}
