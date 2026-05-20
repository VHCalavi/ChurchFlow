export function formatCurrency(amount: number, locale: string = "fr-FR", currency: string = "XOF"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(amount);
}
