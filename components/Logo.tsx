import { useEffect } from "react";
import Animated, {
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
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

  useEffect(() => {
    rotation.value = withTiming(rotated ? 180 : 0, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
  }, [rotated, rotation]);

  useEffect(() => {
    fragmentProgress.value = withTiming(state === "fragmented" ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [fragmentProgress, state]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      columnGap: interpolate(fragmentProgress.value, [0, 1], [0, 16]),
      transform: [{ rotate: `${rotation.value}deg` }],
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

  const seamMaskStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - fragmentProgress.value,
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
            width: 32,
            height: 72,
            borderLeftWidth: 10,
            borderBottomWidth: 10,
            borderBottomLeftRadius: 30,
          },
          strokeStyle,
        ]}
      ></Animated.View>
      <Animated.View
        style={[
          {
            width: 32,
            height: 72,
            borderRightWidth: 10,
            borderBottomWidth: 10,
            borderBottomRightRadius: 30,
          },
          strokeStyle,
        ]}
      ></Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            left: 30,
            top: 0,
            width: 4,
            height: 62,
            backgroundColor: colors.background[900],
          },
          seamMaskStyle,
        ]}
      ></Animated.View>
    </Animated.View>
  );
}
