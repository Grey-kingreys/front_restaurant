// src/lib/api/menu.ts
// Gestion des plats du menu

import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

export type Categorie =
    | "PLAT"
    | "ENTREE"
    | "DESSERT"
    | "BOISSON"
    | "ACCOMPAGNEMENT";

export interface Plat {
    id: number;
    restaurant: number;
    nom: string;
    description: string | null;
    prix_unitaire: string;
    image: string | null;
    disponible: boolean;
    categorie: Categorie;
    necessite_validation_cuisine: boolean;
    date_creation: string;
    date_modification: string;
}

export interface PlatCreatePayload {
    nom: string;
    description?: string;
    prix_unitaire: number;
    categorie: Categorie;
    disponible: boolean;
    necessite_validation_cuisine?: boolean;
    image?: File;
}

// ── CRUD Plats ─────────────────────────────────────────────────────────────

/**
 * Lister les plats (filtrés par catégorie ou disponibilité)
 */
export async function listPlats(filters?: {
    categorie?: Categorie;
    disponible?: boolean;
}): Promise<ApiResponse<{ plats: Plat[]; count: number }>> {
    const params = new URLSearchParams();
    if (filters?.categorie) params.set("categorie", filters.categorie);
    if (filters?.disponible !== undefined)
        params.set("disponible", String(filters.disponible));
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/menu/plats/${query}`);
}

/**
 * Détail d'un plat
 */
export async function getPlat(id: number): Promise<ApiResponse<Plat>> {
    return apiRequest(`/menu/plats/${id}/`);
}

/**
 * Créer un plat (Chef Cuisinier / Admin)
 */
export async function createPlat(
    payload: PlatCreatePayload
): Promise<ApiResponse<Plat>> {
    // Si image, utiliser FormData
    if (payload.image) {
        const form = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
            if (v !== undefined) form.append(k, v as string | Blob);
        });
        return apiRequest("/menu/plats/", {
            method: "POST",
            body: form,
            headers: {}, // laisser le navigateur définir Content-Type multipart
        });
    }

    return apiRequest("/menu/plats/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Modifier un plat
 */
export async function updatePlat(
    id: number,
    payload: Partial<PlatCreatePayload>
): Promise<ApiResponse<Plat>> {
    return apiRequest(`/menu/plats/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

/**
 * Supprimer un plat (Admin uniquement)
 */
export async function deletePlat(id: number): Promise<ApiResponse> {
    return apiRequest(`/menu/plats/${id}/`, { method: "DELETE" });
}

/**
 * Activer / Désactiver un plat (Chef Cuisinier)
 */
export async function togglePlatDisponibilite(
    id: number
): Promise<ApiResponse<Plat>> {
    return apiRequest(`/menu/plats/${id}/toggle/`, { method: "POST" });
}