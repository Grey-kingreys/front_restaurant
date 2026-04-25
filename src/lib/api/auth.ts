// src/lib/api/auth.ts
// Toutes les fonctions liées à l'authentification

import { apiRequest, setTokens, clearTokens, saveUser } from "./client";
import type {
    ApiResponse,
    LoginResponse,
    User,
    UserCreatePayload,
    UserListResponse,
    UserUpdatePayload,
} from "@/types";

// ── LOGIN ──────────────────────────────────────────────────────────────────

/**
 * Connexion par email (staff : Admin, Manager, Serveur, Chef, Cuisinier, Comptable)
 */
export async function loginWithEmail(
    email: string,
    password: string
): Promise<LoginResponse> {
    const data = await apiRequest<LoginResponse>("/accounts/auth/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
    });

    if (data.success && data.data) {
        setTokens(data.data.access, data.data.refresh);
        saveUser(data.data.user);
    }

    return data;
}

/**
 * Connexion par login (Rtable — via QR Code ou formulaire)
 */
export async function loginWithLogin(
    login: string,
    password: string
): Promise<LoginResponse> {
    const data = await apiRequest<LoginResponse>("/accounts/auth/login/", {
        method: "POST",
        body: JSON.stringify({ login, password }),
        skipAuth: true,
    });

    if (data.success && data.data) {
        setTokens(data.data.access, data.data.refresh);
        saveUser(data.data.user);
    }

    return data;
}

/**
 * Connexion automatique via QR Code (token dans l'URL)
 * La route backend est /api/accounts/qr/<token>/
 */
export async function loginViaQR(
    qrToken: string
): Promise<LoginResponse> {
    const data = await apiRequest<LoginResponse>(
        `/accounts/qr/${qrToken}/`,
        {
            method: "GET",
            skipAuth: true,
        }
    );

    if (data.success && data.data) {
        setTokens(data.data.access, data.data.refresh);
        saveUser(data.data.user);
    }

    return data;
}

// ── LOGOUT ─────────────────────────────────────────────────────────────────

/**
 * Déconnexion — blackliste le refresh token côté serveur
 */
export async function logout(refreshToken: string): Promise<ApiResponse> {
    try {
        const data = await apiRequest<ApiResponse>("/accounts/auth/logout/", {
            method: "POST",
            body: JSON.stringify({ refresh: refreshToken }),
        });
        return data;
    } finally {
        clearTokens();
    }
}

// ── PROFIL ─────────────────────────────────────────────────────────────────

/**
 * Récupère le profil de l'utilisateur connecté
 */
export async function getMe(): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>("/accounts/auth/me/");
}

// ── CHANGEMENT MOT DE PASSE ────────────────────────────────────────────────

/**
 * L'utilisateur change son propre mot de passe (y compris first-login)
 */
export async function changePassword(payload: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
}): Promise<ApiResponse> {
    return apiRequest<ApiResponse>("/accounts/auth/change-password/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// ── RESET MOT DE PASSE (self-service) ─────────────────────────────────────

/**
 * Demande de réinitialisation par email
 * La réponse est toujours 200 (anti-énumération)
 */
export async function requestPasswordReset(email: string): Promise<ApiResponse> {
    return apiRequest<ApiResponse>("/accounts/auth/password/reset-request/", {
        method: "POST",
        body: JSON.stringify({ email }),
        skipAuth: true,
    });
}

/**
 * Confirme la réinitialisation avec le token reçu par email
 */
export async function confirmPasswordReset(payload: {
    token: string;
    password: string;
    password_confirm: string;
}): Promise<ApiResponse<{ login: string }>> {
    return apiRequest<ApiResponse<{ login: string }>>(
        "/accounts/auth/password/reset-confirm/",
        {
            method: "POST",
            body: JSON.stringify(payload),
            skipAuth: true,
        }
    );
}

// ── GESTION UTILISATEURS (Admin / Manager) ─────────────────────────────────

/**
 * Lister les utilisateurs du restaurant
 * Filtres optionnels : role, actif
 */
export async function listUsers(filters?: {
    role?: string;
    actif?: boolean;
}): Promise<ApiResponse<UserListResponse>> {
    const params = new URLSearchParams();
    if (filters?.role) params.set("role", filters.role);
    if (filters?.actif !== undefined)
        params.set("actif", String(filters.actif));

    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest<ApiResponse<UserListResponse>>(
        `/accounts/auth/users/${query}`
    );
}

/**
 * Détail d'un utilisateur
 */
export async function getUser(id: number): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>(`/accounts/auth/users/${id}/`);
}

/**
 * Créer un utilisateur dans le restaurant connecté
 */
export async function createUser(
    payload: UserCreatePayload
): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>("/accounts/auth/users/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Modifier un utilisateur (PATCH)
 */
export async function updateUser(
    id: number,
    payload: UserUpdatePayload
): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>(`/accounts/auth/users/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

/**
 * Supprimer un utilisateur (Admin uniquement)
 */
export async function deleteUser(id: number): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(`/accounts/auth/users/${id}/`, {
        method: "DELETE",
    });
}

/**
 * Activer / Désactiver un utilisateur
 */
export async function toggleUser(id: number): Promise<ApiResponse<User>> {
    return apiRequest<ApiResponse<User>>(
        `/accounts/auth/users/${id}/toggle/`,
        { method: "POST" }
    );
}

/**
 * Réinitialiser le mot de passe d'un utilisateur (Admin/Manager)
 */
export async function adminResetUserPassword(
    id: number,
    new_password: string
): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(
        `/accounts/auth/users/${id}/reset-password/`,
        {
            method: "POST",
            body: JSON.stringify({ new_password }),
        }
    );
}