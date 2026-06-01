import { FormEvent, useState } from "react";
import {
  loadCompanyMaster,
  loadCustomerMaster,
  loadItemMaster,
  saveCompanyMaster,
  saveCustomerMaster,
  saveItemMaster,
} from "../../mock/storage";
import type {
  MockCompanyMaster,
  MockCustomerMaster,
  MockItemMaster,
} from "../../mock/types";

type Tab = "company" | "customer" | "item";

export function DemoMasters() {
  const [tab, setTab] = useState<Tab>("company");
  const [company, setCompany] = useState<MockCompanyMaster | null>(() => loadCompanyMaster());
  const [customers, setCustomers] = useState<MockCustomerMaster[]>(() => loadCustomerMaster());
  const [items, setItems] = useState<MockItemMaster[]>(() => loadItemMaster());
  const [message, setMessage] = useState("");

  const showSaved = () => {
    setMessage("保存しました");
    setTimeout(() => setMessage(""), 2000);
  };

  const saveCompany = (e: FormEvent) => {
    e.preventDefault();
    if (!company) return;
    saveCompanyMaster(company);
    showSaved();
  };

  const addCustomer = () => {
    const c: MockCustomerMaster = {
      id: `customer-${Date.now()}`,
      name: "",
      address: "",
      phone: "",
    };
    setCustomers((prev) => [...prev, c]);
  };

  const updateCustomer = (id: string, patch: Partial<MockCustomerMaster>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  };

  const removeCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  const saveCustomers = () => {
    saveCustomerMaster(customers);
    showSaved();
  };

  const addItem = () => {
    const item: MockItemMaster = {
      id: `item-${Date.now()}`,
      name: "",
      category: "その他",
      unit: "式",
      defaultUnitPrice: 0,
    };
    setItems((prev) => [...prev, item]);
  };

  const updateItem = (id: string, patch: Partial<MockItemMaster>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const saveItems = () => {
    saveItemMaster(items);
    showSaved();
  };

  if (!company) {
    return <p>会社マスタが未設定です。設定画面から初期化してください。</p>;
  }

  return (
    <div>
      <h1 className="page-title">マスタ管理</h1>
      <p className="page-desc">会社・取引先・品目の基本データを管理します（ローカル保存）</p>
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
          <form onSubmit={saveCompany} className="form-grid">
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
            {customers.map((c) => (
              <div key={c.id} className="master-card form-grid">
                <label>
                  会社名
                  <input
                    value={c.name}
                    onChange={(e) => updateCustomer(c.id, { name: e.target.value })}
                  />
                </label>
                <label>
                  住所
                  <input
                    value={c.address}
                    onChange={(e) => updateCustomer(c.id, { address: e.target.value })}
                  />
                </label>
                <label>
                  電話
                  <input
                    value={c.phone}
                    onChange={(e) => updateCustomer(c.id, { phone: e.target.value })}
                  />
                </label>
                <label>
                  担当者
                  <input
                    value={c.contactPerson ?? ""}
                    onChange={(e) =>
                      updateCustomer(c.id, { contactPerson: e.target.value })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="btn-link btn-danger"
                  onClick={() => removeCustomer(c.id)}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={saveCustomers}>
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
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(item.id, { name: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={item.category}
                      onChange={(e) => updateItem(item.id, { category: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      value={item.unit}
                      onChange={(e) => updateItem(item.id, { unit: e.target.value })}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input-num"
                      value={item.defaultUnitPrice}
                      onChange={(e) =>
                        updateItem(item.id, {
                          defaultUnitPrice: Number(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-link btn-danger"
                      onClick={() => removeItem(item.id)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={saveItems}>
            一括保存
          </button>
        </section>
      )}
    </div>
  );
}
