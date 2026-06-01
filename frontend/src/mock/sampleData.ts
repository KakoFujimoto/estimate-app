import {
  loadCompanyMaster,
  loadCustomerMaster,
  loadEstimates,
  loadItemMaster,
} from "./storage";
import type {
  MockEstimate,
  MockCompanyMaster,
  MockCustomerMaster,
  MockItemMaster,
} from "./types";

// サンプルの会社マスタ
export const sampleCompanyMaster: MockCompanyMaster = {
  id: "company-1",
  name: "サンプル建設株式会社",
  address: "〒100-0001 東京都千代田区サンプル町1-2-3",
  phone: "03-1234-5678",
  email: "info@sample-construction.jp",
  representative: "代表取締役 サンプル太郎",
  logoUrl: undefined,
  stampUrl: undefined,
};

// サンプルの取引先マスタ
export const sampleCustomerMasters: MockCustomerMaster[] = [
  {
    id: "customer-1",
    name: "サンプル商事株式会社",
    address: "〒100-0002 東京都千代田区サンプル町2-3-4",
    phone: "03-2345-6789",
    email: "purchase@sample-shoji.jp",
    contactPerson: "サンプル様",
  },
  {
    id: "customer-2",
    name: "株式会社サンプル工務店",
    address: "〒100-0003 東京都千代田区サンプル町3-4-5",
    phone: "03-3456-7890",
    email: "info@sample-koumuten.jp",
    contactPerson: "工藤様",
  },
];

// サンプルの品目マスタ
export const sampleItemMasters: MockItemMaster[] = [
  {
    id: "item-1",
    name: "鉄骨工事",
    category: "構造",
    unit: "t",
    defaultUnitPrice: 150000,
    note: "鉄骨材工共",
  },
  {
    id: "item-2",
    name: "コンクリート打設",
    category: "構造",
    unit: "m3",
    defaultUnitPrice: 18000,
    note: "型枠・鉄筋共",
  },
  {
    id: "item-3",
    name: "内装仕上げ",
    category: "内装",
    unit: "m2",
    defaultUnitPrice: 12000,
    note: "クロス・床材共",
  },
  {
    id: "item-4",
    name: "電気工事",
    category: "設備",
    unit: "式",
    defaultUnitPrice: 500000,
    note: "配線・器具共",
  },
  {
    id: "item-5",
    name: "給排水工事",
    category: "設備",
    unit: "式",
    defaultUnitPrice: 400000,
    note: "配管・器具共",
  },
  {
    id: "item-6",
    name: "外壁塗装",
    category: "外装",
    unit: "m2",
    defaultUnitPrice: 4500,
    note: "下地処理・塗装共",
  },
  {
    id: "item-7",
    name: "屋根工事",
    category: "外装",
    unit: "m2",
    defaultUnitPrice: 8000,
    note: "防水・葺き替え共",
  },
  {
    id: "item-8",
    name: "解体工事",
    category: "外構",
    unit: "式",
    defaultUnitPrice: 300000,
    note: "廃棄物処理共",
  },
];

// サンプルの見積書
export const sampleEstimates: MockEstimate[] = [
  {
    id: "estimate-1",
    title: "A様邸 増築工事",
    estimateNumber: "見積第2024-001号",
    date: "2024-01-15",
    customerName: "A様",
    customerAddress: "東京都sample区sample町1-1-1",
    customerPhone: "090-1234-5678",
    items: [
      {
        id: "item-1-1",
        name: "鉄骨工事",
        quantity: 5,
        unit: "t",
        unitPrice: 150000,
        totalPrice: 750000,
        note: "増築部分",
      },
      {
        id: "item-1-2",
        name: "コンクリート打設",
        quantity: 20,
        unit: "m3",
        unitPrice: 18000,
        totalPrice: 360000,
        note: "基礎部分",
      },
      {
        id: "item-1-3",
        name: "内装仕上げ",
        quantity: 50,
        unit: "m2",
        unitPrice: 12000,
        totalPrice: 600000,
        note: "2階部分",
      },
    ],
    subtotal: 1710000,
    taxRate: 10,
    tax: 171000,
    total: 1881000,
    layout: "standard",
    note: "お見積もりありがとうございます。",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "estimate-2",
    title: "B様邸 リフォーム工事",
    estimateNumber: "見積第2024-002号",
    date: "2024-01-20",
    customerName: "B様",
    customerAddress: "東京都sample区sample町2-2-2",
    customerPhone: "090-2345-6789",
    items: [
      {
        id: "item-2-1",
        name: "外壁塗装",
        quantity: 100,
        unit: "m2",
        unitPrice: 4500,
        totalPrice: 450000,
        note: "全面塗装",
      },
      {
        id: "item-2-2",
        name: "屋根工事",
        quantity: 60,
        unit: "m2",
        unitPrice: 8000,
        totalPrice: 480000,
        note: "葺き替え",
      },
    ],
    subtotal: 930000,
    taxRate: 10,
    tax: 93000,
    total: 1023000,
    layout: "simple",
    createdAt: "2024-01-20T14:00:00Z",
    updatedAt: "2024-01-20T14:00:00Z",
  },
];

// 初期データの初期化
export async function initializeSampleData(): Promise<void> {
  const {
    saveEstimates,
    saveCompanyMaster,
    saveCustomerMaster,
    saveItemMaster,
  } = await import("./storage");

  // 見積書が空の場合のみサンプルデータを保存
  const existingEstimates = loadEstimates();
  if (existingEstimates.length === 0) {
    saveEstimates(sampleEstimates);
  }

  // 会社マスタが空の場合のみサンプルデータを保存
  const existingCompany = loadCompanyMaster();
  if (!existingCompany) {
    saveCompanyMaster(sampleCompanyMaster);
  }

  // 取引先マスタが空の場合のみサンプルデータを保存
  const existingCustomers = loadCustomerMaster();
  if (existingCustomers.length === 0) {
    saveCustomerMaster(sampleCustomerMasters);
  }

  // 品目マスタが空の場合のみサンプルデータを保存
  const existingItems = loadItemMaster();
  if (existingItems.length === 0) {
    saveItemMaster(sampleItemMasters);
  }
}
