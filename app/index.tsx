import BottomSheet from "@/components/BottomSheet";
import KeyboardSpacer from "@/components/KeyboardSpacer";
import TokenSelector from "@/components/TokenSelector";
import TabSelector from "@/components/TabSelector";
import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Logo from "@/components/Logo";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

export default function Home() {
  const colors = useThemeColors();
  const [tab, setTab] = useState("public");
  const [isTokenSheetVisible, setIsTokenSheetVisible] = useState(false);
  const [logoState, setLogoState] = useState<"normal" | "fragmented">("normal");
  const [logoRotate, setLogoRotate] = useState(false);
  const accentProgress = useSharedValue(tab === "private" ? 1 : 0);
  const destinationPlaceholder =
    tab === "private"
      ? "unlink1... destination address"
      : "0x destination address";

  useEffect(() => {
    accentProgress.value = withTiming(tab === "private" ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [accentProgress, tab]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background[900],
        paddingHorizontal: 12,
        paddingTop: 30,
        alignItems: "center",
      }}
    >
      <Pressable onPress={() => setLogoRotate(!logoRotate)}>
        <Logo rotated={logoRotate} state={logoState}></Logo>
      </Pressable>
      <View style={{ width: "100%", paddingHorizontal: 100, paddingTop: 40 }}>
        <TabSelector
          tabs={[
            {
              label: "Public",
              key: "public",
            },
            {
              label: "Private",
              key: "private",
            },
          ]}
          size="small"
          accentProgress={accentProgress}
          selectedTab={tab}
          onTabPress={(key) => {
            setLogoState(key === "public" ? "normal" : "fragmented");
            setTab(key);
          }}
        ></TabSelector>
      </View>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          width: "100%",
        }}
      >
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
            flex: 1,
            justifyContent: "flex-end",
            paddingHorizontal: 24,
            paddingBottom: 24,
            width: "100%",
            gap: 24,
          }}
        >
          <Input
            accentProgress={accentProgress}
            placeholder={destinationPlaceholder}
          ></Input>
          <Button accentProgress={accentProgress} onPress={() => {}}>
            Send
          </Button>
        </View>
      </View>

      <KeyboardSpacer />

      <BottomSheet
        visible={isTokenSheetVisible}
        title="Select token"
        onClose={() => {
          setIsTokenSheetVisible(false);
        }}
      >
        <Text
          style={[fontStyle("text", "medium"), { color: colors.neutral[300] }]}
        >
          Token list coming next.
        </Text>
      </BottomSheet>
    </View>
  );
}
