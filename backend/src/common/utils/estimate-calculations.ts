export interface CalcItemInput {
  quantity: number;
  unitPrice: number;
  taxRate?: number;
}

export function calcItemTotal(item: Pick<CalcItemInput, 'quantity' | 'unitPrice'>): number {
  return Math.round(item.quantity * item.unitPrice);
}

export function calcItemTax(item: CalcItemInput, defaultTaxRate = 10): number {
  const rate = item.taxRate ?? defaultTaxRate;
  return Math.floor(calcItemTotal(item) * (rate / 100));
}

export function calcEstimateTotals(
  items: CalcItemInput[],
  defaultTaxRate = 10,
): { subtotal: number; tax: number; total: number } {
  const subtotal = items.reduce((sum, item) => sum + calcItemTotal(item), 0);
  const tax = items.reduce(
    (sum, item) => sum + calcItemTax(item, defaultTaxRate),
    0,
  );
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export function getTaxBreakdown(
  items: CalcItemInput[],
  defaultTaxRate = 10,
): { rate: number; subtotal: number; tax: number }[] {
  const map = new Map<number, { subtotal: number; tax: number }>();

  for (const item of items) {
    const rate = item.taxRate ?? defaultTaxRate;
    const amount = calcItemTotal(item);
    const tax = calcItemTax(item, defaultTaxRate);
    const current = map.get(rate) ?? { subtotal: 0, tax: 0 };
    map.set(rate, {
      subtotal: current.subtotal + amount,
      tax: current.tax + tax,
    });
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => b - a)
    .map(([rate, values]) => ({ rate, ...values }));
}
