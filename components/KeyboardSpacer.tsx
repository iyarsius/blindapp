import { useCallback } from "react";
import { useWindowDimensions } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, {
  Easing,
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const OPEN_CONFIG = { duration: 300, easing: Easing.out(Easing.poly(3)) };
const CLOSE_CONFIG = { duration: 320, easing: Easing.inOut(Easing.poly(3)) };

export interface KeyboardSpacerProps {
  bottomOffset?: number;
}

export default function KeyboardSpacer({
  bottomOffset = 0,
}: KeyboardSpacerProps) {
  const { height: windowHeight } = useWindowDimensions();
  const spacerRef = useAnimatedRef<Animated.View>();
  const isSpacerMeasurable = useSharedValue(false);
  const keyboardHeight = useSharedValue(0);
  const isClosing = useSharedValue(false);
  const spaceBelow = useSharedValue(bottomOffset);
  const spacerHeight = useSharedValue(0);

  const getOverlap = useCallback(
    (nextKeyboardHeight: number) => {
      "worklet";

      return Math.max(0, nextKeyboardHeight - spaceBelow.value);
    },
    [spaceBelow],
  );

  const refreshSpaceBelow = useCallback(
    (force = false) => {
      "worklet";

      if (!force && !isSpacerMeasurable.value) {
        return false;
      }

      const measured = measure(spacerRef);

      if (!measured) {
        return false;
      }

      isSpacerMeasurable.value = true;
      spaceBelow.value = bottomOffset + windowHeight - (measured.pageY + measured.height);

      return true;
    },
    [bottomOffset, isSpacerMeasurable, spacerRef, spaceBelow, windowHeight],
  );

  const setSpacerHeight = useCallback(
    (nextKeyboardHeight: number) => {
      "worklet";

      if (!isSpacerMeasurable.value) {
        return;
      }

      spacerHeight.value = getOverlap(nextKeyboardHeight);
    },
    [getOverlap, isSpacerMeasurable, spacerHeight],
  );

  const animateSpacerHeight = useCallback(
    (nextKeyboardHeight: number, duration?: number) => {
      "worklet";

      if (!isSpacerMeasurable.value) {
        return;
      }

      if (nextKeyboardHeight === 0) {
        spacerHeight.value = withTiming(getOverlap(nextKeyboardHeight), CLOSE_CONFIG);

        return;
      }

      const config =
        duration && duration > 0 ? { duration, easing: OPEN_CONFIG.easing } : OPEN_CONFIG;

      spacerHeight.value = withTiming(getOverlap(nextKeyboardHeight), config);
    },
    [getOverlap, isSpacerMeasurable, spacerHeight],
  );

  const handleLayout = useCallback(() => {
    runOnUI(() => {
      "worklet";

      const wasMeasurable = isSpacerMeasurable.value;

      if (wasMeasurable && (keyboardHeight.value > 0 || spacerHeight.value > 0)) {
        return;
      }

      if (!refreshSpaceBelow(true)) {
        return;
      }

      animateSpacerHeight(keyboardHeight.value);
    })();
  }, [animateSpacerHeight, isSpacerMeasurable, keyboardHeight, refreshSpaceBelow, spacerHeight]);

  useKeyboardHandler(
    {
      onStart: (event) => {
        "worklet";

        isClosing.value = event.height === 0;
        keyboardHeight.value = event.height;

        if (!isSpacerMeasurable.value) {
          return;
        }

        if (!isClosing.value) {
          refreshSpaceBelow();
        }

        animateSpacerHeight(event.height, event.duration);
      },
      onMove: (event) => {
        "worklet";

        keyboardHeight.value = event.height;

        if (!isClosing.value) {
          setSpacerHeight(event.height);
        }
      },
      onInteractive: (event) => {
        "worklet";

        const previousKeyboardHeight = keyboardHeight.value;

        keyboardHeight.value = event.height;

        if (event.height > previousKeyboardHeight) {
          isClosing.value = false;
          setSpacerHeight(event.height);
        }
      },
      onEnd: (event) => {
        "worklet";

        keyboardHeight.value = event.height;

        if (!isClosing.value) {
          setSpacerHeight(event.height);
        }
      },
    },
    [
      animateSpacerHeight,
      isClosing,
      isSpacerMeasurable,
      keyboardHeight,
      refreshSpaceBelow,
      setSpacerHeight,
    ],
  );

  const spacerStyle = useAnimatedStyle(() => ({
    height: spacerHeight.value,
  }));

  return <Animated.View ref={spacerRef} onLayout={handleLayout} style={spacerStyle} />;
}
