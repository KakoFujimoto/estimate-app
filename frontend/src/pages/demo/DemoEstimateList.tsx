import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  deleteEstimate,
  duplicateEstimate,
  fetchEstimates,
} from "../../api/estimateApi";
import type { Estimate } from "../../types/estimate";
import { formatYen } from "../../utils/calculations";

export function DemoEstimateList() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      setEstimates(await fetchEstimates());
      setError("");
    } catch {
      setError("見積一覧の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("この見積を削除しますか？")) return;
    await deleteEstimate(id);
    await load();
  };

  const handleDuplicate = async (id: number) => {
    const copy = await duplicateEstimate(id);
    navigate(`/demo/estimates/${copy.id}`);
  };

  return (
    <div>
      <div className="section-head">
        <div>
          <h1 className="page-title">見積一覧</h1>
          <p className="page-desc">作成済みの見積書を管理します</p>
        </div>
        <Link to="/demo/estimates/new" className="btn-primary">
          ＋ 新規見積
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      <section className="panel">
        {loading ? (
          <p>読み込み中...</p>
        ) : estimates.length === 0 ? (
          <p>
            見積がありません。
            <Link to="/demo/estimates/new">新規作成</Link>してください。
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>見積番号</th>
                <th>タイトル</th>
                <th>取引先</th>
                <th>日付</th>
                <th>レイアウト</th>
                <th className="col-num">合計（税込）</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {estimates.map((est) => (
                <tr key={est.id}>
                  <td>{est.estimateNumber}</td>
                  <td>
                    <Link to={`/demo/estimates/${est.id}`}>{est.title}</Link>
                  </td>
                  <td>{est.customerName}</td>
                  <td>{est.date}</td>
                  <td>{est.layout}</td>
                  <td className="col-num">{formatYen(est.total)}</td>
                  <td className="demo-actions-cell">
                    <Link to={`/demo/estimates/${est.id}`}>編集</Link>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => void handleDuplicate(est.id)}
                    >
                      複製
                    </button>
                    <button
                      type="button"
                      className="btn-link btn-danger"
                      onClick={() => void handleDelete(est.id)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
