export const formatPrice = (amount) => {
  const defaultCurrency = JSON.parse(localStorage?.defaultCurrency ?? "{}");
  const price = Number(amount || 0)
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&,");
  const currencySymbol = defaultCurrency?.symbol || "$";
  const currencyPosition = defaultCurrency?.position || "before";

  return currencyPosition === "after"
    ? `${price}${currencySymbol}`
    : `${currencySymbol}${price}`;
};
