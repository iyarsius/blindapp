import Logo from "@/components/Logo";
import TabSelector from "@/components/TabSelector";
import { TransferProvider } from "@/components/TransferContext";
import { WalletProvider } from "@/components/WalletContext";
import {
  buildTransferRoute,
  normalizeTransferAction,
  transferScopeTabs,
  TransferScope,
} from "@/constants/transfer";
import { useThemeColors } from "@/theme/useThemColors";
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Easing, useSharedValue, withTiming } from "react-native-reanimated";

export default function TransferLayout() {
  const colors = useThemeColors();
  const router = useRouter();
  const pathname = usePathname();
  const currentRoute = pathname.split("/").at(-1);
  const isStatusScreen = currentRoute === "progress" || currentRoute === "success";
  const action = normalizeTransferAction(currentRoute);
  const [scope, setScope] = useState<TransferScope>("public");
  const [hasPressedLogo, setHasPressedLogo] = useState(false);
  const accentProgress = useSharedValue(scope === "private" ? 1 : 0);

  useEffect(() => {
    accentProgress.value = withTiming(scope === "private" ? 1 : 0, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [accentProgress, scope]);

  return (
    <TransferProvider value={{ scope, setScope, accentProgress }}>
      <WalletProvider>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background[900],
            paddingHorizontal: 12,
            paddingTop: 50,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "100%",
              minHeight: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isStatusScreen ? null : (
              <Pressable
                onPress={() => {
                  setHasPressedLogo(true);
                  router.replace(
                    isStatusScreen
                      ? buildTransferRoute("send")
                      : buildTransferRoute(action === "send" ? "receive" : "send"),
                  );
                }}
              >
                <Logo
                  attractAttention={!hasPressedLogo}
                  rotated={action === "receive"}
                  state={scope === "private" ? "fragmented" : "normal"}
                />
              </Pressable>
            )}
          </View>
          {isStatusScreen ? null : (
            <View
              style={{
                width: "100%",
                paddingHorizontal: 100,
                paddingTop: 50,
                gap: 16,
              }}
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
          )}
          <View style={{ flex: 1, width: "100%" }}>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: "fade",
                contentStyle: { backgroundColor: colors.background[900] },
              }}
            >
              <Stack.Screen name="send" />
              <Stack.Screen name="receive" />
              <Stack.Screen name="progress" />
              <Stack.Screen name="success" />
            </Stack>
          </View>
        </View>
      </WalletProvider>
    </TransferProvider>
  );
}
