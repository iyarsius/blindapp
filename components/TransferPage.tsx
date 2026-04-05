import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import CopyAddressButton from "@/components/CopyAddressButton";
import Input from "@/components/Input";
import KeyboardSpacer from "@/components/KeyboardSpacer";
import ReceiveQRCode from "@/components/ReceiveQRCode";
import TokenSelector from "@/components/TokenSelector";
import { useTransferContext } from "@/components/TransferContext";
import { useWalletContext } from "@/components/WalletContext";
import { TransferAction } from "@/constants/transfer";
import { useThemeColors } from "@/theme/useThemColors";
import { fontStyle } from "@/theme/utils";
import { formatBaseUnits, parseAmountToBaseUnits } from "@/utils/tokenAmount";
import { useIsFocused } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
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
  const router = useRouter();
  const { scope, accentProgress } = useTransferContext();
  const {
    isInitializing,
    walletError,
    walletWarning,
    privateAddress,
    publicAddress,
    tokens,
    selectedToken,
    privateBalancesByToken,
    faucetState,
    setSelectedToken,
    refreshWallet,
    requestTestTokens,
    queueTransfer,
  } = useWalletContext();
  const isFocused = useIsFocused();
  const [isTokenSheetVisible, setIsTokenSheetVisible] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeKeyboardTarget, setActiveKeyboardTarget] = useState<
    "amount" | "address" | null
  >(null);
  const opacity = useSharedValue(isFocused ? 1 : 0);
  const scale = useSharedValue(isFocused ? 1 : 0.96);
  const translateY = useSharedValue(isFocused ? 0 : 14);

  const handleAmountChange = useCallback((value: string) => {
    const sanitized = value.replace(",", ".").replace(/[^\d.]/g, "");

    if ((sanitized.match(/\./g) ?? []).length > 1) {
      return;
    }

    setFormError(null);
    setAmount(sanitized);
  }, []);

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
  const receiveAddress = scope === "private" ? privateAddress : publicAddress;
  const accentColor =
    scope === "private" ? colors.primary[500] : colors.neutral[100];
  const selectedTokenBalance = selectedToken
    ? (privateBalancesByToken[selectedToken.address.toLowerCase()] ?? "0")
    : "0";
  const insufficientBalanceError =
    "Amount exceeds the available private balance.";
  let amountError: string | null = null;

  if (selectedToken && amount.trim().length > 0) {
    try {
      const amountBaseUnits = parseAmountToBaseUnits(
        amount,
        selectedToken.decimals,
      );

      if (BigInt(amountBaseUnits) > BigInt(selectedTokenBalance)) {
        amountError = insufficientBalanceError;
      }
    } catch {
      amountError = null;
    }
  }

  const submitDisabled =
    isInitializing ||
    Boolean(walletError) ||
    !selectedToken ||
    amount.trim().length === 0 ||
    recipient.trim().length === 0 ||
    Boolean(amountError);

  function handleSendPress() {
    if (!selectedToken) {
      setFormError("No token is available yet.");
      return;
    }

    try {
      const trimmedRecipient = recipient.trim();
      const amountBaseUnits = parseAmountToBaseUnits(
        amount,
        selectedToken.decimals,
      );

      if (BigInt(amountBaseUnits) <= 0n) {
        throw new Error("Amount must be greater than zero.");
      }

      if (BigInt(amountBaseUnits) > BigInt(selectedTokenBalance)) {
        throw new Error(insufficientBalanceError);
      }

      if (scope === "private" && !trimmedRecipient.startsWith("unlink")) {
        throw new Error("Private transfers require an `unlink1...` address.");
      }

      if (scope === "public" && !/^0x[a-fA-F0-9]{40}$/.test(trimmedRecipient)) {
        throw new Error("Public transfers require a valid EVM address.");
      }

      queueTransfer({
        scope,
        recipient: trimmedRecipient,
        amountInput: amount,
        amountBaseUnits,
        token: selectedToken,
      });
      router.push("/progress");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to prepare transfer.",
      );
    }
  }

  async function handleRefresh() {
    if (isInitializing || isRefreshing) {
      return;
    }

    setIsRefreshing(true);

    try {
      await refreshWallet();
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <Animated.View
      style={[
        { flex: 1, alignItems: "center", width: "100%" },
        animatedPageStyle,
      ]}
    >
      {action === "send" ? (
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                void handleRefresh();
              }}
              tintColor={accentColor}
              colors={[accentColor]}
              progressBackgroundColor={colors.background[900]}
            />
          }
        >
          <View style={{ flex: 1, width: "100%" }}>
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: 24,
              }}
            >
              <View style={{ alignItems: "center", gap: 16 }}>
                <Text
                  style={[
                    fontStyle("textBold", "small"),
                    { color: colors.neutral[700] },
                  ]}
                >
                  {isInitializing
                    ? "Preparing wallet..."
                    : `Available: ${formatBaseUnits(
                        selectedTokenBalance,
                        selectedToken?.decimals ?? 18,
                      )} ${selectedToken?.symbol ?? ""}`}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  <TextInput
                    value={amount}
                    onChangeText={handleAmountChange}
                    onFocus={() => {
                      setIsAmountFocused(true);
                      setActiveKeyboardTarget("amount");
                    }}
                    onBlur={() => {
                      setIsAmountFocused(false);
                      setActiveKeyboardTarget(null);
                    }}
                    keyboardType="decimal-pad"
                    cursorColor={accentColor}
                    selectionColor={accentColor}
                    placeholder={isAmountFocused ? "" : "0.00"}
                    placeholderTextColor={colors.neutral[500]}
                    style={[
                      fontStyle("heading", "giant"),
                      {
                        minWidth: 140,
                        color: colors.neutral[100],
                        fontSize: 52,
                        lineHeight: 56,
                        textAlign: "center",
                        fontVariant: ["tabular-nums"],
                        paddingVertical: 0,
                        includeFontPadding: false,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={{ paddingTop: 16 }}>
                <TokenSelector
                  ticker={selectedToken?.symbol ?? "..."}
                  accentProgress={accentProgress}
                  onPress={() => {
                    if (tokens.length > 0) {
                      setIsTokenSheetVisible(true);
                    }
                  }}
                />
              </View>
            </View>
          </View>
          <View
            style={{
              justifyContent: "flex-end",
              paddingHorizontal: 16,
              paddingBottom: 24,
              width: "100%",
            }}
          >
            <KeyboardSpacer enabled={activeKeyboardTarget === "amount"} />
            <View style={{ paddingBottom: 24 }}>
              <Input
                accentProgress={accentProgress}
                cursorColor={accentColor}
                placeholder={addressPlaceholder}
                selectionColor={accentColor}
                value={recipient}
                onChangeText={(value) => {
                  setFormError(null);
                  setRecipient(value);
                }}
                onFocus={() => {
                  setActiveKeyboardTarget("address");
                }}
                onBlur={() => {
                  setActiveKeyboardTarget(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {walletError || formError || amountError ? (
              <Text
                style={[
                  fontStyle("text", "small"),
                  {
                    color: colors.primary[300],
                    paddingBottom: 16,
                  },
                ]}
              >
                {walletError ?? formError ?? amountError}
              </Text>
            ) : null}
            {walletWarning && !walletError ? (
              <Text
                style={[
                  fontStyle("text", "small"),
                  {
                    color: colors.neutral[300],
                    paddingBottom: 16,
                  },
                ]}
              >
                {walletWarning}
              </Text>
            ) : null}
            <KeyboardSpacer enabled={activeKeyboardTarget === "address"} />
            <Button
              accentProgress={accentProgress}
              disabled={submitDisabled}
              onPress={handleSendPress}
            >
              Send
            </Button>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={{ width: "100%" }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          alwaysBounceVertical
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                void handleRefresh();
              }}
              tintColor={accentColor}
              colors={[accentColor]}
              progressBackgroundColor={colors.background[900]}
            />
          }
        >
          <View
            style={{
              flex: 1,
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 24,
            }}
          >
            {receiveAddress ? (
              <ReceiveQRCode
                address={receiveAddress}
                scope={scope}
                accentProgress={accentProgress}
              />
            ) : (
              <Text
                style={[
                  fontStyle("text", "medium"),
                  { color: colors.neutral[300], textAlign: "center" },
                ]}
              >
                {walletError ?? "Preparing your wallet address..."}
              </Text>
            )}
          </View>

          {receiveAddress ? (
            <View
              style={{
                width: "100%",
                paddingHorizontal: 16,
                paddingBottom: 24,
                gap: 12,
              }}
            >
              <Button
                accentProgress={accentProgress}
                disabled={isInitializing || faucetState.status === "running"}
                onPress={() => {
                  void requestTestTokens(scope);
                }}
              >
                Faucet TEST
              </Button>
              {faucetState.status === "succeeded" ? (
                <Text
                  style={[
                    fontStyle("text", "small"),
                    { color: colors.neutral[300], textAlign: "center" },
                  ]}
                >
                  TEST tokens requested successfully.
                </Text>
              ) : null}
              {faucetState.status === "failed" ? (
                <Text
                  style={[
                    fontStyle("text", "small"),
                    { color: colors.primary[300], textAlign: "center" },
                  ]}
                >
                  {faucetState.error}
                </Text>
              ) : null}
              {walletWarning && !walletError ? (
                <Text
                  style={[
                    fontStyle("text", "small"),
                    { color: colors.neutral[300], textAlign: "center" },
                  ]}
                >
                  {walletWarning}
                </Text>
              ) : null}
              <CopyAddressButton
                address={receiveAddress}
                accentProgress={accentProgress}
              />
            </View>
          ) : null}
        </ScrollView>
      )}

      {action === "send" ? (
        <BottomSheet
          visible={isTokenSheetVisible}
          title="Select token"
          onClose={() => {
            setIsTokenSheetVisible(false);
          }}
        >
          {tokens.length === 0 ? (
            <Text
              style={[
                fontStyle("text", "medium"),
                { color: colors.neutral[300] },
              ]}
            >
              Loading tokens...
            </Text>
          ) : (
            <View style={{ gap: 10 }}>
              {tokens.map((token) => {
                const isSelected = selectedToken?.address === token.address;
                const balance =
                  privateBalancesByToken[token.address.toLowerCase()] ?? "0";

                return (
                  <Pressable
                    key={token.address}
                    accessibilityRole="button"
                    onPress={() => {
                      setSelectedToken(token);
                      setIsTokenSheetVisible(false);
                    }}
                    style={{
                      borderWidth: 1,
                      borderColor: isSelected
                        ? colors.primary[500]
                        : colors.neutral[700],
                      borderRadius: 20,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: colors.background[900],
                      gap: 4,
                    }}
                  >
                    <Text
                      style={[
                        fontStyle("textBold", "medium"),
                        { color: colors.neutral[100] },
                      ]}
                    >
                      {token.symbol}
                    </Text>
                    <Text
                      style={[
                        fontStyle("text", "small"),
                        { color: colors.neutral[300] },
                      ]}
                    >
                      {token.name}
                    </Text>
                    <Text
                      style={[
                        fontStyle("text", "small"),
                        { color: colors.neutral[500] },
                      ]}
                    >
                      Private balance:{" "}
                      {formatBaseUnits(balance, token.decimals)} {token.symbol}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </BottomSheet>
      ) : null}
    </Animated.View>
  );
}
