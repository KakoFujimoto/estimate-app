import type { LoginResponse } from "../types/auth";
import { apiFetch } from "./client";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function requestPasswordReset(
  email: string,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/password-reset", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
