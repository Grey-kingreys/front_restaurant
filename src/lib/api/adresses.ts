// src/lib/api/adresses.ts
// Carnet d'adresses de livraison du client (Rclient)

import { apiRequest } from "./client";
import type { ApiResponse, AdresseClient, AdresseClientPayload } from "@/types";

/** Liste les adresses enregistrées du client connecté (adresse par défaut en tête). */
export async function listAdresses(): Promise<ApiResponse<AdresseClient[]>> {
    return apiRequest<ApiResponse<AdresseClient[]>>("/accounts/adresses/");
}

/** Ajoute une adresse au carnet. */
export async function createAdresse(
    payload: AdresseClientPayload
): Promise<ApiResponse<AdresseClient>> {
    return apiRequest<ApiResponse<AdresseClient>>("/accounts/adresses/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

/** Modifie une adresse existante. */
export async function updateAdresse(
    id: number,
    payload: Partial<AdresseClientPayload>
): Promise<ApiResponse<AdresseClient>> {
    return apiRequest<ApiResponse<AdresseClient>>(`/accounts/adresses/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

/** Supprime une adresse. */
export async function deleteAdresse(id: number): Promise<ApiResponse> {
    return apiRequest<ApiResponse>(`/accounts/adresses/${id}/`, {
        method: "DELETE",
    });
}

/** Définit une adresse comme adresse de livraison par défaut. */
export async function setDefaultAdresse(
    id: number
): Promise<ApiResponse<AdresseClient>> {
    return apiRequest<ApiResponse<AdresseClient>>(
        `/accounts/adresses/${id}/default/`,
        { method: "POST" }
    );
}
