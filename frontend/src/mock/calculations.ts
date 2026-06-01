import type { MockEstimate, MockEstimateItem } from "./types";

export function calcItemTotal(item: Pick<MockEstimateItem, "quantity" | "unitPrice">): number {
  return item.quantity * item.unitPrice;
}

export function calcEstimateTotals(
  items: MockEstimateItem[],
  taxRate: number,
): Pick<MockEstimate, "subtotal" | "tax" | "total"> {
  const subtotal = items.reduce((sum, item) => sum + calcItemTotal(item), 0);
  const tax = Math.floor(subtotal * (taxRate / 100));
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export function recalcEstimate(estimate: MockEstimate): MockEstimate {
  const items = estimate.items.map((item) => ({
    ...item,
    totalPrice: calcItemTotal(item),
  }));
  const totals = calcEstimateTotals(items, estimate.taxRate);
  return {
    ...estimate,
    items,
    ...totals,
    updatedAt: new Date().toISOString(),
  };
}

export function formatYen(value: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateJa(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
}
