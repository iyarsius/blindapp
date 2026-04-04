import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, Text } from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface TokenSelectorProps {
  ticker: string;
  onPress?: () => void;
  borderColor?: string;
  accentProgress?: SharedValue<number>;
}

export default function TokenSelector({
  ticker,
  onPress = () => {},
  borderColor,
  accentProgress,
}: TokenSelectorProps) {
  const colors = useThemeColors();
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
      onPress={onPress}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          minHeight: 40,
          paddingHorizontal: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: borderColor ?? colors.neutral[700],
          backgroundColor: colors.background[900],
        },
        animatedStyle,
      ]}
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
    </AnimatedPressable>
  );
}
