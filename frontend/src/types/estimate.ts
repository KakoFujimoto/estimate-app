export type EstimateItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type Estimate = {
  id: number;
  title: string;
  items: EstimateItem[];
};

export type CreateEstimateItemInput = {
  name: string;
  price: number;
  quantity: number;
};

export type CreateEstimateInput = {
  title: string;
  items: CreateEstimateItemInput[];
};
