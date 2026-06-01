import { useState } from "react";
import { initializeSampleData } from "../../mock/sampleData";
import {
  loadCompanyMaster,
  loadImage,
  saveCompanyMaster,
  saveImage,
} from "../../mock/storage";
import { STORAGE_KEYS } from "../../mock/types";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function DemoSettings() {
  const [logoUrl, setLogoUrl] = useState<string | null>(() => loadImage(STORAGE_KEYS.LOGO));
  const [stampUrl, setStampUrl] = useState<string | null>(() => loadImage(STORAGE_KEYS.STAMP));
  const [message, setMessage] = useState("");

  const handleImageUpload = async (
    file: File | undefined,
    key: string,
    setter: (url: string | null) => void,
  ) => {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    saveImage(key, dataUrl);
    setter(dataUrl);

    const company = loadCompanyMaster();
    if (company) {
      saveCompanyMaster({
        ...company,
        ...(key === STORAGE_KEYS.LOGO ? { logoUrl: dataUrl } : { stampUrl: dataUrl }),
      });
    }

    setMessage("画像を登録しました");
    setTimeout(() => setMessage(""), 2000);
  };

  const handleResetData = async () => {
    if (!window.confirm("サンプルデータで初期化しますか？（既存データは上書きされます）")) {
      return;
    }
    localStorage.removeItem(STORAGE_KEYS.ESTIMATES);
    localStorage.removeItem(STORAGE_KEYS.COMPANY_MASTER);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_MASTER);
    localStorage.removeItem(STORAGE_KEYS.ITEM_MASTER);
    await initializeSampleData();
    setMessage("サンプルデータを再読み込みしました。ページを更新してください。");
  };

  return (
    <div>
      <h1 className="page-title">設定</h1>
      <p className="page-desc">ロゴ・印影の登録、データの初期化</p>
      {message && <p className="success">{message}</p>}

      <section className="panel">
        <h2>画像管理（ロゴ・印影）</h2>
        <p className="demo-hint">
          アップロードした画像は見積プレビュー・PDF出力に反映されます。SAK画像のURL直リンクにも対応可能な想定です（デモではファイルアップロード）。
        </p>

        <div className="image-upload-grid">
          <div className="image-upload-card">
            <h3>会社ロゴ</h3>
            {logoUrl ? (
              <img src={logoUrl} alt="ロゴ" className="upload-preview" />
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
                  void handleImageUpload(e.target.files?.[0], STORAGE_KEYS.LOGO, setLogoUrl)
                }
              />
            </label>
            {logoUrl && (
              <button type="button" className="btn-link" onClick={() => {
                saveImage(STORAGE_KEYS.LOGO, "");
                setLogoUrl(null);
              }}>
                削除
              </button>
            )}
          </div>

          <div className="image-upload-card">
            <h3>印影</h3>
            {stampUrl ? (
              <img src={stampUrl} alt="印影" className="upload-preview stamp-preview" />
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
                  void handleImageUpload(e.target.files?.[0], STORAGE_KEYS.STAMP, setStampUrl)
                }
              />
            </label>
            <label className="form-grid" style={{ marginTop: 12 }}>
              または URL（直リン）
              <input
                placeholder="https://..."
                onBlur={(e) => {
                  const url = e.target.value.trim();
                  if (url) {
                    saveImage(STORAGE_KEYS.STAMP, url);
                    setStampUrl(url);
                  }
                }}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>データ管理</h2>
        <p className="demo-hint">
          初回起動時にサンプルの見積・マスタが読み込まれます。データをリセットする場合は以下を実行してください。
        </p>
        <button type="button" className="btn-secondary" onClick={() => void handleResetData()}>
          サンプルデータで初期化
        </button>
      </section>
    </div>
  );
}
