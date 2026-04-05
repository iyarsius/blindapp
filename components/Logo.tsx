import { useEffect } from "react";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "@/theme/useThemColors";

export interface LogoProps {
  state: "fragmented" | "normal";
  rotated?: boolean;
}

export default function Logo({ rotated, state }: LogoProps) {
  const colors = useThemeColors();
  const rotation = useSharedValue(rotated ? 180 : 0);
  const fragmentProgress = useSharedValue(state === "fragmented" ? 1 : 0);
  const fragmentProgressColor = useSharedValue(state === "fragmented" ? 1 : 0);

  useEffect(() => {
    rotation.value = withSpring(rotated ? 180 : 0, {
      stiffness: 220,
      damping: 16,
      mass: 0.9,
    });
  }, [rotated, rotation]);

  useEffect(() => {
    fragmentProgress.value = withTiming(state === "fragmented" ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });

    fragmentProgressColor.value = withTiming(state === "fragmented" ? 1 : 0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [fragmentProgress, state]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      columnGap: interpolate(fragmentProgress.value, [0, 1], [0, 20]),
      transform: [{ perspective: 800 }, { rotateX: `${rotation.value}deg` }],
    };
  });

  const strokeStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        fragmentProgress.value,
        [0, 1],
        [colors.neutral[100], colors.primary[500]],
      ),
    };
  });

  return (
    <Animated.View
      style={[
        {
          flexDirection: "row",
          position: "relative",
        },
        animatedStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            width: 42,
            height: 72,
            borderLeftWidth: 15,
            borderBottomWidth: 15,
            borderBottomLeftRadius: 30,
          },
          strokeStyle,
        ]}
      ></Animated.View>
      <Animated.View
        style={[
          {
            width: 42,
            height: 72,
            borderRightWidth: 15,
            borderBottomWidth: 15,
            borderBottomRightRadius: 30,
          },
          strokeStyle,
        ]}
      ></Animated.View>
    </Animated.View>
  );
}
