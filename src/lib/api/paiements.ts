// src/lib/api/paiements.ts
// Gestion des caisses (Générale, Globale, Comptable) et des remises serveurs

import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

export interface CaisseGenerale {
    id: number;
    restaurant: number;
    solde: string;
    solde_initial: string;
    created_at: string;
    updated_at: string;
}

export interface CaisseGlobale {
    id: number;
    restaurant: number;
    date_ouverture: string;
    solde: string;
    is_closed: boolean;
    closed_at: string | null;
    fermee_par: number | null;
    motif_ecart: string | null;
    montant_physique_fermeture: string | null;
    created_at: string;
}

export interface CaisseComptable {
    id: number;
    restaurant: number;
    comptable: number;
    solde: string;
    is_closed: boolean;
    opened_at: string;
    closed_at: string | null;
    motif_ecart: string | null;
    montant_physique_fermeture: string | null;
}

export interface MouvementCaisse {
    id: number;
    caisse_comptable: number;
    type_mouvement: "approvisionnement" | "depense";
    montant: string;
    motif: string;
    effectue_par: number;
    created_at: string;
}

export interface RemiseServeur {
    id: number;
    caisse_globale: number;
    paiement: number;
    montant_virtuel: string;
    montant_physique: string | null;
    motif_ecart: string | null;
    valide: boolean;
    validee_par: number | null;
    serveur: number;
    created_at: string;
}

// ── Caisse Générale ────────────────────────────────────────────────────────

export async function getCaisseGenerale(): Promise<ApiResponse<CaisseGenerale>> {
    return apiRequest("/paiements/caisse-generale/");
}

// ── Caisse Globale ─────────────────────────────────────────────────────────

export async function getCaisseGlobaleActive(): Promise<ApiResponse<CaisseGlobale>> {
    return apiRequest("/paiements/caisse-globale/active/");
}

export async function fermerCaisseGlobale(payload: {
    montant_physique: number;
    motif_ecart?: string;
}): Promise<ApiResponse<CaisseGlobale>> {
    return apiRequest("/paiements/caisse-globale/fermer/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// ── Remises Serveur ────────────────────────────────────────────────────────

export async function listRemises(): Promise<ApiResponse<{ remises: RemiseServeur[] }>> {
    return apiRequest("/paiements/remises/");
}

export async function validerRemise(
    id: number,
    payload: { montant_physique: number; motif_ecart?: string }
): Promise<ApiResponse<RemiseServeur>> {
    return apiRequest(`/paiements/remises/${id}/valider/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// ── Caisse Comptable ───────────────────────────────────────────────────────

export async function getMaCaisseComptable(): Promise<ApiResponse<CaisseComptable>> {
    return apiRequest("/paiements/caisse-comptable/active/");
}

export async function ouvrirCaisseComptable(): Promise<ApiResponse<CaisseComptable>> {
    return apiRequest("/paiements/caisse-comptable/ouvrir/", { method: "POST" });
}

export async function fermerCaisseComptable(
    pk: number,
    payload: { montant_physique: number; motif_ecart?: string }
): Promise<ApiResponse<CaisseComptable>> {
    return apiRequest(`/paiements/caisse-comptable/${pk}/fermer/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function approvisionnerCaisse(
    pk: number,
    payload: { montant: number; motif: string }
): Promise<ApiResponse<CaisseComptable>> {
    return apiRequest(`/paiements/caisse-comptable/${pk}/approvisionner/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function enregistrerDepense(
    pk: number,
    payload: { montant: number; motif: string }
): Promise<ApiResponse<{ id: number; montant: string; motif: string; created_at: string }>> {
    return apiRequest(`/paiements/caisse-comptable/${pk}/depense/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getMouvementsCaisse(pk: number): Promise<ApiResponse<{ depenses: MouvementCaisse[] }>> {
    return apiRequest(`/paiements/caisse-comptable/${pk}/depenses/`);
}