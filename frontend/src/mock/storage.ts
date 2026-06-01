import type {
  MockEstimate,
  MockCompanyMaster,
  MockCustomerMaster,
  MockItemMaster,
  MockUser,
} from "./types";
import { STORAGE_KEYS } from "./types";

// ローカルストレージへの保存
export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

// ローカルストレージからの読み込み
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item) as T;
    }
    return defaultValue;
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    return defaultValue;
  }
}

// 見積書の保存
export function saveEstimates(estimates: MockEstimate[]): void {
  saveToStorage(STORAGE_KEYS.ESTIMATES, estimates);
}

// 見積書の読み込み
export function loadEstimates(): MockEstimate[] {
  return loadFromStorage<MockEstimate[]>(STORAGE_KEYS.ESTIMATES, []);
}

// 会社マスタの保存
export function saveCompanyMaster(company: MockCompanyMaster): void {
  saveToStorage(STORAGE_KEYS.COMPANY_MASTER, company);
}

// 会社マスタの読み込み
export function loadCompanyMaster(): MockCompanyMaster | null {
  return loadFromStorage<MockCompanyMaster | null>(
    STORAGE_KEYS.COMPANY_MASTER,
    null,
  );
}

// 取引先マスタの保存
export function saveCustomerMaster(customers: MockCustomerMaster[]): void {
  saveToStorage(STORAGE_KEYS.CUSTOMER_MASTER, customers);
}

// 取引先マスタの読み込み
export function loadCustomerMaster(): MockCustomerMaster[] {
  return loadFromStorage<MockCustomerMaster[]>(
    STORAGE_KEYS.CUSTOMER_MASTER,
    [],
  );
}

// 品目マスタの保存
export function saveItemMaster(items: MockItemMaster[]): void {
  saveToStorage(STORAGE_KEYS.ITEM_MASTER, items);
}

// 品目マスタの読み込み
export function loadItemMaster(): MockItemMaster[] {
  return loadFromStorage<MockItemMaster[]>(STORAGE_KEYS.ITEM_MASTER, []);
}

// ユーザーの保存
export function saveUser(user: MockUser): void {
  saveToStorage(STORAGE_KEYS.USER, user);
}

// ユーザーの読み込み
export function loadUser(): MockUser | null {
  return loadFromStorage<MockUser | null>(STORAGE_KEYS.USER, null);
}

// 画像データの保存（Base64）
export function saveImage(key: string, dataUrl: string): void {
  saveToStorage(key, dataUrl);
}

// 画像データの読み込み
export function loadImage(key: string): string | null {
  return loadFromStorage<string | null>(key, null);
}

// 見積書の最大IDを取得
export function getMaxEstimateId(): number {
  const estimates = loadEstimates();
  if (estimates.length === 0) return 0;
  return Math.max(
    ...estimates.map((e) => parseInt(e.id.split("-")[1] || "0", 10)),
  );
}

// ユニークIDの生成
export function generateId(prefix: string, currentMax: number): string {
  return `${prefix}-${currentMax + 1}`;
}
