import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createCustomer,
  deleteCustomer,
  fetchCustomers,
  updateCustomer,
} from "../../api/masterApi";
import type { Customer, CustomerInput } from "../../types/master";

const emptyCustomer = (): CustomerInput => ({
  name: "",
  address: "",
  phone: "",
  email: undefined,
  contactPerson: undefined,
});

export function DemoCustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [form, setForm] = useState<CustomerInput>(emptyCustomer);
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isNew || !id) return;
    void (async () => {
      setLoading(true);
      try {
        const customers = await fetchCustomers();
        const customer = customers.find((c) => c.id === Number(id));
        if (!customer) {
          setNotFound(true);
          return;
        }
        setForm({
          name: customer.name,
          address: customer.address,
          phone: customer.phone,
          email: customer.email ?? undefined,
          contactPerson: customer.contactPerson ?? undefined,
        });
      } catch {
        setError("取引先の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew]);

  const updateField = (patch: Partial<CustomerInput>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        const saved = await createCustomer(form);
        navigate(`/demo/masters/customers/${saved.id}`, { replace: true });
      } else {
        await updateCustomer(Number(id), form);
      }
      setMessage("保存しました");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew || !id) return;
    if (!window.confirm("この取引先を削除しますか？")) return;
    try {
      await deleteCustomer(Number(id));
      navigate("/demo/masters?tab=customer");
    } catch {
      setError("削除に失敗しました");
    }
  };

  if (loading) return <p>読み込み中...</p>;

  if (notFound) {
    return (
      <div>
        <p>取引先が見つかりません。</p>
        <Link to="/demo/masters?tab=customer">マスタ管理へ戻る</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/demo/masters?tab=customer" className="back-link">
        ← 取引先一覧
      </Link>
      <h1 className="page-title">{isNew ? "取引先の新規登録" : "取引先詳細"}</h1>
      <p className="page-desc">取引先情報の確認・編集</p>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}

      <section className="panel">
        <form onSubmit={(e) => void handleSubmit(e)} className="form-grid">
          <label>
            会社名
            <input
              value={form.name}
              onChange={(e) => updateField({ name: e.target.value })}
              required
            />
          </label>
          <label>
            住所
            <input
              value={form.address}
              onChange={(e) => updateField({ address: e.target.value })}
              required
            />
          </label>
          <label>
            電話
            <input
              value={form.phone}
              onChange={(e) => updateField({ phone: e.target.value })}
              required
            />
          </label>
          <label>
            メール
            <input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => updateField({ email: e.target.value || undefined })}
            />
          </label>
          <label>
            担当者
            <input
              value={form.contactPerson ?? ""}
              onChange={(e) =>
                updateField({ contactPerson: e.target.value || undefined })
              }
            />
          </label>

          <div className="form-actions">
            <button type="submit" disabled={saving}>
              {saving ? "保存中..." : "保存"}
            </button>
            {!isNew && (
              <button type="button" className="btn-secondary btn-danger-text" onClick={() => void handleDelete()}>
                削除
              </button>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
