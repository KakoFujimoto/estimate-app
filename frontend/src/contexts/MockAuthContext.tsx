import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadUser, saveUser } from "../mock/storage";
import type { MockUser } from "../mock/types";

type MockAuthContextValue = {
  user: MockUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
};

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

const DEMO_USER: MockUser = {
  id: "user-1",
  email: "demo@sample-construction.jp",
  name: "デモユーザー",
  companyId: "company-1",
  isLoggedIn: true,
};

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    setUser(loadUser());
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const loggedIn: MockUser = {
      ...DEMO_USER,
      email: email.trim() || DEMO_USER.email,
      isLoggedIn: true,
    };
    saveUser(loggedIn);
    setUser(loggedIn);
    return true;
  }, []);

  const logout = useCallback(() => {
    saveUser({ ...DEMO_USER, isLoggedIn: false });
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (_email: string) => {
    await new Promise((r) => setTimeout(r, 500));
    return true;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user?.isLoggedIn),
      login,
      logout,
      resetPassword,
    }),
    [user, login, logout, resetPassword],
  );

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>;
}

export function useMockAuth(): MockAuthContextValue {
  const ctx = useContext(MockAuthContext);
  if (!ctx) throw new Error("useMockAuth must be used within MockAuthProvider");
  return ctx;
}
