// 見積書アイテム
export interface MockEstimateItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}

// 見積書
export interface MockEstimate {
  id: string;
  title: string;
  estimateNumber: string;
  date: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  items: MockEstimateItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  note?: string;
  layout: MockLayoutType;
  logoUrl?: string;
  stampUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// レイアウトタイプ
export type MockLayoutType = "standard" | "simple" | "detailed" | "modern";

// 会社情報マスタ
export interface MockCompanyMaster {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  representative: string;
  logoUrl?: string;
  stampUrl?: string;
}

// 取引先マスタ
export interface MockCustomerMaster {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  contactPerson?: string;
}

// 品目マスタ
export interface MockItemMaster {
  id: string;
  name: string;
  category: string;
  unit: string;
  defaultUnitPrice: number;
  note?: string;
}

// ユーザー
export interface MockUser {
  id: string;
  email: string;
  name: string;
  companyId?: string;
  isLoggedIn: boolean;
}

// ローカルストレージキー
export const STORAGE_KEYS = {
  ESTIMATES: "mock_estimates",
  COMPANY_MASTER: "mock_company_master",
  CUSTOMER_MASTER: "mock_customer_master",
  ITEM_MASTER: "mock_item_master",
  USER: "mock_user",
  LOGO: "mock_logo",
  STAMP: "mock_stamp",
} as const;
