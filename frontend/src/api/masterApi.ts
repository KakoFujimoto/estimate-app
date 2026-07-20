import type {
  Company,
  CompanyInput,
  Customer,
  CustomerInput,
  ItemMaster,
  ItemMasterInput,
} from "../types/master";
import type { PostalCodeSearchResult } from "../utils/addressUtils";
import { apiFetch } from "./client";

export async function fetchCompany(): Promise<Company> {
  return apiFetch<Company>("/masters/company");
}

export async function updateCompany(input: CompanyInput): Promise<Company> {
  return apiFetch<Company>("/masters/company", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function fetchCustomers(): Promise<Customer[]> {
  return apiFetch<Customer[]>("/masters/customers");
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  return apiFetch<Customer>("/masters/customers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateCustomer(
  id: number,
  input: CustomerInput,
): Promise<Customer> {
  return apiFetch<Customer>(`/masters/customers/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiFetch<void>(`/masters/customers/${id}`, { method: "DELETE" });
}

export async function replaceCustomers(
  customers: CustomerInput[],
): Promise<Customer[]> {
  return apiFetch<Customer[]>("/masters/customers/bulk", {
    method: "PUT",
    body: JSON.stringify(customers),
  });
}

export async function searchPostalCode(
  zipcode: string,
): Promise<PostalCodeSearchResult[]> {
  const query = new URLSearchParams({ zipcode });
  return apiFetch<PostalCodeSearchResult[]>(
    `/masters/postal-code/search?${query.toString()}`,
  );
}

export async function fetchItemMasters(): Promise<ItemMaster[]> {
  return apiFetch<ItemMaster[]>("/masters/items");
}

export async function replaceItemMasters(
  items: ItemMasterInput[],
): Promise<ItemMaster[]> {
  return apiFetch<ItemMaster[]>("/masters/items/bulk", {
    method: "PUT",
    body: JSON.stringify(items),
  });
}
