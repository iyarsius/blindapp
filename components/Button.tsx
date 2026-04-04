import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { Pressable, Text } from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface ButtonParams {
  children: string;
  onPress: () => void;
  backgroundColor?: string;
  accentProgress?: SharedValue<number>;
}

export default function Button({
  children,
  onPress,
  backgroundColor,
  accentProgress,
}: ButtonParams) {
  const colors = useThemeColors();
  const animatedStyle = useAnimatedStyle(() => {
    if (!accentProgress) {
      return {};
    }

    return {
      backgroundColor: interpolateColor(
        accentProgress.value,
        [0, 1],
        [colors.neutral[100], colors.primary[500]],
      ),
    };
  });

  return (
    <AnimatedPressable
      style={[
        {
          width: "100%",
          height: 52,
          borderRadius: 24,
          backgroundColor: backgroundColor ?? colors.primary[500],
          alignItems: "center",
          justifyContent: "center",
        },
        animatedStyle,
      ]}
      onPress={onPress}
    >
      <Text
        style={[fontStyle("textBold", "giant"), { color: colors.primary[900] }]}
      >
        {children}
      </Text>
    </AnimatedPressable>
  );
}
