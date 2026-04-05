import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import Input from "@/components/Input";
import TokenSelector from "@/components/TokenSelector";
import { useTransferContext } from "@/components/TransferContext";
import { TransferAction } from "@/constants/transfer";
import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { useState } from "react";
import { Text, View } from "react-native";

export default function TransferPage({ action }: { action: TransferAction }) {
  const colors = useThemeColors();
  const { scope, accentProgress } = useTransferContext();
  const [isTokenSheetVisible, setIsTokenSheetVisible] = useState(false);

  const addressPlaceholder =
    scope === "private"
      ? "unlink1... destination address"
      : "0x destination address";
  const receivePlaceholder =
    scope === "private"
      ? "unlink1... your receive address"
      : "0x your receive address";

  return (
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
        {action === "send" ? (
          <Input accentProgress={accentProgress} placeholder={addressPlaceholder} />
        ) : (
          <Input
            label="Receive address"
            accentProgress={accentProgress}
            placeholder={receivePlaceholder}
          />
        )}
        <Button accentProgress={accentProgress} onPress={() => {}}>
          {action === "send" ? "Send" : "Receive"}
        </Button>
      </View>

      <BottomSheet
        visible={isTokenSheetVisible}
        title="Select token"
        onClose={() => {
          setIsTokenSheetVisible(false);
        }}
      >
        <Text style={[fontStyle("text", "medium"), { color: colors.neutral[300] }]}>
          Token list coming next.
        </Text>
      </BottomSheet>
    </View>
  );
}
