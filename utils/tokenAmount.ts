export function parseAmountToBaseUnits(value: string, decimals: number) {
  const normalizedValue = value.trim().replace(",", ".");

  if (!/^\d*(\.\d*)?$/.test(normalizedValue) || normalizedValue.length === 0) {
    throw new Error("Enter a valid amount.");
  }

  const [wholePart = "0", fractionPart = ""] = normalizedValue.split(".");
  if (fractionPart.length > decimals) {
    throw new Error(`This token supports up to ${decimals} decimals.`);
  }

  const sanitizedWhole = wholePart.replace(/^0+(?=\d)/, "") || "0";
  const paddedFraction = fractionPart.padEnd(decimals, "0");
  const baseUnits = `${sanitizedWhole}${paddedFraction}`.replace(/^0+(?=\d)/, "");

  return baseUnits.length > 0 ? baseUnits : "0";
}

export function formatBaseUnits(
  amount: string | bigint | null | undefined,
  decimals: number,
  maximumFractionDigits = 4,
) {
  if (amount === null || amount === undefined) {
    return "0";
  }

  const rawValue = typeof amount === "bigint" ? amount.toString() : amount;
  if (!/^\d+$/.test(rawValue)) {
    return "0";
  }

  const normalizedValue = rawValue.replace(/^0+(?=\d)/, "") || "0";
  if (decimals === 0) {
    return normalizedValue;
  }

  const paddedValue = normalizedValue.padStart(decimals + 1, "0");
  const wholePart = paddedValue.slice(0, -decimals) || "0";
  const fractionPart = paddedValue
    .slice(-decimals)
    .replace(/0+$/, "")
    .slice(0, maximumFractionDigits);

  return fractionPart ? `${wholePart}.${fractionPart}` : wholePart;
}
