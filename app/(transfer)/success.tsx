import Button from "@/components/Button";
import { useTransferContext } from "@/components/TransferContext";
import { useWalletContext } from "@/components/WalletContext";
import { buildTransferRoute } from "@/constants/transfer";
import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { formatBaseUnits } from "@/utils/tokenAmount";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { InteractionManager, Text, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const SUCCESS_GREEN = "#4ADE80";

export default function TransferSuccessScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { accentProgress } = useTransferContext();
  const { pendingTransfer, clearTransferFlow } = useWalletContext();
  const haloScale = useSharedValue(0.88);
  const haloOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.84);
  const badgeOpacity = useSharedValue(0);
  const checkProgress = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    haloScale.value = withTiming(1, {
      duration: 360,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
    haloOpacity.value = withTiming(1, {
      duration: 260,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
    badgeScale.value = withSpring(1, {
      stiffness: 240,
      damping: 18,
      mass: 0.9,
      reduceMotion: ReduceMotion.System,
    });
    badgeOpacity.value = withTiming(1, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.System,
    });
    checkProgress.value = withDelay(
      120,
      withTiming(1, {
        duration: 420,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
    contentOpacity.value = withDelay(
      120,
      withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [
    badgeOpacity,
    badgeScale,
    checkProgress,
    contentOpacity,
    haloOpacity,
    haloScale,
  ]);

  const animatedHaloStyle = useAnimatedStyle(() => ({
    backgroundColor: SUCCESS_GREEN,
    opacity: haloOpacity.value * 0.18,
    transform: [{ scale: haloScale.value }],
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    backgroundColor: SUCCESS_GREEN,
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const animatedCheckStyle = useAnimatedStyle(() => ({
    opacity: checkProgress.value,
    transform: [
      { scale: 0.72 + checkProgress.value * 0.28 },
      { translateY: (1 - checkProgress.value) * 6 },
    ],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: (1 - contentOpacity.value) * 12 }],
  }));

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
        <View
          style={{
            width: 220,
            height: 220,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Animated.View
            style={[
              {
                position: "absolute",
                width: 164,
                height: 164,
                borderRadius: 82,
              },
              animatedHaloStyle,
            ]}
          />
          <Animated.View
            style={[
              {
                width: 96,
                height: 96,
                borderRadius: 48,
                alignItems: "center",
                justifyContent: "center",
                shadowColor: colors.primary[500],
                shadowOpacity: 0.28,
                shadowRadius: 18,
                shadowOffset: { width: 0, height: 0 },
              },
              animatedBadgeStyle,
            ]}
          >
            <Animated.View style={animatedCheckStyle}>
              <MaterialIcons
                name="check"
                size={56}
                color={colors.background[900]}
              />
            </Animated.View>
          </Animated.View>
        </View>

        <Animated.View
          style={[
            { marginTop: 40, alignItems: "center", gap: 12 },
            animatedContentStyle,
          ]}
        >
          <Text
            style={[
              fontStyle("heading", "large"),
              { color: colors.neutral[100] },
            ]}
          >
            Transfer complete
          </Text>
          <Text
            style={[
              fontStyle("text", "medium"),
              {
                color: colors.neutral[300],
                textAlign: "center",
                maxWidth: 280,
              },
            ]}
          >
            {pendingTransfer
              ? `${formatBaseUnits(
                  pendingTransfer.amountBaseUnits,
                  pendingTransfer.token.decimals,
                )} ${pendingTransfer.token.symbol} delivered ${
                  pendingTransfer.scope === "private" ? "privately" : "publicly"
                }.`
              : "Funds delivered successfully. You can start another transfer whenever you're ready."}
          </Text>
        </Animated.View>
      </View>

      <View style={{ width: "100%" }}>
        <Button
          accentProgress={accentProgress}
          onPress={() => {
            router.replace(buildTransferRoute("send"));
            InteractionManager.runAfterInteractions(() => {
              clearTransferFlow();
            });
          }}
        >
          Done
        </Button>
      </View>
    </View>
  );
}
