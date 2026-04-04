import { useThemeColors } from "@/theme/useThemColors";
import {
  componentBorderRadius,
  componentSize,
  fontStyle,
  Size,
} from "@/theme/utils";
import { useEffect } from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

type TabSelectorVariant = "primary" | "secondary" | "neutral";

export interface TabItem {
  key: string;
  label: string;
}

export interface TabSelectorProps {
  tabs: readonly TabItem[];
  onTabPress: (tabKey: string) => void;
  selectedTab?: string;
  size?: Size;
  variant?: TabSelectorVariant;
  style?: StyleProp<ViewStyle>;
}

const getVariantColors = (
  colors: ReturnType<typeof useThemeColors>,
  variant: TabSelectorVariant,
) => {
  if (variant === "secondary") {
    return {
      background: colors.primary[900],
      text: colors.primary[500],
      textInactive: colors.neutral[500],
    };
  }

  if (variant === "neutral") {
    return {
      background: colors.neutral[700],
      text: colors.neutral[100],
      textInactive: colors.neutral[500],
    };
  }

  return {
    background: colors.primary[500],
    text: colors.primary[900],
    textInactive: colors.neutral[300],
  };
};

export default function TabSelector({
  tabs,
  onTabPress,
  selectedTab,
  size = "medium",
  variant = "primary",
  style,
}: TabSelectorProps) {
  const colors = useThemeColors();
  const tabColors = getVariantColors(colors, variant);
  const tabCount = Math.max(tabs.length, 1);
  const activeTab = selectedTab ?? tabs[0]?.key;
  const activeIndex = Math.max(
    tabs.findIndex((tab) => tab.key === activeTab),
    0,
  );
  const containerWidth = useSharedValue(0);
  const selectedIndex = useSharedValue(activeIndex);

  useEffect(() => {
    selectedIndex.value = withSpring(activeIndex, {
      stiffness: 900,
      damping: 120,
      mass: 4,
      overshootClamping: false,
      energyThreshold: 6e-9,
      velocity: 0,
      reduceMotion: ReduceMotion.System,
    });
  }, [activeIndex, selectedIndex]);

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    const inset = 4;
    const availableWidth = Math.max(containerWidth.value - inset * 2, 0);
    const tabWidth = availableWidth / tabCount;

    return {
      width: tabWidth,
      transform: [{ translateX: inset + selectedIndex.value * tabWidth }],
    };
  });

  if (tabs.length === 0) {
    return null;
  }

  return (
    <View
      onLayout={(event) => {
        containerWidth.value = event.nativeEvent.layout.width;
      }}
      style={[
        {
          position: "relative",
          flexDirection: "row",
          alignItems: "center",
          padding: 4,
          borderRadius: 30,
          backgroundColor: colors.neutral[900],
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: "absolute",
            top: 4,
            bottom: 4,
            borderRadius: 30,
            backgroundColor: tabColors.background,
          },
          backgroundAnimatedStyle,
        ]}
      />
      {tabs.map((tab) => {
        const isSelected = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            onPress={() => onTabPress(tab.key)}
            style={{
              flex: 1,
              minHeight: componentSize(size),
              borderRadius: componentBorderRadius(size),
              alignItems: "center",
              justifyContent: "center",
              paddingHorizontal: 12,
              backgroundColor: "transparent",
            }}
          >
            <Text
              style={[
                fontStyle(isSelected ? "textBold" : "text", size),
                {
                  color: isSelected ? tabColors.text : tabColors.textInactive,
                },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
