import { useEffect, useState } from "react";
import { fetchCompany, updateCompany } from "../../api/masterApi";
import type { Company } from "../../types/master";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DemoSettings() {
  const [company, setCompany] = useState<Company | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setCompany(await fetchCompany());
      } catch {
        setError("会社情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveImages = async (patch: Partial<Company>) => {
    if (!company) return;
    const saved = await updateCompany({ ...company, ...patch });
    setCompany(saved);
    setMessage("保存しました");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleImageUpload = async (
    file: File | undefined,
    field: "logoUrl" | "stampUrl",
  ) => {
    if (!file || !company) return;
    const dataUrl = await readFileAsDataUrl(file);
    await saveImages({ [field]: dataUrl });
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!company) return null;

  return (
    <div>
      <h1 className="page-title">設定</h1>
      <p className="page-desc">ロゴ・印影の登録（サーバーに保存）</p>
      {message && <p className="success">{message}</p>}

      <section className="panel">
        <h2>画像管理（ロゴ・印影）</h2>
        <p className="demo-hint">
          アップロードした画像は見積プレビュー・PDF出力に反映されます。印影はURL直リンクにも対応しています。
        </p>

        <div className="image-upload-grid">
          <div className="image-upload-card">
            <h3>会社ロゴ</h3>
            {company.logoUrl ? (
              <img src={company.logoUrl} alt="ロゴ" className="upload-preview" />
            ) : (
              <div className="upload-placeholder">未登録</div>
            )}
            <label className="btn-secondary file-label">
              画像を選択
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  void handleImageUpload(e.target.files?.[0], "logoUrl")
                }
              />
            </label>
            {company.logoUrl && (
              <button
                type="button"
                className="btn-link"
                onClick={() => void saveImages({ logoUrl: null })}
              >
                削除
              </button>
            )}
          </div>

          <div className="image-upload-card">
            <h3>印影</h3>
            {company.stampUrl ? (
              <img src={company.stampUrl} alt="印影" className="upload-preview stamp-preview" />
            ) : (
              <div className="upload-placeholder">未登録</div>
            )}
            <label className="btn-secondary file-label">
              画像を選択
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) =>
                  void handleImageUpload(e.target.files?.[0], "stampUrl")
                }
              />
            </label>
            <label className="form-grid" style={{ marginTop: 12 }}>
              または URL（直リン）
              <input
                placeholder="https://..."
                defaultValue={
                  company.stampUrl?.startsWith("http") ? company.stampUrl : ""
                }
                onBlur={(e) => {
                  const url = e.target.value.trim();
                  if (url) void saveImages({ stampUrl: url });
                }}
              />
            </label>
            {company.stampUrl && (
              <button
                type="button"
                className="btn-link"
                onClick={() => void saveImages({ stampUrl: null })}
              >
                削除
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
