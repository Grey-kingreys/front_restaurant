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
    is_active: boolean;
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

export interface RestaurantStats {
    total_restaurants: number;
    actifs: number;
    suspendus: number;
}

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
 * Activer / Suspendre un restaurant (Super Admin)
 */
export async function toggleRestaurant(id: number): Promise<ApiResponse<Restaurant>> {
    return apiRequest(`/company/restaurants/${id}/toggle/`, {
        method: "POST",
    });
}

/**
 * Statistiques globales de la plateforme (Super Admin)
 */
export async function getPlatformStats(): Promise<ApiResponse<RestaurantStats>> {
    return apiRequest("/company/stats/");
}