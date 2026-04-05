import { TransferScope } from "@/constants/transfer";
import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { generateStyledQRCodeSvg } from "@/utils/generateQRCodeSvg";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { SvgXml } from "react-native-svg";

export default function ReceiveQRCode({
  address,
  scope,
  accentProgress,
}: {
  address: string;
  scope: TransferScope;
  accentProgress?: SharedValue<number>;
}) {
  const colors = useThemeColors();
  const [qrXml, setQrXml] = useState<string | null>(null);
  const qrColor = scope === "private" ? colors.primary[500] : "#111111";
  const outerEyeColor = scope === "private" ? colors.primary[700] : "#111111";
  const innerEyeColor = scope === "private" ? colors.primary[500] : "#111111";

  useEffect(() => {
    let isMounted = true;

    generateStyledQRCodeSvg(address, {
      size: 720,
      color: qrColor,
      backgroundColor: "#F7F4FB",
      outerEyeColor,
      innerEyeColor,
      outerEyeBorderRadius: 42,
      innerEyeBorderRadius: 16,
    })
      .then((xml: string) => {
        if (isMounted) {
          setQrXml(xml);
        }
      })
      .catch(() => {
        if (isMounted) {
          setQrXml(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [address, innerEyeColor, outerEyeColor, qrColor]);

  const cardAnimatedStyle = useAnimatedStyle(() => {
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

  const badgeAnimatedStyle = useAnimatedStyle(() => {
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

  const displayAddress = useMemo(() => {
    if (address.length <= 22) {
      return address;
    }

    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  }, [address]);

  return (
    <Animated.View
      style={[
        {
          width: 296,
          padding: 18,
          borderRadius: 32,
          borderWidth: 1,
          borderColor: colors.neutral[700],
          backgroundColor: colors.neutral[900],
          gap: 18,
        },
        cardAnimatedStyle,
      ]}
    >
      <View
        style={{
          width: "100%",
          aspectRatio: 1,
          borderRadius: 28,
          padding: 20,
          backgroundColor: "#F7F4FB",
          overflow: "hidden",
        }}
      >
        {scope === "private" ? (
          <>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 84,
                height: 84,
                borderTopLeftRadius: 24,
                backgroundColor: colors.primary[100],
                opacity: 0.85,
              }}
            />
            <View
              style={{
                position: "absolute",
                right: 0,
                bottom: 0,
                width: 84,
                height: 84,
                borderBottomRightRadius: 24,
                backgroundColor: colors.primary[300],
                opacity: 0.22,
              }}
            />
          </>
        ) : null}
        {qrXml ? (
          <SvgXml xml={qrXml} width="100%" height="100%" />
        ) : (
          <View
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 20,
              backgroundColor: colors.neutral[100],
            }}
          />
        )}
      </View>

      <View style={{ alignItems: "center", gap: 10 }}>
        <Animated.View
          style={[
            {
              borderRadius: 999,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: colors.neutral[100],
            },
            badgeAnimatedStyle,
          ]}
        >
          <Text style={[fontStyle("textBold", "small"), { color: colors.background[900] }]}>
            {scope === "private" ? "PRIVATE RECEIVE" : "PUBLIC RECEIVE"}
          </Text>
        </Animated.View>
        <Text style={[fontStyle("text", "medium"), { color: colors.neutral[300] }]}>
          {displayAddress}
        </Text>
      </View>
    </Animated.View>
  );
}
