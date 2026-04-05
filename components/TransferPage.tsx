import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import CopyAddressButton from "@/components/CopyAddressButton";
import Input from "@/components/Input";
import ReceiveQRCode from "@/components/ReceiveQRCode";
import TokenSelector from "@/components/TokenSelector";
import { useTransferContext } from "@/components/TransferContext";
import { TransferAction } from "@/constants/transfer";
import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function TransferPage({ action }: { action: TransferAction }) {
  const colors = useThemeColors();
  const { scope, accentProgress } = useTransferContext();
  const isFocused = useIsFocused();
  const [isTokenSheetVisible, setIsTokenSheetVisible] = useState(false);
  const opacity = useSharedValue(isFocused ? 1 : 0);
  const scale = useSharedValue(isFocused ? 1 : 0.96);
  const translateY = useSharedValue(isFocused ? 0 : 14);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, {
      duration: isFocused ? 260 : 140,
      easing: Easing.out(Easing.cubic),
    });

    scale.value = withSpring(isFocused ? 1 : 0.96, {
      stiffness: 220,
      damping: 18,
      mass: 0.9,
      overshootClamping: false,
      reduceMotion: ReduceMotion.System,
    });

    translateY.value = withSpring(isFocused ? 0 : 14, {
      stiffness: 240,
      damping: 20,
      mass: 0.95,
      overshootClamping: false,
      reduceMotion: ReduceMotion.System,
    });
  }, [isFocused, opacity, scale, translateY]);

  const animatedPageStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    };
  });

  const addressPlaceholder =
    scope === "private"
      ? "unlink1... destination address"
      : "0x destination address";
  const receiveAddress =
    scope === "private"
      ? "unlink1qq80r8m2k3v8n6s5u7x4p9z2f3j6c1a5w0yq"
      : "0x7E57B1Ff9A0D13C4E5f67890123456789AbCdEf0";

  return (
    <Animated.View style={[{ flex: 1, alignItems: "center", width: "100%" }, animatedPageStyle]}>
      {action === "send" ? (
        <>
          <View style={{ flex: 1, width: "100%" }}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <View>
                <Text
                  style={[
                    fontStyle("heading", "giant"),
                    { color: colors.neutral[500], fontSize: 52 },
                  ]}
                >
                  0.00
                </Text>
              </View>
              <View style={{ paddingTop: 30 }}>
                <TokenSelector
                  ticker="ETH"
                  accentProgress={accentProgress}
                  onPress={() => {
                    setIsTokenSheetVisible(true);
                  }}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              paddingHorizontal: 24,
              paddingBottom: 24,
              width: "100%",
              gap: 24,
            }}
          >
            <Input
              accentProgress={accentProgress}
              placeholder={addressPlaceholder}
            />
            <Button accentProgress={accentProgress} onPress={() => {}}>
              Send
            </Button>
          </View>
        </>
      ) : (
        <>
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            <ReceiveQRCode
              address={receiveAddress}
              scope={scope}
              accentProgress={accentProgress}
            />
          </View>
          <View
            style={{
              width: "100%",
              paddingHorizontal: 24,
              paddingBottom: 24,
            }}
          >
            <CopyAddressButton
              address={receiveAddress}
              accentProgress={accentProgress}
            />
          </View>
        </>
      )}

      {action === "send" ? (
        <BottomSheet
          visible={isTokenSheetVisible}
          title="Select token"
          onClose={() => {
            setIsTokenSheetVisible(false);
          }}
        >
          <Text
            style={[
              fontStyle("text", "medium"),
              { color: colors.neutral[300] },
            ]}
          >
            Token list coming next.
          </Text>
        </BottomSheet>
      ) : null}
    </Animated.View>
  );
}
