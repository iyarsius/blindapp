import { Href } from "expo-router";

export const transferScopes = ["public", "private"] as const;
export const transferActions = ["send", "receive"] as const;

export type TransferScope = (typeof transferScopes)[number];
export type TransferAction = (typeof transferActions)[number];

export const transferScopeTabs = [
  { label: "Public", key: "public" },
  { label: "Private", key: "private" },
] as const;

export function normalizeTransferAction(
  value?: string | string[],
): TransferAction {
  return value === "receive" ? "receive" : "send";
}

export function buildTransferRoute(action: TransferAction): Href {
  return `/${action}` as Href;
}
