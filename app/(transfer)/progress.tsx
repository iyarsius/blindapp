import Button from "@/components/Button";
import { useTransferContext } from "@/components/TransferContext";
import { useWalletContext } from "@/components/WalletContext";
import { buildTransferRoute } from "@/constants/transfer";
import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { InteractionManager, Text, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  cancelAnimation,
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const STATUS_MESSAGES = [
  "Encrypting route...",
  "Broadcasting transaction...",
  "Waiting for confirmation...",
] as const;

function OrbitRing({
  size,
  duration,
  reverse = false,
  opacity,
  dotSize,
  accentProgress,
}: {
  size: number;
  duration: number;
  reverse?: boolean;
  opacity: number;
  dotSize: number;
  accentProgress: SharedValue<number>;
}) {
  const colors = useThemeColors();
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(reverse ? -1 : 1, {
        duration,
        easing: Easing.linear,
        reduceMotion: ReduceMotion.System,
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(rotation);
    };
  }, [duration, reverse, rotation]);

  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        accentProgress.value,
        [0, 1],
        [colors.neutral[700], colors.primary[500]],
      ),
      opacity,
      transform: [{ rotate: `${rotation.value * 360}deg` }],
    };
  });

  const animatedDotStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        accentProgress.value,
        [0, 1],
        [colors.neutral[100], colors.primary[300]],
      ),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          alignItems: "center",
        },
        animatedRingStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: -dotSize / 2,
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            shadowColor: colors.primary[500],
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 0 },
          },
          animatedDotStyle,
        ]}
      />
    </Animated.View>
  );
}

export default function TransferProgressScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { accentProgress } = useTransferContext();
  const {
    pendingTransfer,
    transferState,
    submitPendingTransfer,
    clearTransferFlow,
  } = useWalletContext();
  const pulse = useSharedValue(0);
  const drift = useSharedValue(0);
  const statusOpacity = useSharedValue(1);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!pendingTransfer || transferState.status !== "idle") {
      return;
    }

    void submitPendingTransfer();
  }, [pendingTransfer, submitPendingTransfer, transferState.status]);

  useEffect(() => {
    if (transferState.status === "succeeded") {
      router.replace("/success");
    }
  }, [router, transferState.status]);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.System,
        }),
        withTiming(0, {
          duration: 1400,
          easing: Easing.inOut(Easing.quad),
          reduceMotion: ReduceMotion.System,
        }),
      ),
      -1,
      false,
    );

    drift.value = withRepeat(
      withSequence(
        withTiming(-1, {
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          reduceMotion: ReduceMotion.System,
        }),
        withTiming(1, {
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          reduceMotion: ReduceMotion.System,
        }),
      ),
      -1,
      true,
    );

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const intervalId =
      transferState.status === "running"
        ? setInterval(() => {
            statusOpacity.value = withTiming(0, {
              duration: 180,
              easing: Easing.out(Easing.quad),
              reduceMotion: ReduceMotion.System,
            });

            timeoutId = setTimeout(() => {
              setStatusIndex(
                (current) => (current + 1) % STATUS_MESSAGES.length,
              );
              statusOpacity.value = withTiming(1, {
                duration: 240,
                easing: Easing.out(Easing.quad),
                reduceMotion: ReduceMotion.System,
              });
            }, 180);
          }, 2400)
        : undefined;

    return () => {
      cancelAnimation(pulse);
      cancelAnimation(drift);
      cancelAnimation(statusOpacity);
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [drift, pulse, statusOpacity, transferState.status]);

  const animatedClusterStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: drift.value * 8 }],
    };
  });

  const animatedGlowStyle = useAnimatedStyle(() => {
    const scale = 1.02 + pulse.value * 0.16;
    const opacity = 0.14 + pulse.value * 0.16;

    return {
      backgroundColor: interpolateColor(
        accentProgress.value,
        [0, 1],
        [colors.neutral[700], colors.primary[500]],
      ),
      opacity,
      transform: [{ scale }],
    };
  });

  const animatedCoreStyle = useAnimatedStyle(() => {
    const scale = 0.96 + pulse.value * 0.08;

    return {
      backgroundColor: interpolateColor(
        accentProgress.value,
        [0, 1],
        [colors.neutral[100], colors.primary[300]],
      ),
      transform: [{ scale }],
    };
  });

  const animatedStatusStyle = useAnimatedStyle(() => {
    return {
      opacity: statusOpacity.value,
      transform: [{ translateY: (1 - statusOpacity.value) * 6 }],
    };
  });

  const title = pendingTransfer ? "Transfer in progress" : "No transfer queued";
  const statusMessage = pendingTransfer
    ? transferState.status === "failed"
      ? (transferState.error ?? "The backend rejected the transfer.")
      : transferState.status === "running"
        ? STATUS_MESSAGES[statusIndex]
        : "Preparing transfer..."
    : "Go back to the send screen to prepare a transfer.";

  return (
    <View
      style={{
        flex: 1,
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 24,
        paddingBottom: 28,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 56,
        }}
      >
        <Animated.View
          style={[
            {
              width: 280,
              height: 280,
              alignItems: "center",
              justifyContent: "center",
            },
            animatedClusterStyle,
          ]}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 84,
                height: 84,
                borderRadius: 42,
              },
              animatedGlowStyle,
            ]}
          />

          <OrbitRing
            size={224}
            duration={9000}
            opacity={0.26}
            dotSize={12}
            accentProgress={accentProgress}
          />
          <OrbitRing
            size={176}
            duration={6800}
            reverse
            opacity={0.38}
            dotSize={10}
            accentProgress={accentProgress}
          />
          <OrbitRing
            size={132}
            duration={5200}
            opacity={0.54}
            dotSize={8}
            accentProgress={accentProgress}
          />

          <Animated.View
            style={[
              {
                width: 28,
                height: 28,
                borderRadius: 14,
                shadowColor: colors.primary[500],
                shadowOpacity: 0.4,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 0 },
              },
              animatedCoreStyle,
            ]}
          />
        </Animated.View>

        <View style={{ marginTop: 72, alignItems: "center", gap: 12 }}>
          <Text
            style={[
              fontStyle("heading", "large"),
              { color: colors.neutral[100] },
            ]}
          >
            {title}
          </Text>

          <Animated.Text
            style={[
              fontStyle("text", "medium"),
              {
                color: colors.neutral[300],
                minHeight: 24,
                textAlign: "center",
              },
              animatedStatusStyle,
            ]}
          >
            {statusMessage}
          </Animated.Text>
        </View>
      </View>

      {transferState.status === "failed" || !pendingTransfer ? (
        <View style={{ width: "100%" }}>
          <Button
            accentProgress={accentProgress}
            onPress={() => {
              if (transferState.status === "failed" && pendingTransfer) {
                void submitPendingTransfer();
                return;
              }

              router.replace(buildTransferRoute("send"));
              InteractionManager.runAfterInteractions(() => {
                clearTransferFlow();
              });
            }}
          >
            {transferState.status === "failed" ? "Retry" : "Back to transfer"}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
