import { FormEvent, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchCompany,
  fetchCustomers,
  fetchItemMasters,
  replaceItemMasters,
  updateCompany,
} from "../../api/masterApi";
import type { Company, Customer, ItemMaster } from "../../types/master";
import { AddressFormFields } from "../../components/demo/AddressFormFields";
import {
  addressFieldsFromRecord,
  formatFullAddress,
  withFormattedAddress,
} from "../../utils/addressUtils";

type Tab = "company" | "customer" | "item";

export function DemoMasters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab: Tab =
    tabParam === "customer" || tabParam === "item" ? tabParam : "company";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [company, setCompany] = useState<Company | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<ItemMaster[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        const [c, cust, itemList] = await Promise.all([
          fetchCompany(),
          fetchCustomers(),
          fetchItemMasters(),
        ]);
        setCompany({
          ...c,
          ...addressFieldsFromRecord(c),
        });
        setCustomers(cust);
        setItems(itemList);
      } catch {
        setError("マスタデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const switchTab = (next: Tab) => {
    setTab(next);
    setSearchParams(next === "company" ? {} : { tab: next });
  };

  const showSaved = () => {
    setMessage("保存しました");
    setTimeout(() => setMessage(""), 2000);
  };

  const saveCompany = async (e: FormEvent) => {
    e.preventDefault();
    if (!company) return;
    if (!formatFullAddress(company)) {
      setError("住所を入力してください");
      return;
    }
    setError("");
    const { id: _id, ...rest } = company;
    const saved = await updateCompany(withFormattedAddress(rest));
    setCompany({
      ...saved,
      ...addressFieldsFromRecord(saved),
    });
    showSaved();
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: 0,
        name: "",
        category: "その他",
        unit: "式",
        defaultUnitPrice: 0,
        note: null,
      },
    ]);
  };

  const updateItem = (index: number, patch: Partial<ItemMaster>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const saveItems = async () => {
    const input = items.map(({ name, category, unit, defaultUnitPrice, note }) => ({
      name,
      category,
      unit,
      defaultUnitPrice,
      note: note ?? undefined,
    }));
    const saved = await replaceItemMasters(input);
    setItems(saved);
    showSaved();
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!company) return <p>会社マスタが未設定です。</p>;

  return (
    <div>
      <h1 className="page-title">マスタ管理</h1>
      <p className="page-desc">会社・取引先・品目の基本データを管理します</p>
      {message && <p className="success">{message}</p>}

      <div className="tab-bar">
        {(
          [
            ["company", "会社情報"],
            ["customer", "取引先"],
            ["item", "品目"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`tab-btn${tab === key ? " active" : ""}`}
            onClick={() => switchTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "company" && (
        <section className="panel">
          <form onSubmit={(e) => void saveCompany(e)} className="form-grid">
            <h2>会社情報</h2>
            <label>
              会社名
              <input
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
              />
            </label>

            <AddressFormFields
              value={company}
              onChange={(address) => setCompany({ ...company, ...address })}
              required
            />

            <label>
              電話
              <input
                value={company.phone}
                onChange={(e) => setCompany({ ...company, phone: e.target.value })}
              />
            </label>
            <label>
              メール
              <input
                type="email"
                value={company.email}
                onChange={(e) => setCompany({ ...company, email: e.target.value })}
              />
            </label>
            <label>
              代表者
              <input
                value={company.representative}
                onChange={(e) =>
                  setCompany({ ...company, representative: e.target.value })
                }
              />
            </label>
            <button type="submit">保存</button>
          </form>
        </section>
      )}

      {tab === "customer" && (
        <section className="panel">
          <div className="section-head">
            <h2>取引先マスタ</h2>
            <Link to="/demo/masters/customers/new" className="btn-primary">
              ＋ 追加
            </Link>
          </div>

          {customers.length === 0 ? (
            <p>
              取引先がありません。
              <Link to="/demo/masters/customers/new">新規登録</Link>
              してください。
            </p>
          ) : (
            <ul className="master-name-list">
              {customers.map((c) => (
                <li key={c.id}>
                  <Link to={`/demo/masters/customers/${c.id}`} className="master-name-link">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "item" && (
        <section className="panel">
          <div className="section-head">
            <h2>品目マスタ</h2>
            <button type="button" onClick={addItem}>
              ＋ 追加
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th>品目名</th>
                <th>カテゴリ</th>
                <th>単位</th>
                <th className="col-num">標準単価</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id || `new-${index}`}>
                  <td>
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={item.category}
                      onChange={(e) => updateItem(index, { category: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={item.unit}
                      onChange={(e) => updateItem(index, { unit: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input-num"
                      value={item.defaultUnitPrice}
                      onChange={(e) =>
                        updateItem(index, {
                          defaultUnitPrice: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-link btn-danger"
                      onClick={() => removeItem(index)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={() => void saveItems()}>
            一括保存
          </button>
        </section>
      )}
    </div>
  );
}
