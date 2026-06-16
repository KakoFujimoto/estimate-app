import { FormEvent, useEffect, useState } from "react";
import {
  fetchCompany,
  fetchCustomers,
  fetchItemMasters,
  replaceCustomers,
  replaceItemMasters,
  updateCompany,
} from "../../api/masterApi";
import type { Company, Customer, ItemMaster } from "../../types/master";

type Tab = "company" | "customer" | "item";

export function DemoMasters() {
  const [tab, setTab] = useState<Tab>("company");
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
        setCompany(c);
        setCustomers(cust);
        setItems(itemList);
      } catch {
        setError("マスタデータの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const showSaved = () => {
    setMessage("保存しました");
    setTimeout(() => setMessage(""), 2000);
  };

  const saveCompany = async (e: FormEvent) => {
    e.preventDefault();
    if (!company) return;
    const saved = await updateCompany(company);
    setCompany(saved);
    showSaved();
  };

  const addCustomer = () => {
    setCustomers((prev) => [
      ...prev,
      { id: 0, name: "", address: "", phone: "", email: null, contactPerson: null },
    ]);
  };

  const updateCustomer = (index: number, patch: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    );
  };

  const removeCustomer = (index: number) => {
    setCustomers((prev) => prev.filter((_, i) => i !== index));
  };

  const saveCustomers = async () => {
    const input = customers.map(({ name, address, phone, email, contactPerson }) => ({
      name,
      address,
      phone,
      email: email ?? undefined,
      contactPerson: contactPerson ?? undefined,
    }));
    const saved = await replaceCustomers(input);
    setCustomers(saved);
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
            onClick={() => setTab(key)}
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
            <label>
              住所
              <input
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
              />
            </label>
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
            <button type="button" onClick={addCustomer}>
              ＋ 追加
            </button>
          </div>
          <div className="master-cards">
            {customers.map((c, index) => (
              <div key={c.id || `new-${index}`} className="master-card form-grid">
                <label>
                  会社名
                  <input
                    value={c.name}
                    onChange={(e) => updateCustomer(index, { name: e.target.value })}
                  />
                </label>
                <label>
                  住所
                  <input
                    value={c.address}
                    onChange={(e) => updateCustomer(index, { address: e.target.value })}
                  />
                </label>
                <label>
                  電話
                  <input
                    value={c.phone}
                    onChange={(e) => updateCustomer(index, { phone: e.target.value })}
                  />
                </label>
                <label>
                  担当者
                  <input
                    value={c.contactPerson ?? ""}
                    onChange={(e) =>
                      updateCustomer(index, { contactPerson: e.target.value })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn-link btn-danger"
                  onClick={() => removeCustomer(index)}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => void saveCustomers()}>
            一括保存
          </button>
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
