import { BORDER_RADIUS } from "./constants/borderRadius";
import { FONTS } from "./constants/fonts";
import { SIZINGS } from "./constants/sizings";
import { SPACINGS } from "./constants/spacings";
import { TextStyle } from "react-native";

export type Size = "tiny" | "small" | "medium" | "large" | "giant";

export const componentSize = (size: Size) => {
  return SIZINGS.components[size];
};

export const iconSize = (size: Size) => {
  return SIZINGS.icons[size];
};

export const barHeight = (size: Size) => {
  return SIZINGS.bars[size];
};

export const fontStyle = (type: keyof typeof FONTS, size: Size) => {
  return FONTS[type][size] as TextStyle;
};

export const componentBorderRadius = (size: Size) => {
  return BORDER_RADIUS.components[size];
};

export const screenBorderRadius = (size: Size) => {
  return BORDER_RADIUS.screens[size];
};

export const componentSpacing = (size: Size) => {
  return SPACINGS.components[size];
};

export const screenSpacing = (size: Size) => {
  return SPACINGS.screens[size];
};
