import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createEstimate, fetchEstimates } from './api/estimateApi';
import type { Estimate } from './types/estimate';
import { EstimateItem } from './types/estimate';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateTotal(estimate: Estimate): number {
  return estimate.items.reduce((sum:number, item:EstimateItem) => sum + item.price * item.quantity, 0);
}

export default function App() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [title, setTitle] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const canSubmit = useMemo(() => {
    const parsedPrice = Number(price);
    const parsedQuantity = Number(quantity);

    return (
      title.trim().length > 0 &&
      itemName.trim().length > 0 &&
      Number.isFinite(parsedPrice) &&
      Number.isFinite(parsedQuantity) &&
      parsedPrice >= 0 &&
      parsedQuantity > 0
    );
  }, [title, itemName, price, quantity]);

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

  useEffect(() => {
    void loadEstimates();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!canSubmit) {
      setErrorMessage('入力内容を確認してください');
      return;
    }

    setSubmitting(true);

    try {
      await createEstimate({
        title: title.trim(),
        items: [
          {
            name: itemName.trim(),
            price: Number(price),
            quantity: Number(quantity),
          },
        ],
      });

      setTitle('');
      setItemName('');
      setPrice('');
      setQuantity('1');
      setErrorMessage('');
      await loadEstimates();
    } catch (error) {
      const message = error instanceof Error ? error.message : '見積の作成に失敗しました';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page">
      <h1>見積アプリ</h1>

      <section className="panel">
        <h2>見積作成</h2>
        <form onSubmit={(event) => void handleSubmit(event)} className="form-grid">
          <label>
            見積タイトル
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例: 4月Web制作" />
          </label>

          <label>
            明細名
            <input
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              placeholder="例: デザイン費"
            />
          </label>

          <label>
            単価
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="10000"
            />
          </label>

          <label>
            数量
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="1"
            />
          </label>

          <button type="submit" disabled={!canSubmit || submitting}>
            {submitting ? '作成中...' : '見積を作成'}
          </button>
        </form>
      </section>

      <section className="panel">
        <div className="section-head">
          <h2>見積一覧</h2>
          <button onClick={() => void loadEstimates()} disabled={loading}>
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
              </tr>
            </thead>
            <tbody>
              {estimates.map((estimate) => (
                <tr key={estimate.id}>
                  <td>{estimate.id}</td>
                  <td>{estimate.title}</td>
                  <td>{estimate.items.length}</td>
                  <td>{formatCurrency(calculateTotal(estimate))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}