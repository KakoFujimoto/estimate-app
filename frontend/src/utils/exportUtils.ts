import type { Company } from "../types/master";
import type { Estimate } from "../types/estimate";
import { formatDateJa, formatTaxRateLabel, formatYen, getTaxBreakdown } from "../utils/calculations";

export interface PrintOptions {
  title: string;
  content: string;
}

export function printDocument(options: PrintOptions): void {
  const { title, content } = options;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    console.error("Failed to open print window");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <title>${title}</title>
      <style>
        body { font-family: "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif; margin: 24px; line-height: 1.6; color: #1f2937; }
        h1 { font-size: 22px; margin: 0 0 8px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background: #f1f5f9; }
        .num { text-align: right; }
        .totals { margin-top: 16px; width: 280px; margin-left: auto; }
        .totals td { border: none; padding: 4px 8px; }
        .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
        .logo { max-height: 48px; max-width: 160px; }
        .stamp { max-height: 64px; max-width: 64px; }
        @media print { body { margin: 12px; } }
      </style>
    </head>
    <body>${content}</body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
  };
}

export function buildEstimatePrintHtml(
  estimate: Estimate,
  company: Company | null,
): string {
  const logo = estimate.logoUrl ?? company?.logoUrl;
  const stamp = estimate.stampUrl ?? company?.stampUrl;

  const taxBreakdown = getTaxBreakdown(estimate.items, estimate.taxRate);
  const hasMixedRates = taxBreakdown.length > 1;

  const itemRows = estimate.items
    .map(
      (item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td class="num">${formatYen(item.unitPrice)}</td>
        <td class="num">${item.quantity}</td>
        <td>${escapeHtml(item.unit)}</td>
        <td class="num">${formatYen(item.totalPrice)}</td>
        <td class="num">${escapeHtml(formatTaxRateLabel(item.taxRate))}</td>
        <td>${escapeHtml(item.note ?? "")}</td>
      </tr>`,
    )
    .join("");

  const taxRows = hasMixedRates
    ? taxBreakdown
        .map(
          ({ rate, tax }) =>
            `<tr><td>消費税（${escapeHtml(formatTaxRateLabel(rate))}）</td><td class="num">${formatYen(tax)}</td></tr>`,
        )
        .join("") +
      `<tr><td>消費税合計</td><td class="num">${formatYen(estimate.tax)}</td></tr>`
    : `<tr><td>消費税（${escapeHtml(formatTaxRateLabel(taxBreakdown[0]?.rate ?? estimate.taxRate))}）</td><td class="num">${formatYen(estimate.tax)}</td></tr>`;

  return `
    <div class="header-row">
      <div>
        ${logo ? `<img class="logo" src="${logo}" alt="ロゴ" />` : ""}
        <h1>御見積書</h1>
        <p>${escapeHtml(estimate.title)}</p>
        <p>${escapeHtml(estimate.estimateNumber)}</p>
        <p>見積日: ${formatDateJa(estimate.date)}</p>
      </div>
      <div style="text-align:right">
        ${company ? `<p><strong>${escapeHtml(company.name)}</strong></p><p>${escapeHtml(company.address)}</p><p>TEL ${escapeHtml(company.phone)}</p>` : ""}
        ${stamp ? `<img class="stamp" src="${stamp}" alt="印影" style="margin-top:8px" />` : ""}
      </div>
    </div>
    <p><strong>${escapeHtml(estimate.customerName)}</strong> 御中</p>
    ${estimate.customerAddress ? `<p>${escapeHtml(estimate.customerAddress)}</p>` : ""}
    <table>
      <thead>
        <tr><th>品目</th><th>単価</th><th>数量</th><th>単位</th><th>金額</th><th>税率</th><th>備考</th></tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>
    <table class="totals">
      <tr><td>小計</td><td class="num">${formatYen(estimate.subtotal)}</td></tr>
      ${taxRows}
      <tr><td><strong>合計</strong></td><td class="num"><strong>${formatYen(estimate.total)}</strong></td></tr>
    </table>
    ${estimate.note ? `<p style="margin-top:24px">備考: ${escapeHtml(estimate.note)}</p>` : ""}
  `;
}

export function printEstimate(
  estimate: Estimate,
  company: Company | null,
): void {
  printDocument({
    title: `${estimate.title} - 見積書`,
    content: buildEstimatePrintHtml(estimate, company),
  });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
