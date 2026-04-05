import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useThemeColors } from "@/theme/useThemColors";
import { Keyboard, TouchableWithoutFeedback } from "react-native";
import KeyboardRoot from "@/components/KeyboardRoot";

function AppContent() {
  const colors = useThemeColors();

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <TouchableWithoutFeedback
        accessible={false}
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: colors.background[900] }}
        >
          <Stack screenOptions={{ headerShown: false, animation: "none" }} />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    inter: require("../assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardRoot>
        <AppContent />
      </KeyboardRoot>
    </GestureHandlerRootView>
  );
}
