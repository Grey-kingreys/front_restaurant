// src/lib/api/client.ts
// Client HTTP centralisé avec gestion automatique des tokens JWT et du refresh

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Helpers stockage tokens ────────────────────────────────────────────────

export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
}

export function getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
}

export function setTokens(access: string, refresh: string): void {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
}

export function clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
}

export function saveUser(user: unknown): void {
    localStorage.setItem("user", JSON.stringify(user));
}

export function getStoredUser<T = unknown>(): T | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return null;
    }
}

// ── Refresh automatique ────────────────────────────────────────────────────

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
    refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
    refreshSubscribers.forEach((cb) => cb(token));
    refreshSubscribers = [];
}

async function refreshAccessToken(): Promise<string | null> {
    const refresh = getRefreshToken();
    if (!refresh) return null;

    try {
        const res = await fetch(`${BASE_URL}/accounts/auth/token/refresh/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh }),
        });

        if (!res.ok) {
            clearTokens();
            return null;
        }

        const data = await res.json();
        const newAccess = data.access;
        const newRefresh = data.refresh || refresh;
        setTokens(newAccess, newRefresh);
        return newAccess;
    } catch {
        clearTokens();
        return null;
    }
}

// ── Fetch principal ────────────────────────────────────────────────────────

interface RequestOptions extends RequestInit {
    skipAuth?: boolean;
    skipRefresh?: boolean;
}

export async function apiRequest<T = unknown>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { skipAuth = false, skipRefresh = false, ...fetchOptions } = options;

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(fetchOptions.headers as Record<string, string>),
    };

    if (!skipAuth) {
        const token = getAccessToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

    let response = await fetch(url, { ...fetchOptions, headers });

    // Tentative de refresh si 401
    if (response.status === 401 && !skipAuth && !skipRefresh) {
        if (!isRefreshing) {
            isRefreshing = true;
            const newToken = await refreshAccessToken();
            isRefreshing = false;

            if (newToken) {
                onRefreshed(newToken);
                headers["Authorization"] = `Bearer ${newToken}`;
                response = await fetch(url, { ...fetchOptions, headers });
            } else {
                // Refresh échoué → déconnexion
                clearTokens();
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new CustomEvent("auth:logout"));
                }
                throw new Error("Session expirée. Veuillez vous reconnecter.");
            }
        } else {
            // Un refresh est déjà en cours → attendre
            await new Promise<void>((resolve) => {
                subscribeTokenRefresh((token) => {
                    headers["Authorization"] = `Bearer ${token}`;
                    resolve();
                });
            });
            response = await fetch(url, { ...fetchOptions, headers });
        }
    }

    // Réponse vide (204 No Content)
    if (response.status === 204) {
        return {} as T;
    }

    const data = await response.json();

    if (!response.ok) {
        throw data;
    }

    return data as T;
}