import KeyboardSpacer from "@/components/KeyboardSpacer";
import Logo from "@/components/Logo";
import TabSelector from "@/components/TabSelector";
import { TransferProvider } from "@/components/TransferContext";
import {
  buildTransferRoute,
  normalizeTransferAction,
  transferScopeTabs,
  TransferScope,
} from "@/constants/transfer";
import { useThemeColors } from "@/theme/useThemColors";
import { Slot, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

export default function TransferLayout() {
  const colors = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const action = normalizeTransferAction(pathname.split("/").at(-1));
  const [scope, setScope] = useState<TransferScope>("public");
  const accentProgress = useSharedValue(scope === "private" ? 1 : 0);

  useEffect(() => {
    accentProgress.value = withTiming(scope === "private" ? 1 : 0, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });
  }, [accentProgress, scope]);

  return (
    <TransferProvider value={{ scope, setScope, accentProgress }}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background[900],
          paddingHorizontal: 12,
          paddingTop: 30,
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => {
            router.replace(buildTransferRoute(action === "send" ? "receive" : "send"));
          }}
        >
          <Logo
            rotated={action === "receive"}
            state={scope === "private" ? "fragmented" : "normal"}
          />
        </Pressable>
        <View
          style={{ width: "100%", paddingHorizontal: 100, paddingTop: 40, gap: 16 }}
        >
          <TabSelector
            tabs={transferScopeTabs}
            size="small"
            accentProgress={accentProgress}
            selectedTab={scope}
            onTabPress={(nextScope) => {
              setScope(nextScope as TransferScope);
            }}
          />
        </View>
        <View style={{ flex: 1, width: "100%" }}>
          <Slot />
        </View>
        <KeyboardSpacer />
      </View>
    </TransferProvider>
  );
}
