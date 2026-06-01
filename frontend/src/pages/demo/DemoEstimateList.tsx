import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatYen } from "../../mock/calculations";
import { loadEstimates, saveEstimates } from "../../mock/storage";
import type { MockEstimate } from "../../mock/types";

export function DemoEstimateList() {
  const [estimates, setEstimates] = useState<MockEstimate[]>(() => loadEstimates());
  const navigate = useNavigate();

  const handleDelete = (id: string) => {
    if (!window.confirm("この見積を削除しますか？")) return;
    const next = estimates.filter((e) => e.id !== id);
    saveEstimates(next);
    setEstimates(next);
  };

  const handleDuplicate = (est: MockEstimate) => {
    const copy: MockEstimate = {
      ...est,
      id: `estimate-${Date.now()}`,
      title: `${est.title}（コピー）`,
      estimateNumber: `見積第${new Date().getFullYear()}-${String(estimates.length + 1).padStart(3, "0")}号`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: est.items.map((item) => ({
        ...item,
        id: `${item.id}-copy-${Date.now()}`,
      })),
    };
    const next = [...estimates, copy];
    saveEstimates(next);
    setEstimates(next);
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

      <section className="panel">
        {estimates.length === 0 ? (
          <p>
            見積がありません。
            <Link to="/demo/estimates/new">新規作成</Link>
            するか、サンプルデータを再読み込みしてください。
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
                      onClick={() => handleDuplicate(est)}
                    >
                      複製
                    </button>
                    <button
                      type="button"
                      className="btn-link btn-danger"
                      onClick={() => handleDelete(est.id)}
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
