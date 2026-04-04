import Button from "@/components/Button";
import { useThemeColors } from "@/theme/useThemColors";
import { componentSpacing, fontStyle } from "@/theme/utils";
import { router } from "expo-router";
import { Text, View } from "react-native";

export default function Auth() {
  const colors = useThemeColors();

  return (
    <View
      style={{
        flex: 1,
        padding: 24,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: componentSpacing("small"),
        }}
      >
        <Text style={[fontStyle("heading", "large")]}>Blind</Text>
        <Text
          style={[fontStyle("text", "large"), { color: colors.neutral[300] }]}
        >
          Crypto made private
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Button
          onPress={() => {
            router.push("/(pages)/Home");
          }}
        >
          Create Wallet
        </Button>
      </View>
    </View>
  );
}
