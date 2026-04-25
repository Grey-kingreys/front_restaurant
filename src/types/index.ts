// src/types/index.ts

export type Role =
    | "Rsuper_admin"
    | "Radmin"
    | "Rmanager"
    | "Rserveur"
    | "Rchef_cuisinier"
    | "Rcuisinier"
    | "Rcomptable"
    | "Rtable";

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
}

export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface LoginResponse {
    success: boolean;
    data: {
        access: string;
        refresh: string;
        user: User;
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