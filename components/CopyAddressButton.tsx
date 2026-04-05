import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CopyAddressButton({
  address,
  accentProgress,
}: {
  address: string;
  accentProgress?: SharedValue<number>;
}) {
  const colors = useThemeColors();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = setTimeout(() => {
      setCopied(false);
    }, 1500);

    return () => {
      clearTimeout(timeout);
    };
  }, [copied]);

  const animatedStyle = useAnimatedStyle(() => {
    if (!accentProgress) {
      return {};
    }

    return {
      borderColor: interpolateColor(
        accentProgress.value,
        [0, 1],
        [colors.neutral[100], colors.primary[500]],
      ),
    };
  });

  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={async () => {
        await Clipboard.setStringAsync(address);
        setCopied(true);
      }}
      style={[
        {
          width: "100%",
          minHeight: 52,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: colors.neutral[700],
          backgroundColor: colors.background[900],
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        },
        animatedStyle,
      ]}
    >
      <MaterialIcons
        name={copied ? "check" : "content-copy"}
        size={18}
        color={copied ? colors.neutral[100] : colors.neutral[300]}
      />
      <Text style={[fontStyle("textBold", "giant"), { color: colors.neutral[100] }]}>
        {copied ? "Copied" : "Copy address"}
      </Text>
    </AnimatedPressable>
  );
}
