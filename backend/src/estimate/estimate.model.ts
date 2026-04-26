export interface EstimateItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Estimate {
  id: number;
  title: string;
  items: EstimateItem[];
}
