// src/lib/api/paiements.ts

import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

export interface MouvementCaisse {
    id: number;
    type_mouvement: "approvisionnement" | "depense";
    type_mouvement_display: string;
    montant: string;
    montant_formate: string;
    motif: string;
    effectue_par: number;
    effectue_par_login: string | null;
    created_at: string;
}

export interface CaisseComptable {
    id: number;
    restaurant: number;
    restaurant_nom: string;
    comptable: number;
    comptable_nom: string;
    comptable_login: string;
    solde: string;
    solde_formate: string;
    is_closed: boolean;
    statut: "ouverte" | "fermee";
    opened_at: string;
    closed_at: string | null;
    montant_physique_fermeture: string | null;
    motif_ecart: string | null;
    mouvements: MouvementCaisse[];
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

export interface CaisseGenerale {
    id: number;
    restaurant: number;
    restaurant_nom: string;
    solde: string;
    solde_formate: string;
    solde_initial: string;
    created_at: string;
    updated_at: string;
}

export interface Depense {
    id: number;
    caisse_comptable: number;
    motif: string;
    montant: string;
    montant_formate: string;
    date_depense: string;
    date_enregistrement: string;
    enregistree_par: number | null;
    enregistree_par_login: string | null;
}

export type RemiseStatut = "validee" | "en_attente_validation" | "en_attente_remise";

export interface RemiseServeur {
    id: number;
    caisse_globale: number;
    paiement: number;
    commande_id: number;
    serveur: number;
    serveur_login: string | null;
    montant_virtuel: string;
    montant_virtuel_formate: string;
    montant_physique: string | null;
    montant_physique_formate: string | null;
    motif_ecart: string | null;
    ecart_formate: string | null;
    valide: boolean;
    statut: RemiseStatut;
    validee_par: number | null;
    validee_par_login: string | null;
    created_at: string;
    updated_at: string;
}

// ── Caisse Générale ────────────────────────────────────────────────────────

export async function getCaisseGenerale(): Promise<ApiResponse<CaisseGenerale>> {
    return apiRequest("/paiements/caisse-generale/");
}

export async function initCaisseGenerale(
    payload: { solde_initial: number }
): Promise<ApiResponse<CaisseGenerale>> {
    return apiRequest("/paiements/caisse-generale/init/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// ── Caisse Comptable ───────────────────────────────────────────────────────

export async function getMaCaisseActive(): Promise<ApiResponse<CaisseComptable>> {
    return apiRequest("/paiements/caisse-comptable/active/");
}

export async function ouvrirCaisseComptable(): Promise<ApiResponse<CaisseComptable>> {
    return apiRequest("/paiements/caisse-comptable/ouvrir/", { method: "POST" });
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

export async function fermerCaisseComptable(
    pk: number,
    payload: { montant_physique: number; motif_ecart?: string }
): Promise<ApiResponse<CaisseComptable>> {
    return apiRequest(`/paiements/caisse-comptable/${pk}/fermer/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function creerDepense(
    pk: number,
    payload: { motif: string; montant: number; date_depense: string }
): Promise<ApiResponse<Depense>> {
    return apiRequest(`/paiements/caisse-comptable/${pk}/depense/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function listDepenses(
    pk: number
): Promise<ApiResponse<{ count: number; depenses: Depense[] }>> {
    return apiRequest(`/paiements/caisse-comptable/${pk}/depenses/`);
}

// ── Caisse Globale ─────────────────────────────────────────────────────────

export async function getCaisseGlobaleActive(): Promise<ApiResponse<CaisseGlobale>> {
    return apiRequest("/paiements/caisse-globale/active/");
}

export async function listCaissesGlobales(): Promise<ApiResponse<{ count: number; caisses: CaisseGlobale[] }>> {
    return apiRequest("/paiements/caisse-globale/");
}

export async function ouvrirCaisseGlobale(): Promise<ApiResponse<CaisseGlobale>> {
    return apiRequest("/paiements/caisse-globale/ouvrir/", { method: "POST" });
}

export async function fermerCaisseGlobale(payload: {
    montant_physique: number;
    motif_ecart?: string;
}): Promise<ApiResponse<CaisseGlobale>> {
    return apiRequest("/paiements/caisse-globale/active/fermer/", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

// ── Remises Serveur ────────────────────────────────────────────────────────

export async function listRemises(params?: {
    valide?: boolean;
}): Promise<ApiResponse<{ count: number; remises: RemiseServeur[] }>> {
    const qs = params?.valide !== undefined ? `?valide=${params.valide}` : "";
    return apiRequest(`/paiements/remises/${qs}`);
}

export async function validerRemise(
    pk: number,
    payload: { montant_physique: number; motif_ecart?: string }
): Promise<ApiResponse<RemiseServeur>> {
    return apiRequest(`/paiements/remises/${pk}/valider/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
