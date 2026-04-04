import { ReactNode } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";

export interface KeyboardRootProps {
  children: ReactNode;
}

export default function KeyboardRoot({ children }: KeyboardRootProps) {
  return <KeyboardProvider preload={false}>{children}</KeyboardProvider>;
}
