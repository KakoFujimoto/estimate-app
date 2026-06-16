import type { Estimate, EstimateInput } from "../types/estimate";
import { apiFetch } from "./client";

export async function fetchEstimates(): Promise<Estimate[]> {
  return apiFetch<Estimate[]>("/estimates");
}

export async function fetchEstimateById(id: number): Promise<Estimate> {
  return apiFetch<Estimate>(`/estimates/${id}`);
}

export async function createEstimate(input: EstimateInput): Promise<Estimate> {
  return apiFetch<Estimate>("/estimates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateEstimate(
  id: number,
  input: EstimateInput,
): Promise<Estimate> {
  return apiFetch<Estimate>(`/estimates/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteEstimate(id: number): Promise<void> {
  await apiFetch<void>(`/estimates/${id}`, { method: "DELETE" });
}

export async function duplicateEstimate(id: number): Promise<Estimate> {
  return apiFetch<Estimate>(`/estimates/${id}/duplicate`, {
    method: "POST",
  });
}
