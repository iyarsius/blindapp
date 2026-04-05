import { useEffect } from "react";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useThemeColors } from "@/theme/useThemColors";

export interface LogoProps {
  state: "fragmented" | "normal";
  rotated?: boolean;
  attractAttention?: boolean;
}

export default function Logo({
  rotated,
  state,
  attractAttention = false,
}: LogoProps) {
  const colors = useThemeColors();
  const rotation = useSharedValue(rotated ? 180 : 0);
  const jiggle = useSharedValue(0);
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
  }, [fragmentProgress, fragmentProgressColor, state]);

  useEffect(() => {
    if (!attractAttention) {
      cancelAnimation(jiggle);
      jiggle.value = withTiming(0, { duration: 120 });
      return;
    }

    jiggle.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1800 }),
        withTiming(-8, { duration: 90, easing: Easing.out(Easing.cubic) }),
        withTiming(8, { duration: 120, easing: Easing.inOut(Easing.cubic) }),
        withTiming(-5, { duration: 100, easing: Easing.inOut(Easing.cubic) }),
        withTiming(5, { duration: 100, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0, { duration: 120, easing: Easing.out(Easing.cubic) }),
      ),
      -1,
      false,
    );
  }, [attractAttention, jiggle]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      columnGap: interpolate(fragmentProgress.value, [0, 1], [0, 20]),
      transform: [
        { perspective: 800 },
        { rotateX: `${rotation.value}deg` },
        { rotateZ: `${jiggle.value}deg` },
      ],
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
