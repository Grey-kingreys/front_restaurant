// src/lib/api/company.ts
// Gestion des restaurants — réservé au Super Admin

import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

export interface Restaurant {
    id: number;
    nom: string;
    email_admin: string;
    telephone: string | null;
    adresse: string | null;
    latitude: string | null;
    longitude: string | null;
    rayon_connexion: number;
    duree_session_table: number;
    accept_livraison: boolean;
    accept_emporter: boolean;
    frais_livraison: string | null;
    reservation_validation_auto: boolean;
    reservation_delai_annulation_heures: number;
    has_geo: boolean;
    is_active: boolean;
    statut: string;
    nombre_utilisateurs: number;
    created_at: string;
    updated_at: string;
}

export interface RestaurantCreatePayload {
    nom: string;
    email_admin: string;
    telephone?: string;
    adresse?: string;
    solde_initial?: number;
}

export interface RestaurantParStats {
    restaurant_id: number;
    restaurant_nom: string;
    is_active: boolean;
    nombre_utilisateurs: number;
    nombre_tables: number;
}

export interface PlatformStats {
    restaurants_total: number;
    restaurants_actifs: number;
    restaurants_suspendus: number;
    utilisateurs_par_restaurant: RestaurantParStats[];
}

/** @deprecated Use PlatformStats */
export type RestaurantStats = PlatformStats;

// ── CRUD Restaurants ───────────────────────────────────────────────────────

/**
 * Lister tous les restaurants (Super Admin)
 */
export async function listRestaurants(): Promise<ApiResponse<{ restaurants: Restaurant[]; count: number }>> {
    return apiRequest("/company/restaurants/");
}

/**
 * Détail d'un restaurant
 */
export async function getRestaurant(id: number): Promise<ApiResponse<Restaurant>> {
    return apiRequest(`/company/restaurants/${id}/`);
}

/**
 * Créer un restaurant + compte Admin (Super Admin)
 */
export async function createRestaurant(
    payload: RestaurantCreatePayload
): Promise<ApiResponse<Restaurant>> {
    return apiRequest("/company/restaurants/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Modifier un restaurant
 */
export async function updateRestaurant(
    id: number,
    payload: Partial<RestaurantCreatePayload>
): Promise<ApiResponse<Restaurant>> {
    return apiRequest(`/company/restaurants/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

/**
 * Suspendre un restaurant actif (Super Admin)
 */
export async function suspendRestaurant(id: number): Promise<ApiResponse<Restaurant>> {
    return apiRequest(`/company/restaurants/${id}/suspend/`, { method: "POST" });
}

/**
 * Réactiver un restaurant suspendu (Super Admin)
 */
export async function activateRestaurant(id: number): Promise<ApiResponse<Restaurant>> {
    return apiRequest(`/company/restaurants/${id}/activate/`, { method: "POST" });
}

/**
 * Suspendre ou réactiver selon l'état courant (Super Admin)
 */
export async function toggleRestaurant(id: number, isActive: boolean): Promise<ApiResponse<Restaurant>> {
    return isActive ? suspendRestaurant(id) : activateRestaurant(id);
}

/**
 * Supprimer définitivement un restaurant (Super Admin)
 * Requiert confirmation : nom exact + mot de passe
 */
export async function deleteRestaurant(
    id: number,
    nomConfirmation: string,
    password: string
): Promise<ApiResponse<void>> {
    return apiRequest(`/company/restaurants/${id}/`, {
        method: "DELETE",
        body: JSON.stringify({
            nom_confirmation: nomConfirmation,
            password: password,
        }),
    });
}

/**
 * Statistiques globales de la plateforme (Super Admin)
 */
export async function getPlatformStats(): Promise<ApiResponse<PlatformStats>> {
    return apiRequest("/company/stats/");
}

/**
 * Mon restaurant — infos (Admin uniquement)
 */
export async function getMonRestaurant(): Promise<ApiResponse<Restaurant>> {
    return apiRequest("/company/mon-restaurant/");
}

/**
 * Modifier son restaurant (Admin uniquement)
 */
export async function updateMonRestaurant(
    payload: {
        nom?: string;
        telephone?: string;
        adresse?: string;
        latitude?: number | null;
        longitude?: number | null;
        rayon_connexion?: number;
        duree_session_table?: number;
        accept_livraison?: boolean;
        accept_emporter?: boolean;
        frais_livraison?: number | null;
        reservation_validation_auto?: boolean;
        reservation_delai_annulation_heures?: number;
    }
): Promise<ApiResponse<Restaurant>> {
    return apiRequest("/company/mon-restaurant/", {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

// ── Onboarding première connexion Admin ────────────────────────────────────

export interface OnboardingInfo {
    login: string;
    restaurant: string;
    expires_at: string;
}

/**
 * Vérifier la validité d'un token d'onboarding (sans le consommer)
 */
export async function verifyOnboardingToken(token: string): Promise<ApiResponse<OnboardingInfo>> {
    return apiRequest(`/company/onboarding/${token}/`, { method: "GET" });
}

/**
 * Définir le mot de passe et activer le compte Admin (consomme le token)
 */
export async function activateOnboarding(
    token: string,
    payload: { password: string; password_confirm: string }
): Promise<ApiResponse<{ login: string; restaurant: string }>> {
    return apiRequest(`/company/onboarding/${token}/`, {
        method: "POST",
        body: JSON.stringify({ token, ...payload }),
    });
}