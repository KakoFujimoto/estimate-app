import type { Estimate, EstimateItem } from "../types/estimate";
import { calcItemTax, calcItemTotal } from "./calculations";

const CSV_HEADERS = ["品目", "業者", "数量", "単位", "単価", "金額", "税率", "税額", "備考"] as const;

export function estimateToCsv(estimate: Estimate): string {
  const rows: string[][] = [
    ["見積タイトル", estimate.title],
    ["見積番号", estimate.estimateNumber],
    ["日付", estimate.date],
    ["取引先", estimate.customerName],
    ["取引先住所", estimate.customerAddress ?? ""],
    ["取引先電話", estimate.customerPhone ?? ""],
    [],
    [...CSV_HEADERS],
    ...estimate.items.map((item) => [
      item.name,
      item.vendorName ?? "",
      String(item.quantity),
      item.unit,
      String(item.unitPrice),
      String(item.totalPrice),
      String(item.taxRate),
      String(calcItemTax(item, estimate.taxRate)),
      item.note ?? "",
    ]),
    [],
    ["小計", String(estimate.subtotal)],
    ["消費税合計", String(estimate.tax)],
    ["合計", String(estimate.total)],
    ["備考", estimate.note ?? ""],
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");
}

export function downloadCsv(filename: string, content: string): void {
  const bom = "\uFEFF";
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type CsvImportResult =
  | { ok: true; items: Omit<EstimateItem, "id">[] }
  | { ok: false; error: string };

export function parseCsvToItems(csvText: string): CsvImportResult {
  const lines = csvText
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { ok: false, error: "CSVが空です" };
  }

  const headerLine = lines.find((line) => {
    const lower = line.toLowerCase();
    return lower.includes("品目") || lower.includes("name");
  });

  const dataLines = headerLine
    ? lines.slice(lines.indexOf(headerLine) + 1)
    : lines;

  const headerCells = headerLine ? parseCsvLine(headerLine) : [];
  const hasVendorColumn = headerCells.some((h) => h.includes("業者"));

  const items: Omit<EstimateItem, "id">[] = [];
  let rowNum = 0;

  for (const line of dataLines) {
    const cells = parseCsvLine(line);
    if (cells.length < 4) continue;

    const name = cells[0]?.trim();
    if (!name || name === "小計" || name === "合計" || name.startsWith("消費税")) continue;

    const offset = hasVendorColumn ? 1 : 0;
    const vendorName = hasVendorColumn ? cells[1]?.trim() || null : null;
    const quantity = Number(cells[1 + offset]);
    const unit = cells[2 + offset]?.trim() || "式";
    const unitPrice = Number(
      cells[3 + offset]?.replace(/[^\d.-]/g, "") ?? cells[3 + offset],
    );
    const hasTaxColumn = cells.length >= 7 + offset;
    const hasTaxAmountColumn = cells.length >= 8 + offset;
    const taxRateRaw = hasTaxColumn ? cells[5 + offset] : undefined;
    const taxRate =
      taxRateRaw !== undefined && taxRateRaw.trim() !== ""
        ? Number(taxRateRaw.replace(/[^\d.-]/g, ""))
        : 10;
    const noteCell = hasTaxAmountColumn
      ? cells[7 + offset]
      : hasTaxColumn
        ? cells[6 + offset]
        : cells[5 + offset];

    if (!name || !Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
      rowNum += 1;
      continue;
    }

    items.push({
      name,
      quantity,
      unit,
      unitPrice,
      totalPrice: calcItemTotal({ quantity, unitPrice }),
      taxRate: Number.isFinite(taxRate) ? taxRate : 10,
      vendorId: null,
      vendorName,
      note: noteCell?.trim() || null,
    });
    rowNum += 1;
  }

  if (items.length === 0) {
    return {
      ok: false,
      error: "有効な明細行が見つかりませんでした（品目,数量,単位,単価 の形式）",
    };
  }

  return { ok: true, items };
}

function escapeCsvCell(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
