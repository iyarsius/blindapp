import { useThemeColors } from "@/theme/useThemColors";
import {
  componentBorderRadius,
  componentSize,
  fontStyle,
  Size,
} from "@/theme/utils";
import { ReactNode, useState } from "react";
import {
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  interpolateColor,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

export interface InputProps extends TextInputProps {
  label?: string;
  size?: Size;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  borderColor?: string;
  accentProgress?: SharedValue<number>;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

export default function Input({
  label,
  size = "large",
  leftSlot,
  rightSlot,
  borderColor,
  accentProgress,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  placeholderTextColor,
  ...props
}: InputProps) {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const animatedContainerStyle = useAnimatedStyle(() => {
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

  return (
    <View style={{ width: "100%", gap: 8 }}>
      {label ? (
        <Text
          style={[
            fontStyle("textBold", "small"),
            { color: colors.neutral[300] },
          ]}
        >
          {label}
        </Text>
      ) : null}

      <Animated.View
        style={[
          {
            width: "100%",
             minHeight: componentSize(size),
             flexDirection: "row",
             alignItems: "center",
             gap: 10,
             paddingHorizontal: 14,
             borderRadius: componentBorderRadius(size),
             borderWidth: 1,
             borderColor:
               borderColor ??
               (accentProgress
                 ? colors.neutral[100]
                 : isFocused
                   ? colors.primary[500]
                   : colors.neutral[700]),
             backgroundColor: colors.neutral[900],
           },
           animatedContainerStyle,
           containerStyle,
         ]}
       >
        {leftSlot}

        <TextInput
          placeholderTextColor={placeholderTextColor ?? colors.neutral[500]}
          selectionColor={colors.primary[500]}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          style={[
            fontStyle("text", size),
            {
              flex: 1,
              color: colors.neutral[100],
              paddingVertical: 0,
            },
            inputStyle,
          ]}
          {...props}
        />

        {rightSlot}
      </Animated.View>
    </View>
  );
}
