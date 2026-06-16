import type { Estimate, EstimateItem, EstimateItemInput } from "../types/estimate";

export function calcItemTotal(
  item: Pick<EstimateItem | EstimateItemInput, "quantity" | "unitPrice">,
): number {
  return Math.round(item.quantity * item.unitPrice);
}

export function calcEstimateTotals(
  items: Pick<EstimateItem | EstimateItemInput, "quantity" | "unitPrice">[],
  taxRate: number,
): Pick<Estimate, "subtotal" | "tax" | "total"> {
  const subtotal = items.reduce((sum, item) => sum + calcItemTotal(item), 0);
  const tax = Math.floor(subtotal * (taxRate / 100));
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export function recalcEstimate<T extends Estimate>(estimate: T): T {
  const items = estimate.items.map((item) => ({
    ...item,
    totalPrice: calcItemTotal(item),
  }));
  const totals = calcEstimateTotals(items, estimate.taxRate);
  return {
    ...estimate,
    items,
    ...totals,
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
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function toEstimateInput(estimate: Estimate): import("../types/estimate").EstimateInput {
  return {
    title: estimate.title,
    estimateNumber: estimate.estimateNumber,
    date: estimate.date,
    customerName: estimate.customerName,
    customerAddress: estimate.customerAddress ?? undefined,
    customerPhone: estimate.customerPhone ?? undefined,
    items: estimate.items.map(({ id, name, quantity, unit, unitPrice, note }) => ({
      ...(id > 0 ? { id } : {}),
      name,
      quantity,
      unit,
      unitPrice,
      note: note ?? undefined,
    })),
    taxRate: estimate.taxRate,
    note: estimate.note ?? undefined,
    layout: estimate.layout,
    logoUrl: estimate.logoUrl ?? undefined,
    stampUrl: estimate.stampUrl ?? undefined,
  };
}
