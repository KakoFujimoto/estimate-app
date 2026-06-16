import type {
  Company,
  CompanyInput,
  Customer,
  CustomerInput,
  ItemMaster,
  ItemMasterInput,
} from "../types/master";
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

export async function replaceCustomers(
  customers: CustomerInput[],
): Promise<Customer[]> {
  return apiFetch<Customer[]>("/masters/customers/bulk", {
    method: "PUT",
    body: JSON.stringify(customers),
  });
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
