import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMockAuth } from "../../contexts/MockAuthContext";

export function DemoLogin() {
  const { isAuthenticated, login, resetPassword } = useMockAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@sample-construction.jp");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showReset, setShowReset] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/demo" replace />;
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      navigate("/demo");
    } else {
      setMessage("ログインに失敗しました");
    }
  };

  const handleReset = async () => {
    setLoading(true);
    await resetPassword(email);
    setLoading(false);
    setMessage("パスワードリセット用のメールを送信しました（デモ）");
    setShowReset(false);
  };

  return (
    <div className="demo-login-page">
      <div className="demo-login-card panel">
        <div className="demo-brand demo-brand-center">
          <span className="demo-brand-icon">見</span>
          <div>
            <strong>Estimate App</strong>
            <small>建築業向け見積作成</small>
          </div>
        </div>

        <h1>ログイン</h1>
        <p className="demo-hint">
          デモ用です。任意のメール・パスワードでログインできます。
        </p>

        {!showReset ? (
          <form onSubmit={(e) => void handleLogin(e)} className="form-grid">
            <label>
              メールアドレス
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </label>
            <label>
              パスワード
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>
            {message && <p className={message.includes("失敗") ? "error" : "success"}>{message}</p>}
            <button type="submit" disabled={loading}>
              {loading ? "ログイン中..." : "ログイン"}
            </button>
            <button
              type="button"
              className="btn-link"
              onClick={() => setShowReset(true)}
            >
              パスワードをお忘れですか？
            </button>
          </form>
        ) : (
          <div className="form-grid">
            <p>登録メールアドレスにリセットリンクを送信します（モック）</p>
            <label>
              メールアドレス
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            {message && <p className="success">{message}</p>}
            <button type="button" onClick={() => void handleReset()} disabled={loading}>
              送信
            </button>
            <button type="button" className="btn-link" onClick={() => setShowReset(false)}>
              ログインに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
