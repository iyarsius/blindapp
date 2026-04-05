import {
  TransferScope,
} from "@/constants/transfer";
import { createContext, ReactNode, useContext } from "react";
import { SharedValue } from "react-native-reanimated";

interface TransferContextValue {
  scope: TransferScope;
  setScope: (scope: TransferScope) => void;
  accentProgress: SharedValue<number>;
}

const TransferContext = createContext<TransferContextValue | null>(null);

export function TransferProvider({
  value,
  children,
}: {
  value: TransferContextValue;
  children: ReactNode;
}) {
  return (
    <TransferContext.Provider value={value}>{children}</TransferContext.Provider>
  );
}

export function useTransferContext() {
  const context = useContext(TransferContext);

  if (!context) {
    throw new Error("useTransferContext must be used within TransferProvider");
  }

  return context;
}
