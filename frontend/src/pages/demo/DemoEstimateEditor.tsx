import { DragEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createEstimate,
  fetchEstimateById,
  updateEstimate,
} from "../../api/estimateApi";
import {
  fetchCompany,
  fetchCustomers,
  fetchItemMasters,
} from "../../api/masterApi";
import { EstimatePreview } from "../../components/demo/EstimatePreview";
import { EstimateTotalsForm } from "../../components/demo/EstimateTotalsForm";
import type { Estimate, EstimateItem, LayoutType } from "../../types/estimate";
import type { Company, Customer, ItemMaster } from "../../types/master";
import {
  calcItemTax,
  calcItemTotal,
  formatYen,
  recalcEstimate,
  toEstimateInput,
} from "../../utils/calculations";
import { downloadCsv, estimateToCsv, parseCsvToItems } from "../../utils/csvUtils";
import { printEstimate } from "../../utils/exportUtils";
import { estimateTemplates } from "../../utils/templates";

let tempItemId = -1;

function createEmptyItem(taxRate = 10): EstimateItem {
  tempItemId -= 1;
  return {
    id: tempItemId,
    name: "",
    quantity: 1,
    unit: "式",
    unitPrice: 0,
    totalPrice: 0,
    taxRate,
  };
}

function createNewDraft(): Estimate {
  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  return recalcEstimate({
    id: 0,
    title: "",
    estimateNumber: `見積第${year}-XXX号`,
    date: now.slice(0, 10),
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

  const [estimate, setEstimate] = useState<Estimate>(() =>
    isNew ? createNewDraft() : createNewDraft(),
  );
  const [company, setCompany] = useState<Company | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [itemMasters, setItemMasters] = useState<ItemMaster[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const [c, cust, items] = await Promise.all([
          fetchCompany(),
          fetchCustomers(),
          fetchItemMasters(),
        ]);
        setCompany(c);
        setCustomers(cust);
        setItemMasters(items);
      } catch {
        // masters load error handled silently; save will still work
      }
    })();
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    void (async () => {
      setLoading(true);
      try {
        const data = await fetchEstimateById(Number(id));
        setEstimate(recalcEstimate(data));
        setNotFound(false);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isNew]);

  const updateEstimateState = useCallback((patch: Partial<Estimate>) => {
    setEstimate((prev) => recalcEstimate({ ...prev, ...patch }));
  }, []);

  const updateItem = (index: number, patch: Partial<EstimateItem>) => {
    setEstimate((prev) => {
      const items = prev.items.map((item, i) => {
        if (i !== index) return item;
        const next = { ...item, ...patch };
        return { ...next, totalPrice: calcItemTotal(next) };
      });
      return recalcEstimate({ ...prev, items });
    });
  };

  const addItem = (fromMaster?: ItemMaster) => {
    setEstimate((prev) => {
      const base = createEmptyItem(prev.taxRate);
      const newItem = fromMaster
        ? {
            ...base,
            name: fromMaster.name,
            quantity: 1,
            unit: fromMaster.unit,
            unitPrice: fromMaster.defaultUnitPrice,
            totalPrice: fromMaster.defaultUnitPrice,
            note: fromMaster.note,
          }
        : base;

      return recalcEstimate({ ...prev, items: [...prev.items, newItem] });
    });
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
    const items: EstimateItem[] = tpl.items.map((item) => ({
      ...createEmptyItem(estimate.taxRate),
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      totalPrice: calcItemTotal(item),
      note: item.note ?? null,
    }));
    updateEstimateState({
      title: tpl.title,
      layout: tpl.layout,
      note: tpl.note ?? null,
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const input = toEstimateInput(recalcEstimate(estimate));
      if (isNew || estimate.id === 0) {
        const saved = await createEstimate(input);
        setSavedMessage("保存しました");
        navigate(`/demo/estimates/${saved.id}`, { replace: true });
      } else {
        const saved = await updateEstimate(estimate.id, input);
        setEstimate(recalcEstimate(saved));
        setSavedMessage("保存しました");
      }
      setTimeout(() => setSavedMessage(""), 2000);
    } catch {
      alert("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const handleExportCsv = () => {
    downloadCsv(`${estimate.title || "見積"}.csv`, estimateToCsv(recalcEstimate(estimate)));
  };

  const handleExportPdf = () => {
    printEstimate(recalcEstimate(estimate), company);
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
      const items: EstimateItem[] = result.items.map((item) => ({
        ...createEmptyItem(estimate.taxRate),
        ...item,
        totalPrice: calcItemTotal(item),
      }));
      updateEstimateState({ items });
    };
    reader.readAsText(file);
  };

  const previewEstimate = useMemo(() => recalcEstimate(estimate), [estimate]);

  if (loading) return <p>読み込み中...</p>;

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
          <button
            type="button"
            className="btn-primary"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? "保存中..." : "保存"}
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
                onChange={(e) => updateEstimateState({ title: e.target.value })}
                placeholder="例: A様邸 新築工事"
              />
            </label>
            <label>
              見積番号
              <input
                value={estimate.estimateNumber}
                onChange={(e) =>
                  updateEstimateState({ estimateNumber: e.target.value })
                }
              />
            </label>
            <label>
              見積日
              <input
                type="date"
                value={estimate.date}
                onChange={(e) => updateEstimateState({ date: e.target.value })}
              />
            </label>
            <label>
              取引先（マスタから選択）
              <select
                value=""
                onChange={(e) => {
                  const c = customers.find((x) => x.id === Number(e.target.value));
                  if (c) {
                    updateEstimateState({
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
                onChange={(e) =>
                  updateEstimateState({ customerName: e.target.value })
                }
              />
            </label>
            <label>
              住所
              <input
                value={estimate.customerAddress ?? ""}
                onChange={(e) =>
                  updateEstimateState({ customerAddress: e.target.value })
                }
              />
            </label>
            <label>
              電話
              <input
                value={estimate.customerPhone ?? ""}
                onChange={(e) =>
                  updateEstimateState({ customerPhone: e.target.value })
                }
              />
            </label>
            <label>
              レイアウト
              <select
                value={estimate.layout}
                onChange={(e) =>
                  updateEstimateState({
                    layout: e.target.value as LayoutType,
                  })
                }
              >
                <option value="standard">標準</option>
                <option value="simple">シンプル</option>
                <option value="detailed">詳細</option>
                <option value="modern">モダン</option>
              </select>
            </label>
            <label>
              備考
              <textarea
                rows={3}
                value={estimate.note ?? ""}
                onChange={(e) => updateEstimateState({ note: e.target.value })}
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
                    const m = itemMasters.find((x) => x.id === Number(e.target.value));
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
                        税率
                        <select
                          value={item.taxRate}
                          onChange={(e) =>
                            updateItem(index, { taxRate: Number(e.target.value) })
                          }
                        >
                          <option value={10}>10%</option>
                          <option value={8}>8%</option>
                          <option value={0}>非課税</option>
                        </select>
                      </label>
                      <span className="item-total">
                        金額: {formatYen(calcItemTotal(item))}
                      </span>
                      <span className="item-tax">
                        税額: {formatYen(calcItemTax(item, estimate.taxRate))}
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

          <EstimateTotalsForm
            estimate={previewEstimate}
            onDefaultTaxRateChange={(taxRate) => updateEstimateState({ taxRate })}
          />
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
