// src/types/index.ts

export type Role =
    | "Rsuper_admin"
    | "Radmin"
    | "Rmanager"
    | "Rserveur"
    | "Rchef_cuisinier"
    | "Rcuisinier"
    | "Rcomptable"
    | "Rtable"
    | "Rclient";

export type DashboardType = "admin" | "serveur" | "cuisine" | "comptable" | "table" | "superadmin";

export interface User {
    id: number;
    login: string;
    role: Role;
    nom_complet: string | null;
    email: string | null;
    telephone: string | null;
    restaurant: number | null;
    restaurant_nom: string | null;
    actif: boolean;
    statut: "actif" | "inactif";
    must_change_password: boolean;
    date_creation: string;
    /** Codes de permissions accordées via role_config */
    permissions: string[];
    role_config_id: number | null;
    dashboard_type: DashboardType | null;
}

// ─── Types Rôles & Permissions ───────────────────────────────────────────────

export interface Permission {
    id: number;
    code: string;
    label: string;
    categorie: string;
}

export interface RoleConfig {
    id: number;
    nom: string;
    slug: string;
    is_system: boolean;
    dashboard_type: DashboardType;
    dashboard_label: string;
    permissions_count: number;
    users_count: number;
}

export interface RoleConfigDetail extends Omit<RoleConfig, "permissions_count"> {
    permissions: Permission[];
    permission_codes: string[];
}

export interface RoleCreatePayload {
    nom: string;
    slug: string;
    dashboard_type: DashboardType;
    permission_ids?: number[];
}

export interface RoleUpdatePayload {
    nom?: string;
    dashboard_type?: DashboardType;
    permission_ids?: number[];
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface LoginResponse {
    success: boolean;
    data?: {
        access: string;
        refresh: string;
        user: User;
        session_token?: string;
        expires_at?: string;
        table_login?: string;
        restaurant?: string | null;
    };
    message: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T | null;
    message: string;
    errors?: Record<string, string[]> | null;
}

export interface UserListResponse {
    count: number;
    users: User[];
}

export interface UserCreatePayload {
    role: Role;
    nom_complet?: string;
    email?: string;
    telephone?: string;
    password?: string;
}

export interface UserUpdatePayload {
    nom_complet?: string;
    email?: string;
    telephone?: string;
    role?: Role;
}