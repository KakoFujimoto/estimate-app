import type { Company } from "../../types/master";
import type { Estimate, LayoutType } from "../../types/estimate";
import { formatDateJa, formatYen } from "../../utils/calculations";

type EstimatePreviewProps = {
  estimate: Estimate;
  company: Company | null;
  layout?: LayoutType;
};

const layoutLabels: Record<LayoutType, string> = {
  standard: "標準",
  simple: "シンプル",
  detailed: "詳細",
  modern: "モダン",
};

export function EstimatePreview({ estimate, company, layout }: EstimatePreviewProps) {
  const activeLayout = layout ?? estimate.layout;
  const logo = estimate.logoUrl ?? company?.logoUrl;
  const stamp = estimate.stampUrl ?? company?.stampUrl;

  return (
    <div className={`estimate-preview layout-${activeLayout}`}>
      <div className="preview-badge">プレビュー · {layoutLabels[activeLayout]}</div>

      <header className="preview-header">
        <div className="preview-header-left">
          {logo && <img src={logo} alt="会社ロゴ" className="preview-logo" />}
          <div>
            <p className="preview-doc-type">御見積書</p>
            <h3 className="preview-title">{estimate.title || "（タイトル未入力）"}</h3>
            <p className="preview-meta">{estimate.estimateNumber}</p>
            <p className="preview-meta">見積日: {formatDateJa(estimate.date)}</p>
          </div>
        </div>
        <div className="preview-header-right">
          {company && (
            <>
              <p className="preview-company-name">{company.name}</p>
              <p className="preview-meta">{company.address}</p>
              <p className="preview-meta">TEL {company.phone}</p>
            </>
          )}
          {stamp && <img src={stamp} alt="印影" className="preview-stamp" />}
        </div>
      </header>

      <section className="preview-customer">
        <p>
          <strong>{estimate.customerName || "（取引先未入力）"}</strong> 御中
        </p>
        {estimate.customerAddress && <p className="preview-meta">{estimate.customerAddress}</p>}
        {estimate.customerPhone && <p className="preview-meta">TEL {estimate.customerPhone}</p>}
      </section>

      <table className="preview-table">
        <thead>
          <tr>
            <th>品目</th>
            <th className="col-num">数量</th>
            <th>単位</th>
            <th className="col-num">単価</th>
            <th className="col-num">金顡</th>
            {activeLayout === "detailed" && <th>備考</th>}
          </tr>
        </thead>
        <tbody>
          {estimate.items.length === 0 ? (
            <tr>
              <td colSpan={activeLayout === "detailed" ? 6 : 5} className="preview-empty">
                明細を追加してください
              </td>
            </tr>
          ) : (
            estimate.items.map((item) => (
              <tr key={item.id}>
                <td>{item.name || "—"}</td>
                <td className="col-num">{item.quantity}</td>
                <td>{item.unit}</td>
                <td className="col-num">{formatYen(item.unitPrice)}</td>
                <td className="col-num">{formatYen(item.totalPrice)}</td>
                {activeLayout === "detailed" && <td>{item.note ?? ""}</td>}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="preview-totals">
        <div className="preview-total-row">
          <span>小計</span>
          <span>{formatYen(estimate.subtotal)}</span>
        </div>
        <div className="preview-total-row">
          <span>消費税（{estimate.taxRate}%）</span>
          <span>{formatYen(estimate.tax)}</span>
        </div>
        <div className="preview-total-row preview-total-grand">
          <span>合計（税込）</span>
          <span>{formatYen(estimate.total)}</span>
        </div>
      </div>

      {estimate.note && (
        <footer className="preview-note">
          <strong>備考</strong>
          <p>{estimate.note}</p>
        </footer>
      )}
    </div>
  );
}
