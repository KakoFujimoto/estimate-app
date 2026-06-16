export type LayoutType = "standard" | "simple" | "detailed" | "modern";

export type EstimateItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  note?: string | null;
};

export type Estimate = {
  id: number;
  title: string;
  estimateNumber: string;
  date: string;
  customerName: string;
  customerAddress?: string | null;
  customerPhone?: string | null;
  items: EstimateItem[];
  subtotal: number;
  taxRate: number;
  tax: number;
  total: number;
  note?: string | null;
  layout: LayoutType;
  logoUrl?: string | null;
  stampUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EstimateItemInput = {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  note?: string;
};

export type EstimateInput = {
  title: string;
  estimateNumber?: string;
  date?: string;
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  items: EstimateItemInput[];
  taxRate?: number;
  note?: string;
  layout?: LayoutType;
  logoUrl?: string;
  stampUrl?: string;
};

/** Local draft before first save */
export type EstimateDraft = Omit<Estimate, "id" | "createdAt" | "updatedAt"> & {
  id?: number;
};
