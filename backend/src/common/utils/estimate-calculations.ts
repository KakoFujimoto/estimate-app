export interface CalcItemInput {
  quantity: number;
  unitPrice: number;
}

export function calcItemTotal(item: CalcItemInput): number {
  return Math.round(item.quantity * item.unitPrice);
}

export function calcEstimateTotals(
  items: CalcItemInput[],
  taxRate: number,
): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + calcItemTotal(item), 0);
  const tax = Math.floor(subtotal * (taxRate / 100));
  const total = subtotal + tax;
  return { subtotal, tax, total };
}
