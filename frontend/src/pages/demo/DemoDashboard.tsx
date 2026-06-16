import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchEstimates } from "../../api/estimateApi";
import type { Estimate } from "../../types/estimate";
import { formatYen } from "../../utils/calculations";

export function DemoDashboard() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void (async () => {
      try {
        setEstimates(await fetchEstimates());
      } catch {
        setError("見積データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const recent = estimates.slice(0, 5);
  const totalAmount = estimates.reduce((s, e) => s + e.total, 0);

  return (
    <div>
      <h1 className="page-title">ダッシュボード</h1>
      <p className="page-desc">
        建築業向け見積作成アプリです。データはサーバー（SQLite）に保存されます。
      </p>

      {error && <p className="error">{error}</p>}

      <div className="demo-stats">
        <div className="demo-stat-card">
          <span className="demo-stat-label">見積件数</span>
          <span className="demo-stat-value">{loading ? "…" : estimates.length}</span>
        </div>
        <div className="demo-stat-card">
          <span className="demo-stat-label">見積合計（税込）</span>
          <span className="demo-stat-value">
            {loading ? "…" : formatYen(totalAmount)}
          </span>
        </div>
      </div>

      <div className="demo-quick-actions">
        <Link to="/demo/estimates/new" className="demo-action-card">
          <strong>＋ 新規見積</strong>
          <span>テンプレートから作成、リアルタイムプレビュー</span>
        </Link>
        <Link to="/demo/masters" className="demo-action-card">
          <strong>マスタ管理</strong>
          <span>会社・取引先・品目の登録</span>
        </Link>
        <Link to="/demo/settings" className="demo-action-card">
          <strong>設定</strong>
          <span>ロゴ・印影、レイアウト、CSVインポート</span>
        </Link>
      </div>

      <section className="panel">
        <div className="section-head">
          <h2>最近の見積</h2>
          <Link to="/demo/estimates">すべて見る →</Link>
        </div>
        {loading ? (
          <p>読み込み中...</p>
        ) : recent.length === 0 ? (
          <p>
            見積がありません。<Link to="/demo/estimates/new">新規作成</Link>してください。
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>タイトル</th>
                <th>取引先</th>
                <th>日付</th>
                <th className="col-num">合計</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((est) => (
                <tr key={est.id}>
                  <td>
                    <Link to={`/demo/estimates/${est.id}`}>{est.title}</Link>
                  </td>
                  <td>{est.customerName}</td>
                  <td>{est.date}</td>
                  <td className="col-num">{formatYen(est.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
