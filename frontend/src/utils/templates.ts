import type { LayoutType } from "../types/estimate";

export interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  layout: LayoutType;
  title: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    note?: string;
  }[];
  note?: string;
}

export const estimateTemplates: EstimateTemplate[] = [
  {
    id: "tpl-new-build",
    name: "新築工事（標準）",
    description: "構造・内装・設備の基本パッケージ",
    layout: "standard",
    title: "新築工事 お見積書",
    items: [
      { name: "鉄骨工事", quantity: 8, unit: "t", unitPrice: 150000, note: "材工共" },
      { name: "コンクリート打設", quantity: 30, unit: "m3", unitPrice: 18000, note: "基礎・スラブ" },
      { name: "内装仕上げ", quantity: 120, unit: "m2", unitPrice: 12000 },
      { name: "電気工事", quantity: 1, unit: "式", unitPrice: 800000 },
      { name: "給排水工事", quantity: 1, unit: "式", unitPrice: 650000 },
    ],
    note: "上記は概算です。現地調査後に正式見積を提出いたします。",
  },
  {
    id: "tpl-reform",
    name: "リフォーム工事",
    description: "外装・内装の改修向け",
    layout: "simple",
    title: "リフォーム工事 お見積書",
    items: [
      { name: "外壁塗装", quantity: 80, unit: "m2", unitPrice: 4500, note: "3回塗り" },
      { name: "屋根工事", quantity: 45, unit: "m2", unitPrice: 8000, note: "葺き替え" },
      { name: "内装仕上げ", quantity: 40, unit: "m2", unitPrice: 12000 },
    ],
  },
  {
    id: "tpl-extension",
    name: "増築工事",
    description: "増築・改築向けの簡易テンプレート",
    layout: "detailed",
    title: "増築工事 お見積書",
    items: [
      { name: "解体工事", quantity: 1, unit: "式", unitPrice: 300000 },
      { name: "鉄骨工事", quantity: 3, unit: "t", unitPrice: 150000 },
      { name: "コンクリート打設", quantity: 12, unit: "m3", unitPrice: 18000 },
    ],
  },
];
