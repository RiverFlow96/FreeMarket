export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-CU", {
    style: "currency",
    currency: "CUP",
  }).format(price);
}
