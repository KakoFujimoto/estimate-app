export type Company = {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  representative: string;
  logoUrl?: string | null;
  stampUrl?: string | null;
};

export type Customer = {
  id: number;
  name: string;
  address: string;
  phone: string;
  email?: string | null;
  contactPerson?: string | null;
};

export type ItemMaster = {
  id: number;
  name: string;
  category: string;
  unit: string;
  defaultUnitPrice: number;
  note?: string | null;
};

export type CompanyInput = Omit<Company, "id">;
export type CustomerInput = Omit<Customer, "id">;
export type ItemMasterInput = Omit<ItemMaster, "id">;
