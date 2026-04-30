import { FormEvent, useMemo, useState } from 'react';
import { createEstimate } from '../api/estimateApi';
import type { EstimateItem } from '../types/estimate';

type EstimateFormProps = {
  onCreated: () => Promise<void>;
};

type ItemError = {
  name?: string;
  price?: string;
  quantity?: string;
};

type FormErrors = {
  title?: string;
  items: Record<string, ItemError>;
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

function createEmptyItem(): EstimateItem {
  return {
    id: crypto.randomUUID(),
    name: '',
    price: 0,
    quantity: 1,
  };
}

function getItemErrorKey(item: EstimateItem, index: number): string {
  return item.id;
}

function validate(title: string, items: EstimateItem[]): FormErrors {
  const errors: FormErrors = { items: {} };

  if (title.trim().length === 0) {
    errors.title = '見積タイトルは必須です';
  }

  items.forEach((item, index) => {
    const itemErrors: ItemError = {};

    if (item.name.trim().length === 0) {
      itemErrors.name = '明細名は必須です';
    }

    if (!(item.price > 0)) {
      itemErrors.price = '単価は1以上を入力してください';
    }

    if (!(item.quantity > 0)) {
      itemErrors.quantity = '数量は1以上を入力してください';
    }

    if (Object.keys(itemErrors).length > 0) {
      errors.items[getItemErrorKey(item, index)] = itemErrors;
    }
  });

  return errors;
}

function hasFormErrors(errors: FormErrors): boolean {
  return Boolean(errors.title) || Object.keys(errors.items).length > 0;
}

export function EstimateForm({ onCreated }: EstimateFormProps) {
  const [title, setTitle] = useState<string>('');
  const [items, setItems] = useState<EstimateItem[]>([createEmptyItem()]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({ items: {} });

  const totalAmount = useMemo(() => calculateTotal(items), [items]);
  const hasError = useMemo(() => {
  const e = validate(title, items);
  return hasFormErrors(e);
}, [title, items]);

  const updateItem = (index: number, key: 'name' | 'price' | 'quantity', value: string): void => {
    setItems((prevItems) => prevItems.map((item, itemIndex) => {
      if (itemIndex !== index) {
        return item;
      }

      if (key === 'name') {
        return { ...item, name: value };
      }

      const parsedValue = Number(value);
      if (!Number.isFinite(parsedValue)) {
        return { ...item, [key]: 0 };
      }

      return { ...item, [key]: parsedValue };
    }));
  };

  const handleAddItem = (): void => {
    setItems((prevItems) => [...prevItems, createEmptyItem()]);
  };

  const handleRemoveItem = (index: number): void => {
    setItems((prevItems) => {
      if (prevItems.length <= 1) {
        return prevItems;
      }

      return prevItems.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const nextErrors = validate(title, items);
    setErrors(nextErrors);

    if (hasFormErrors(nextErrors)) {
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
      setErrors({ items: {} });
      await onCreated();
    } catch (error) {
      const message = error instanceof Error ? error.message : '見積の作成に失敗しました';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="panel">
      <h2>見積作成</h2>
      <form onSubmit={(event) => void handleSubmit(event)} className="form-grid">
        <label>
          見積タイトル
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例: 4月Web制作" />
        </label>
        {errors.title && <p className="error">{errors.title}</p>}

        {items.map((item, index) => {
          const itemErrorKey = getItemErrorKey(item, index);
          const itemErrors = errors.items[itemErrorKey];

          return (
            <div key={item.id}>
              <h3>明細 {index + 1}</h3>

              <label>
                明細名
                <input
                  value={item.name}
                  onChange={(event) => updateItem(index, 'name', event.target.value)}
                  placeholder="例: デザイン費"
                />
              </label>
              {itemErrors?.name && <p className="error">{itemErrors.name}</p>}

              <label>
                単価
                <input
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(event) => updateItem(index, 'price', event.target.value)}
                  placeholder="10000"
                />
              </label>
              {itemErrors?.price && <p className="error">{itemErrors.price}</p>}

              <label>
                数量
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                  placeholder="1"
                />
              </label>
              {itemErrors?.quantity && <p className="error">{itemErrors.quantity}</p>}

              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length <= 1 || submitting}
              >
                削除
              </button>
            </div>
          );
        })}

        <button type="button" onClick={handleAddItem} disabled={submitting}>
          ＋明細追加
        </button>

        <p>合計金額: {formatCurrency(totalAmount)}</p>

        {errorMessage.length > 0 && <p className="error">{errorMessage}</p>}

        <button type="submit" disabled={hasError || submitting}>
          {submitting ? '作成中...' : '見積を作成'}
        </button>
      </form>
    </section>
  );
}