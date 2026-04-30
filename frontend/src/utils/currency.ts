export type Currency = "CUP" | "MLC" | "USD" | "EUR";

export const CURRENCY_LABELS: Record<Currency, string> = {
  CUP: "Peso Cubano (CUP)",
  MLC: "Peso Convertible (MLC)",
  USD: "Dólar (USD)",
  EUR: "Euro (EUR)",
};

const LOCALE_MAP: Record<Currency, string> = {
  CUP: "es-CU",
  MLC: "es-CU",
  USD: "en-US",
  EUR: "de-DE",
};

export function formatPrice(price: number, currency: Currency = "CUP"): string {
  return new Intl.NumberFormat(LOCALE_MAP[currency], {
    style: "currency",
    currency: currency,
  }).format(price);
}

export function getCurrencyIcon(currency: Currency | string): string {
  switch (currency) {
    case "CUP":
      return "CUP";
    case "MLC":
      return "MLC";
    case "USD":
      return "$";
    case "EUR":
      return "€";
    default:
      return "CUP";
  }
}
