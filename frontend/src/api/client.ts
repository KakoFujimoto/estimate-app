const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "/api";

const TOKEN_KEY = "estimate_app_token";
const USER_KEY = "estimate_app_user";

/** AuthContext が購読し、UI 上のログイン状態を同期する */
export const AUTH_UNAUTHORIZED_EVENT = "estimate-app:unauthorized";

/** バックエンド起動待ち（Nest の watch 起動で十数秒かかることがある） */
const MAX_RETRIES = 5;
const RETRY_BASE_DELAY_MS = 1500;

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function notifyUnauthorized(): void {
  clearAuthSession();
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isAuthPath(path: string): boolean {
  return path.startsWith("/auth/");
}

/** ネットワーク障害・バックエンド未起動（proxy 5xx）向け */
function isRetryableStatus(status: number): boolean {
  return status >= 500;
}

async function parseErrorMessage(response: Response): Promise<string> {
  let message = "リクエストに失敗しました";
  try {
    const body = (await response.json()) as { message?: string | string[] };
    if (typeof body.message === "string") message = body.message;
    else if (Array.isArray(body.message)) message = body.message.join(", ");
  } catch {
    // ignore non-JSON bodies (e.g. Vite proxy errors)
  }
  return message;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  attempt = 0,
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
      return apiFetch<T>(path, options, attempt + 1);
    }
    throw new ApiError("リクエストに失敗しました", 0);
  }

  if (!response.ok) {
    if (response.status === 401) {
      // ログイン失敗など認証 API の 401 はセッション切れ扱いしない
      if (!isAuthPath(path)) {
        notifyUnauthorized();
        throw new ApiError(
          "セッションの有効期限が切れました。再度ログインしてください",
          401,
        );
      }
      throw new ApiError(await parseErrorMessage(response), 401);
    }

    if (isRetryableStatus(response.status) && attempt < MAX_RETRIES) {
      await sleep(RETRY_BASE_DELAY_MS * (attempt + 1));
      return apiFetch<T>(path, options, attempt + 1);
    }

    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function getHealth(): Promise<{ status: string }> {
  return apiFetch<{ status: string }>("/health");
}
