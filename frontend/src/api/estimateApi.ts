import type { CreateEstimateInput, Estimate } from "../types/estimate";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api";

export async function fetchEstimates(): Promise<Estimate[]> {
  const response = await fetch(`${API_BASE_URL}/estimates`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("見積一覧の取得に失敗しました");
  }

  return (await response.json()) as Estimate[];
}

export async function createEstimate(
  input: CreateEstimateInput,
): Promise<Estimate> {
  const response = await fetch(`${API_BASE_URL}/estimates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("見積の作成に失敗しました");
  }

  return (await response.json()) as Estimate;
}
