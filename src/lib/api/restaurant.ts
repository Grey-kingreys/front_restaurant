// src/lib/api/restaurant.ts
// Gestion des tables physiques et QR Codes

import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

export interface Table {
    id: number;
    restaurant: number;
    numero_table: string;
    nombre_places: number;
    utilisateur: number;
    utilisateur_login: string;
    qr_code_url: string | null;
    date_creation: string;
    date_modification: string;
}

export interface TableCreatePayload {
    numero_table: string;
    nombre_places: number;
}

// ── CRUD Tables ────────────────────────────────────────────────────────────

/**
 * Lister les tables du restaurant
 */
export async function listTables(): Promise<ApiResponse<{ tables: Table[]; count: number }>> {
    return apiRequest("/restaurant/tables/");
}

/**
 * Détail d'une table
 */
export async function getTable(id: number): Promise<ApiResponse<Table>> {
    return apiRequest(`/restaurant/tables/${id}/`);
}

/**
 * Créer une table + compte Rtable associé
 */
export async function createTable(
    payload: TableCreatePayload
): Promise<ApiResponse<Table>> {
    return apiRequest("/restaurant/tables/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/**
 * Modifier une table
 */
export async function updateTable(
    id: number,
    payload: Partial<TableCreatePayload>
): Promise<ApiResponse<Table>> {
    return apiRequest(`/restaurant/tables/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

/**
 * Supprimer une table (Admin uniquement)
 */
export async function deleteTable(id: number): Promise<ApiResponse> {
    return apiRequest(`/restaurant/tables/${id}/`, {
        method: "DELETE",
    });
}

/**
 * Regénérer le QR Code d'une table
 */
export async function regenerateQRCode(id: number): Promise<ApiResponse<{ qr_code_url: string }>> {
    return apiRequest(`/restaurant/tables/${id}/qr/`, {
        method: "POST",
    });
}

/**
 * Tableau de bord des tables en temps réel (Serveur)
 * Retourne le statut des commandes en cours par table
 */
export async function getTablesDashboard(): Promise<ApiResponse<unknown>> {
    return apiRequest("/restaurant/tables/dashboard/");
}