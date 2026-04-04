import { useColorScheme } from "react-native";

import { COLORS } from "./constants/colors";

export type ThemeName = keyof typeof COLORS;
export type ThemeColors = (typeof COLORS)[ThemeName];

export function useThemColors(theme?: ThemeName): ThemeColors {
  const colorScheme = useColorScheme();
  const currentTheme = theme ?? (colorScheme === "dark" ? "dark" : "light");

  return COLORS[currentTheme];
}
