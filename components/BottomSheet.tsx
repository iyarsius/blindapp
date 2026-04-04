import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ReactNode, useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [isMounted, setIsMounted] = useState(visible);
  const progress = useSharedValue(visible ? 1 : 0);
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      dragY.value = 0;
      progress.value = withTiming(1, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      return;
    }

    progress.value = withTiming(
      0,
      {
        duration: 220,
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (finished) {
          runOnJS(setIsMounted)(false);
        }
      },
    );
  }, [dragY, progress, visible]);

  const closeSheet = () => {
    dragY.value = 0;
    onClose();
  };

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      dragY.value = Math.max(event.translationY, 0);
    })
    .onEnd((event) => {
      const shouldClose = event.translationY > 120 || event.velocityY > 900;

      if (shouldClose) {
        runOnJS(closeSheet)();
        return;
      }

      dragY.value = withSpring(0, {
        damping: 20,
        stiffness: 260,
      });
    });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
    };
  });

  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        {
          translateY: interpolate(progress.value, [0, 1], [280, 0]) + dragY.value,
        },
      ],
    };
  });

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={isMounted}
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <View style={styles.container}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(0, 0, 0, 0.52)",
              },
              backdropAnimatedStyle,
            ]}
          />
        </Pressable>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                gap: 18,
                paddingTop: 12,
                paddingHorizontal: 20,
                paddingBottom: Math.max(insets.bottom, 16),
                borderTopLeftRadius: 28,
                borderTopRightRadius: 28,
                backgroundColor: colors.neutral[900],
              },
              sheetAnimatedStyle,
            ]}
          >
            <View style={styles.handleContainer}>
              <View
                style={{
                  width: 42,
                  height: 4,
                  borderRadius: 999,
                  backgroundColor: colors.neutral[700],
                }}
              />
            </View>

            {title ? (
              <Text
                style={[
                  fontStyle("textBold", "medium"),
                  { color: colors.neutral[100] },
                ]}
              >
                {title}
              </Text>
            ) : null}

            {children}
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  handleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});
