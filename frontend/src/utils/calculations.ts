import type { Estimate, EstimateItem, EstimateItemInput } from "../types/estimate";

export function calcItemTotal(
  item: Pick<EstimateItem | EstimateItemInput, "quantity" | "unitPrice">,
): number {
  return Math.round(item.quantity * item.unitPrice);
}

export function calcItemTax(
  item: Pick<EstimateItem | EstimateItemInput, "quantity" | "unitPrice" | "taxRate">,
  defaultTaxRate = 10,
): number {
  const rate = item.taxRate ?? defaultTaxRate;
  return Math.floor(calcItemTotal(item) * (rate / 100));
}

export function calcEstimateTotals(
  items: Pick<EstimateItem | EstimateItemInput, "quantity" | "unitPrice" | "taxRate">[],
  defaultTaxRate = 10,
): Pick<Estimate, "subtotal" | "tax" | "total"> {
  const subtotal = items.reduce((sum, item) => sum + calcItemTotal(item), 0);
  const tax = items.reduce(
    (sum, item) => sum + calcItemTax(item, defaultTaxRate),
    0,
  );
  const total = subtotal + tax;
  return { subtotal, tax, total };
}

export function getTaxBreakdown(
  items: Pick<EstimateItem | EstimateItemInput, "quantity" | "unitPrice" | "taxRate">[],
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

export function normalizeEstimateItems(
  items: EstimateItem[],
  defaultTaxRate: number,
): EstimateItem[] {
  return items.map((item) => ({
    ...item,
    taxRate: item.taxRate ?? defaultTaxRate,
  }));
}

export function recalcEstimate<T extends Estimate>(estimate: T): T {
  const defaultTaxRate = estimate.taxRate ?? 10;
  const items = normalizeEstimateItems(
    estimate.items.map((item) => ({
      ...item,
      totalPrice: calcItemTotal(item),
    })),
    defaultTaxRate,
  );
  const totals = calcEstimateTotals(items, defaultTaxRate);
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

export function formatTaxRateLabel(rate: number): string {
  return rate === 0 ? "非課税" : `${rate}%`;
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
    items: estimate.items.map(
      ({ id, name, quantity, unit, unitPrice, taxRate, vendorId, vendorName, note }) => ({
        ...(id > 0 ? { id } : {}),
        name,
        quantity,
        unit,
        unitPrice,
        taxRate,
        vendorId: vendorId ?? null,
        vendorName: vendorName ?? null,
        note: note ?? undefined,
      }),
    ),
    taxRate: estimate.taxRate,
    note: estimate.note ?? undefined,
    layout: estimate.layout,
    logoUrl: estimate.logoUrl ?? undefined,
    stampUrl: estimate.stampUrl ?? undefined,
  };
}
