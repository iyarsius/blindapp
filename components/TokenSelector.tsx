import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";

export interface TokenSelectorProps {
  ticker: string;
  onPress?: () => void;
}

export default function TokenSelector({
  ticker,
  onPress = () => {},
}: TokenSelectorProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: colors.neutral[700],
        backgroundColor: colors.background[900],
      }}
    >
      <Text
        style={[fontStyle("textBold", "small"), { color: colors.neutral[100] }]}
      >
        {ticker}
      </Text>
      <MaterialIcons
        name="chevron-right"
        size={18}
        color={colors.neutral[500]}
      />
    </Pressable>
  );
}
