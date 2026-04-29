import { Link } from 'react-router-dom';
import type { Estimate, EstimateItem } from '../types/estimate';

type EstimateListProps = {
  estimates: Estimate[];
  onReload: () => Promise<void>;
  loading: boolean;
  errorMessage: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateTotal(items: EstimateItem[]): number {
  return items.reduce((sum: number, item: EstimateItem) => sum + item.price * item.quantity, 0);
}

export function EstimateList({ estimates, onReload, loading, errorMessage }: EstimateListProps) {
  return (
    <section className="panel">
      <div className="section-head">
        <h2>見積一覧</h2>
        <button onClick={() => void onReload()} disabled={loading}>
          {loading ? '更新中...' : '再読み込み'}
        </button>
      </div>

      {errorMessage.length > 0 && <p className="error">{errorMessage}</p>}

      {estimates.length === 0 ? (
        <p>見積データがありません</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>タイトル</th>
              <th>明細数</th>
              <th>合計金額</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((estimate) => (
              <tr key={estimate.id}>
                <td>{estimate.id}</td>
                <td>{estimate.title}</td>
                <td>{estimate.items.length}</td>
                <td>{formatCurrency(calculateTotal(estimate.items))}</td>
                <td>
                  <Link to={`/estimates/${estimate.id}`}>詳細</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}