import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { to: "/demo", label: "ホーム", end: true },
  { to: "/demo/estimates", label: "見積一覧", end: true },
  { to: "/demo/estimates/new", label: "見積作成" },
  { to: "/demo/masters", label: "マスタ管理" },
  { to: "/demo/settings", label: "設定" },
];

export function DemoApp() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p className="demo-login-page">読み込み中...</p>;
  }

  if (!isAuthenticated && !location.pathname.endsWith("/login")) {
    return <Navigate to="/demo/login" replace />;
  }

  if (location.pathname.endsWith("/login")) {
    return <Outlet />;
  }

  return (
    <div className="demo-shell">
      <aside className="demo-sidebar">
        <div className="demo-brand">
          <span className="demo-brand-icon">見</span>
          <div>
            <strong>Estimate App</strong>
            <small>建築見積</small>
          </div>
        </div>

        <nav className="demo-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `demo-nav-link${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="demo-sidebar-footer">
          <p className="demo-user">{user?.name}</p>
          <p className="demo-user-email">{user?.email}</p>
          <button type="button" className="btn-secondary btn-sm" onClick={logout}>
            ログアウト
          </button>
        </div>
      </aside>

      <div className="demo-main">
        <header className="demo-topbar">
          <span className="demo-demo-badge">API連携（SQLite保存）</span>
        </header>
        <div className="demo-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
