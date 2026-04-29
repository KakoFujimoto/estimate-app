import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createEstimate, fetchEstimates } from './api/estimateApi';
import type { Estimate, EstimateItem } from './types/estimate';

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

function createEmptyItem(): EstimateItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    price: 0,
    quantity: 1,
  };
}

export default function App() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [title, setTitle] = useState<string>('');
  const [items, setItems] = useState<EstimateItem[]>([createEmptyItem()]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const totalAmount = useMemo(() => calculateTotal(items), [items]);

  const canSubmit = useMemo(() => {
    if (title.trim().length === 0 || items.length === 0) {
      return false;
    }

    return items.every((item) => {
      const trimmedName = item.name.trim();
      return (
        trimmedName.length > 0
        && Number.isFinite(item.price)
        && Number.isFinite(item.quantity)
        && item.price >= 0
        && item.quantity > 0
      );
    });
  }, [title, items]);

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

  const updateItem = (id:string, key: 'name' | 'price' | 'quantity', value: string): void => {
    setItems((prevItems) =>
      prevItems.map((item) => {
      if (item.id !== id) {
        return item;
      }

      if (key === 'name') {
        return { ...item, name: value };
      }

      const parsedValue = Number(value);

      if (!Number.isFinite(parsedValue)) {
        if (key === 'price')
        {
          return { ...item, price: 0 };
        }
        if (key === 'quantity')
        {
          return { ...item, quantity: 0 };
        }
      }

      if (key === 'price') {
        return { ...item, price: parsedValue };
      }

      if (key === 'quantity') {
        return { ...item, quantity: parsedValue };
      }

      return item;
    }));
  };

  const handleAddItem = (): void => {
    setItems((prevItems) => [...prevItems, createEmptyItem()]);
  };

  const handleRemoveItem = (id: string): void => {
    setItems((prevItems) => {
      if (prevItems.length <= 1) {
        return prevItems;
      }

      return prevItems.filter((item) => item.id !== id);
    });
  };

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
        items,
      });

      setTitle('');
      setItems([createEmptyItem()]);
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

          {items.map((item, index) => (
            <div key={item.id}>
              <h3>明細 {index + 1}</h3>

              <label>
                明細名
                <input
                  value={item.name}
                  onChange={(event) => updateItem(item.id!, 'name', event.target.value)}
                  placeholder="例: デザイン費"
                />
              </label>

              <label>
                単価
                <input
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(event) => updateItem(item.id!, 'price', event.target.value)}
                  placeholder="10000"
                />
              </label>

              <label>
                数量
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => updateItem(item.id!, 'quantity', event.target.value)}
                  placeholder="1"
                />
              </label>

              <button
                type="button"
                onClick={() => handleRemoveItem(item.id!)}
                disabled={items.length <= 1 || submitting}
              >
                削除
              </button>
            </div>
          ))}

          <button type="button" onClick={handleAddItem} disabled={submitting}>
            ＋明細追加
          </button>

          <p>合計金額: {formatCurrency(totalAmount)}</p>

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
                  <td>{formatCurrency(calculateTotal(estimate.items))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}