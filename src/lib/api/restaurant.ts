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
    login: string;
    nom_complet?: string;
}

export interface TableUpdatePayload {
    numero_table?: string;
    nombre_places?: number;
    nom_complet?: string;
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
    payload: TableUpdatePayload
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
 * Afficher le QR Code existant d'une table — sans régénérer le token
 */
export async function getQRCode(id: number): Promise<ApiResponse<{ qr_code_url: string; qr_login_url: string; table: string; a_qr_code: boolean }>> {
    return apiRequest(`/restaurant/tables/${id}/qr/`);
}

/**
 * Regénérer le QR Code d'une table — invalide l'ancien QR
 */
export async function regenerateQRCode(id: number): Promise<ApiResponse<{ qr_code_url: string; qr_login_url: string; table: string }>> {
    return apiRequest(`/restaurant/tables/${id}/qr/generer/`, {
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

// ── Vérification position GPS (Rtable) ────────────────────────────────────

export type CheckPositionStatus =
    | "ok"
    | "out_of_range"
    | "expired"
    | "expired_warn"
    | "all_paid"
    | "no_session";

export interface CheckPositionResult {
    status: CheckPositionStatus;
    disconnect?: boolean;
    strikes?: number;
    message?: string;
    paid_at?: string;
    expires_at?: string;
    minutes_remaining?: number;
}

/**
 * Vérification périodique de position GPS pour une session table.
 * Appelé toutes les 60s par le hook useTableGeoCheck.
 */
export async function checkPosition(
    lat?: number,
    lng?: number
): Promise<ApiResponse<CheckPositionResult>> {
    const body: Record<string, number> = {};
    if (lat !== undefined && lng !== undefined) {
        body.lat = lat;
        body.lng = lng;
    }
    return apiRequest("/restaurant/tables/check-position/", {
        method: "POST",
        body: JSON.stringify(body),
    });
}
// ── Réservations (gestion staff) ─────────────────────────────────────────────

export type StatutReservationStaff =
    | "en_attente" | "confirmee" | "refusee" | "annulee" | "terminee" | "no_show";

export interface ReservationStaff {
    id: number;
    client_id: number;
    table_numero: string | null;
    table_places: number | null;
    client_nom: string;
    client_telephone: string | null;
    client_email: string | null;
    date_reservation: string;
    heure: string;
    heure_fin: string;
    duree_minutes: number;
    nombre_personnes: number;
    note: string;
    statut: StatutReservationStaff;
    statut_label: string;
    no_show_count: number;
    client_a_risque: boolean;
    client_bloque: boolean;
    date_creation: string;
}

export async function listReservations(statut?: string): Promise<ApiResponse<{ reservations: ReservationStaff[]; count: number }>> {
    const qs = statut ? `?statut=${statut}` : "";
    return apiRequest(`/restaurant/reservations/${qs}`);
}

export async function confirmerReservation(id: number): Promise<ApiResponse<ReservationStaff>> {
    return apiRequest(`/restaurant/reservations/${id}/confirmer/`, { method: "POST" });
}

export async function refuserReservation(id: number): Promise<ApiResponse<ReservationStaff>> {
    return apiRequest(`/restaurant/reservations/${id}/refuser/`, { method: "POST" });
}

export async function reaffecterReservation(id: number, tableId: number): Promise<ApiResponse<ReservationStaff>> {
    return apiRequest(`/restaurant/reservations/${id}/reaffecter/`, {
        method: "POST", body: JSON.stringify({ table_id: tableId }),
    });
}

export async function terminerReservation(id: number): Promise<ApiResponse<ReservationStaff>> {
    return apiRequest(`/restaurant/reservations/${id}/terminer/`, { method: "POST" });
}

export async function noShowReservation(id: number): Promise<ApiResponse<ReservationStaff>> {
    return apiRequest(`/restaurant/reservations/${id}/no-show/`, { method: "POST" });
}

export async function bloquerClientReservation(id: number, raison?: string): Promise<ApiResponse<ReservationStaff>> {
    return apiRequest(`/restaurant/reservations/${id}/bloquer-client/`, {
        method: "POST", body: JSON.stringify({ raison: raison || "" }),
    });
}

export async function debloquerClientReservation(id: number): Promise<ApiResponse<ReservationStaff>> {
    return apiRequest(`/restaurant/reservations/${id}/debloquer-client/`, { method: "POST" });
}
