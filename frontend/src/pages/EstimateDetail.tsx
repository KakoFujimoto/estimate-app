import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchEstimates } from '../api/estimateApi';
import type { Estimate, EstimateItem } from '../types/estimate';

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

export default function EstimateDetail() {
  const { id } = useParams<{ id: string }>();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const loadEstimates = async (): Promise<void> => {
      setLoading(true);
      try {
        const data = await fetchEstimates();
        setEstimates(data);
        setErrorMessage('');
      } catch (error) {
        const message = error instanceof Error ? error.message : '見積一覧の取得に失敗しました';
        setErrorMessage(message);
      } finally {
        setLoading(false);
      }
    };

    void loadEstimates();
  }, []);


  const numericId = id ? Number(id) : NaN;

  const currentEstimate = 
    Number.isFinite(numericId)
      ? estimates.find((estimate) => estimate.id === numericId)
      : undefined;

  if (loading) {
  return <p>読み込み中...</p>;
  }

  if (errorMessage) {
    return <p className="error">{errorMessage}</p>;
  }

  if (!currentEstimate) {
    return <p>データが存在しません</p>;
  }

  return (
    <main className="page">
      <h1>見積詳細</h1>
      <section className="panel">
        <p>
          <Link to="/">一覧へ戻る</Link>
        </p>
            <h2>{currentEstimate.title}</h2>
            <table>
              <thead>
                <tr>
                  <th>明細名</th>
                  <th>単価</th>
                  <th>数量</th>
                </tr>
              </thead>
              <tbody>
                {currentEstimate.items.map((item, index) => (
                  <tr key={item.id ?? `${item.name}-${index}`}>
                    <td>{item.name}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>合計金額: {formatCurrency(calculateTotal(currentEstimate.items))}</p>
      </section>
    </main>
  );
}