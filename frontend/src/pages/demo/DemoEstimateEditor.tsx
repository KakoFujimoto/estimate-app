import { DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EstimatePreview } from "../../components/demo/EstimatePreview";
import { calcItemTotal, recalcEstimate } from "../../mock/calculations";
import { estimateToCsv, downloadCsv, parseCsvToItems } from "../../mock/csvUtils";
import { printEstimate } from "../../mock/exportUtils";
import {
  loadCompanyMaster,
  loadCustomerMaster,
  loadEstimates,
  loadItemMaster,
  saveEstimates,
  getMaxEstimateId,
  generateId,
} from "../../mock/storage";
import { estimateTemplates } from "../../mock/templates";
import type {
  MockEstimate,
  MockEstimateItem,
  MockLayoutType,
} from "../../mock/types";

function createEmptyItem(): MockEstimateItem {
  return {
    id: `item-${crypto.randomUUID()}`,
    name: "",
    quantity: 1,
    unit: "式",
    unitPrice: 0,
    totalPrice: 0,
  };
}

function createNewEstimate(): MockEstimate {
  const year = new Date().getFullYear();
  const maxId = getMaxEstimateId();
  const num = maxId + 1;
  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  return recalcEstimate({
    id: generateId("estimate", maxId),
    title: "",
    estimateNumber: `見積第${year}-${String(num).padStart(3, "0")}号`,
    date: today,
    customerName: "",
    items: [createEmptyItem()],
    subtotal: 0,
    taxRate: 10,
    tax: 0,
    total: 0,
    layout: "standard",
    createdAt: now,
    updatedAt: now,
  });
}

export function DemoEstimateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [estimate, setEstimate] = useState<MockEstimate>(() => {
    if (isNew) return createNewEstimate();
    const found = loadEstimates().find((e) => e.id === id);
    return found ?? createNewEstimate();
  });
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savedMessage, setSavedMessage] = useState("");

  const company = loadCompanyMaster();
  const customers = loadCustomerMaster();
  const itemMasters = loadItemMaster();

  useEffect(() => {
    if (!isNew && id) {
      const found = loadEstimates().find((e) => e.id === id);
      if (found) setEstimate(found);
    }
  }, [id, isNew]);

  const updateEstimate = useCallback((patch: Partial<MockEstimate>) => {
    setEstimate((prev) => recalcEstimate({ ...prev, ...patch }));
  }, []);

  const updateItem = (index: number, patch: Partial<MockEstimateItem>) => {
    setEstimate((prev) => {
      const items = prev.items.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, ...patch };
        return { ...next, totalPrice: calcItemTotal(next) };
      });
      return recalcEstimate({ ...prev, items });
    });
  };

  const addItem = (fromMaster?: (typeof itemMasters)[0]) => {
    const newItem = fromMaster
      ? {
          id: `item-${crypto.randomUUID()}`,
          name: fromMaster.name,
          quantity: 1,
          unit: fromMaster.unit,
          unitPrice: fromMaster.defaultUnitPrice,
          totalPrice: fromMaster.defaultUnitPrice,
          note: fromMaster.note,
        }
      : createEmptyItem();

    setEstimate((prev) => recalcEstimate({ ...prev, items: [...prev.items, newItem] }));
  };

  const removeItem = (index: number) => {
    setEstimate((prev) => {
      if (prev.items.length <= 1) return prev;
      return recalcEstimate({
        ...prev,
        items: prev.items.filter((_, i) => i !== index),
      });
    });
  };

  const applyTemplate = (templateId: string) => {
    const tpl = estimateTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    const items: MockEstimateItem[] = tpl.items.map((item) => ({
      ...item,
      id: `item-${crypto.randomUUID()}`,
      totalPrice: calcItemTotal(item),
    }));
    updateEstimate({
      title: tpl.title,
      layout: tpl.layout,
      note: tpl.note,
      items,
    });
  };

  const handleDragStart = (index: number) => setDragIndex(index);

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    setEstimate((prev) => {
      const items = [...prev.items];
      const [moved] = items.splice(dragIndex, 1);
      items.splice(index, 0, moved);
      setDragIndex(index);
      return recalcEstimate({ ...prev, items });
    });
  };

  const handleDragEnd = () => setDragIndex(null);

  const handleSave = () => {
    const all = loadEstimates();
    const idx = all.findIndex((e) => e.id === estimate.id);
    const next = idx >= 0 ? all.map((e, i) => (i === idx ? estimate : e)) : [...all, estimate];
    saveEstimates(next);
    setSavedMessage("保存しました");
    setTimeout(() => setSavedMessage(""), 2000);
    if (isNew) navigate(`/demo/estimates/${estimate.id}`, { replace: true });
  };

  const handleExportCsv = () => {
    downloadCsv(`${estimate.title || "見積"}.csv`, estimateToCsv(estimate));
  };

  const handleExportPdf = () => {
    printEstimate(estimate, company);
  };

  const handleImportCsv = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const result = parseCsvToItems(text);
      if (!result.ok) {
        alert(result.error);
        return;
      }
      updateEstimate({ items: result.items });
    };
    reader.readAsText(file);
  };

  const previewEstimate = useMemo(() => recalcEstimate(estimate), [estimate]);

  const notFound = !isNew && id && !loadEstimates().some((e) => e.id === id);

  if (notFound) {
    return (
      <div>
        <p>見積が見つかりません。</p>
        <Link to="/demo/estimates">一覧へ戻る</Link>
      </div>
    );
  }

  return (
    <div className="estimate-editor">
      <div className="section-head">
        <div>
          <Link to="/demo/estimates" className="back-link">
            ← 一覧
          </Link>
          <h1 className="page-title">{isNew ? "新規見積作成" : "見積編集"}</h1>
        </div>
        <div className="editor-toolbar">
          {savedMessage && <span className="success">{savedMessage}</span>}
          <button type="button" className="btn-secondary" onClick={handleExportCsv}>
            CSV出力
          </button>
          <button type="button" className="btn-secondary" onClick={handleExportPdf}>
            PDF（印刷）
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            保存
          </button>
        </div>
      </div>

      <div className="editor-grid">
        <div className="editor-form">
          <section className="panel">
            <h2>テンプレート</h2>
            <div className="template-chips">
              {estimateTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  className="template-chip"
                  onClick={() => applyTemplate(tpl.id)}
                  title={tpl.description}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </section>

          <section className="panel form-grid">
            <h2>基本情報</h2>
            <label>
              見積タイトル
              <input
                value={estimate.title}
                onChange={(e) => updateEstimate({ title: e.target.value })}
                placeholder="例: A様邸 新築工事"
              />
            </label>
            <label>
              見積番号
              <input
                value={estimate.estimateNumber}
                onChange={(e) => updateEstimate({ estimateNumber: e.target.value })}
              />
            </label>
            <label>
              見積日
              <input
                type="date"
                value={estimate.date}
                onChange={(e) => updateEstimate({ date: e.target.value })}
              />
            </label>
            <label>
              取引先（マスタから選択）
              <select
                value=""
                onChange={(e) => {
                  const c = customers.find((x) => x.id === e.target.value);
                  if (c) {
                    updateEstimate({
                      customerName: c.name,
                      customerAddress: c.address,
                      customerPhone: c.phone,
                    });
                  }
                  e.target.value = "";
                }}
              >
                <option value="">— 選択 —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              取引先名
              <input
                value={estimate.customerName}
                onChange={(e) => updateEstimate({ customerName: e.target.value })}
              />
            </label>
            <label>
              住所
              <input
                value={estimate.customerAddress ?? ""}
                onChange={(e) => updateEstimate({ customerAddress: e.target.value })}
              />
            </label>
            <label>
              電話
              <input
                value={estimate.customerPhone ?? ""}
                onChange={(e) => updateEstimate({ customerPhone: e.target.value })}
              />
            </label>
            <label>
              レイアウト
              <select
                value={estimate.layout}
                onChange={(e) =>
                  updateEstimate({ layout: e.target.value as MockLayoutType })
                }
              >
                <option value="standard">標準</option>
                <option value="simple">シンプル</option>
                <option value="detailed">詳細</option>
                <option value="modern">モダン</option>
              </select>
            </label>
            <label>
              消費税率（%）
              <input
                type="number"
                min={0}
                max={100}
                value={estimate.taxRate}
                onChange={(e) =>
                  updateEstimate({ taxRate: Number(e.target.value) || 0 })
                }
              />
            </label>
            <label>
              備考
              <textarea
                rows={3}
                value={estimate.note ?? ""}
                onChange={(e) => updateEstimate({ note: e.target.value })}
                placeholder="自由記述の備考欄"
              />
            </label>
          </section>

          <section className="panel">
            <div className="section-head">
              <h2>明細（ドラッグで並び替え）</h2>
              <div className="editor-item-actions">
                <label className="btn-secondary file-label">
                  CSV取込
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleImportCsv(f);
                      e.target.value = "";
                    }}
                  />
                </label>
                <select
                  className="master-select"
                  value=""
                  onChange={(e) => {
                    const m = itemMasters.find((x) => x.id === e.target.value);
                    if (m) addItem(m);
                    e.target.value = "";
                  }}
                >
                  <option value="">品目マスタから追加</option>
                  {itemMasters.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}（{m.category}）
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => addItem()}>
                  ＋ 自由入力で追加
                </button>
              </div>
            </div>

            <div className="item-list">
              {estimate.items.map((item, index) => (
                <div
                  key={item.id}
                  className={`item-row${dragIndex === index ? " dragging" : ""}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                >
                  <span className="drag-handle" title="ドラッグして並び替え">
                    ⋮⋮
                  </span>
                  <div className="item-fields">
                    <input
                      placeholder="品目名（自由入力可）"
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                    />
                    <div className="item-row-grid">
                      <label>
                        数量
                        <input
                          type="number"
                          min={0}
                          step="any"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(index, { quantity: Number(e.target.value) })
                          }
                        />
                      </label>
                      <label>
                        単位
                        <input
                          value={item.unit}
                          onChange={(e) => updateItem(index, { unit: e.target.value })}
                        />
                      </label>
                      <label>
                        単価
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(index, { unitPrice: Number(e.target.value) })
                          }
                        />
                      </label>
                      <span className="item-total">
                        金額: {calcItemTotal(item).toLocaleString("ja-JP")}円
                      </span>
                    </div>
                    <input
                      placeholder="備考（任意）"
                      value={item.note ?? ""}
                      onChange={(e) => updateItem(index, { note: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-icon btn-danger"
                    onClick={() => removeItem(index)}
                    disabled={estimate.items.length <= 1}
                    title="削除"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="editor-preview-panel">
          <h2 className="preview-heading">リアルタイムプレビュー</h2>
          <EstimatePreview
            estimate={previewEstimate}
            company={company}
            layout={estimate.layout}
          />
        </aside>
      </div>
    </div>
  );
}
