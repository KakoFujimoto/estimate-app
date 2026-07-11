import type { Estimate } from "../../types/estimate";
import {
  formatTaxRateLabel,
  formatYen,
  getTaxBreakdown,
} from "../../utils/calculations";

type EstimateTotalsFormProps = {
  estimate: Estimate;
  onDefaultTaxRateChange: (taxRate: number) => void;
};

const TAX_RATE_OPTIONS = [10, 8, 0] as const;

export function EstimateTotalsForm({
  estimate,
  onDefaultTaxRateChange,
}: EstimateTotalsFormProps) {
  const breakdown = getTaxBreakdown(estimate.items, estimate.taxRate);
  const hasMixedRates = breakdown.length > 1;

  return (
    <section className="panel estimate-totals-form">
      <h2>金額・消費税</h2>
      <p className="demo-hint">
        各明細の税率に基づいて消費税を自動計算します。新規明細の初期税率を設定できます。
      </p>

      <div className="estimate-totals-input">
        <label>
          新規明細のデフォルト税率（%）
          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={estimate.taxRate}
            onChange={(e) => onDefaultTaxRateChange(Number(e.target.value) || 0)}
          />
        </label>
        <div className="tax-rate-chips">
          {TAX_RATE_OPTIONS.map((rate) => (
            <button
              key={rate}
              type="button"
              className={`template-chip${estimate.taxRate === rate ? " active" : ""}`}
              onClick={() => onDefaultTaxRateChange(rate)}
            >
              {formatTaxRateLabel(rate)}
            </button>
          ))}
        </div>
      </div>

      <dl className="estimate-totals-display">
        <div className="estimate-totals-row">
          <dt>小計（税抜）</dt>
          <dd>{formatYen(estimate.subtotal)}</dd>
        </div>
        {hasMixedRates ? (
          breakdown.map(({ rate, tax }) => (
            <div key={rate} className="estimate-totals-row estimate-totals-sub">
              <dt>　消費税（{formatTaxRateLabel(rate)}）</dt>
              <dd>{formatYen(tax)}</dd>
            </div>
          ))
        ) : (
          <div className="estimate-totals-row">
            <dt>消費税（{formatTaxRateLabel(breakdown[0]?.rate ?? estimate.taxRate)}）</dt>
            <dd>{formatYen(estimate.tax)}</dd>
          </div>
        )}
        {hasMixedRates && (
          <div className="estimate-totals-row">
            <dt>消費税合計</dt>
            <dd>{formatYen(estimate.tax)}</dd>
          </div>
        )}
        <div className="estimate-totals-row estimate-totals-grand">
          <dt>合計（税込）</dt>
          <dd>{formatYen(estimate.total)}</dd>
        </div>
      </dl>
    </section>
  );
}
