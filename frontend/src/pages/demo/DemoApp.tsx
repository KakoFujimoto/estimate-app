import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const navItems = [
  { to: "/demo", label: "ホーム", end: true },
  { to: "/demo/estimates", label: "見積一覧", end: true },
  { to: "/demo/estimates/new", label: "見積作成" },
  { to: "/demo/masters", label: "マスタ管理" },
  { to: "/demo/settings", label: "設定" },
];

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function DemoApp() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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

        <div className="demo-sidebar-tools">
          <button
            type="button"
            className="demo-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
            title={isDark ? "ライトモード" : "ダークモード"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>

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
