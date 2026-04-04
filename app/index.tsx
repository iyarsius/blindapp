import BottomSheet from "@/components/BottomSheet";
import TokenSelector from "@/components/TokenSelector";
import TabSelector from "@/components/TabSelector";
import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Logo from "@/components/Logo";

export default function Home() {
  const colors = useThemeColors();
  const [tab, setTab] = useState("public");
  const [isTokenSheetVisible, setIsTokenSheetVisible] = useState(false);
  const [logoState, setLogoState] = useState<"normal" | "fragmented">("normal");
  const [logoRotate, setLogoRotate] = useState(false);

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
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          paddingTop: 30,
          paddingHorizontal: 100,
        }}
      >
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
          selectedTab={tab}
          onTabPress={(key) => {
            setLogoState(key === "public" ? "normal" : "fragmented");
            setTab(key);
          }}
        ></TabSelector>
        <View style={{ paddingTop: 80 }}>
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
            onPress={() => {
              setIsTokenSheetVisible(true);
            }}
          />
        </View>
      </View>
      <View
        style={{
          paddingTop: 50,
          paddingHorizontal: 24,
          width: "100%",
          gap: 24,
        }}
      >
        <Input placeholder="0x destination address"></Input>
        <Button onPress={() => {}}>Send</Button>
      </View>

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
