import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { Pressable, Text } from "react-native";

export interface ButtonParams {
  children: string;
  onPress: () => void;
}

export default function Button({ children, onPress }: ButtonParams) {
  const colors = useThemeColors();
  return (
    <Pressable
      style={{
        width: "100%",
        height: 48,
        borderRadius: 10,
        backgroundColor: colors.primary[500],
        alignItems: "center",
        justifyContent: "center",
      }}
      onPress={onPress}
    >
      <Text
        style={[
          fontStyle("textBold", "medium"),
          { color: colors.primary[900] },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
