// src/lib/api/commandes.ts
// Gestion du cycle de vie des commandes

import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

export type StatutCommande =
    | "en_attente"
    | "prete"
    | "en_livraison"
    | "servie"
    | "payee";

export interface CommandeItem {
    id: number;
    plat: number;
    plat_nom: string;
    plat_categorie?: string;
    necessite_validation_cuisine?: boolean;
    quantite: number;
    prix_unitaire: string;
    sous_total: string;
}

export interface Commande {
    id: number;
    restaurant: number;
    table: number;
    table_login?: string;
    table_numero?: string;
    session: string | null;
    // Type de commande : sur place (table) ou en ligne (client)
    type_commande?: "sur_table" | "livraison" | "emporter";
    type_commande_display?: string;
    client_display?: string;
    client_nom?: string | null;
    client_telephone?: string | null;
    client_adresse_livraison?: string | null;
    client_latitude?: string | null;
    client_longitude?: string | null;
    mode_paiement?: string;
    mode_paiement_display?: string;
    montant_total: string;
    statut: StatutCommande;
    statut_display?: string;
    nb_items?: number;
    items: CommandeItem[];
    serveur_ayant_servi: number | null;
    serveur_login?: string | null;
    cuisinier_ayant_prepare: number | null;
    cuisinier_login?: string | null;
    peut_etre_marquee_prete?: boolean;
    peut_passer_en_livraison?: boolean;
    peut_etre_servie?: boolean;
    peut_etre_payee?: boolean;
    necessite_passage_cuisine?: boolean;
    date_paiement: string | null;
    date_commande: string;
    date_modification: string;
}

export interface PanierItem {
    id: number;
    plat: number;
    plat_detail: {
        id: number;
        nom: string;
        prix_unitaire: string;
        image: string | null;
    };
    quantite: number;
    sous_total: string;
    date_ajout: string;
}


// ── Panier (Rtable) ────────────────────────────────────────────────────────

export async function getPanier(): Promise<ApiResponse<{ items: PanierItem[] }>> {
    return apiRequest("/commandes/panier/");
}

export async function addToPanier(platId: number, quantite: number = 1): Promise<ApiResponse<PanierItem>> {
    return apiRequest("/commandes/panier/", {
        method: "POST",
        body: JSON.stringify({ plat_id: platId, quantite }),
    });
}

export async function updatePanierItem(id: number, quantite: number): Promise<ApiResponse<PanierItem>> {
    return apiRequest(`/commandes/panier/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ quantite }),
    });
}

export async function removePanierItem(id: number): Promise<ApiResponse> {
    return apiRequest(`/commandes/panier/${id}/`, { method: "DELETE" });
}

/**
 * Valider le panier → crée une commande EN_ATTENTE liée au token de session
 */
export async function validerPanier(): Promise<ApiResponse<Commande>> {
    return apiRequest("/commandes/valider/", { method: "POST" });
}

// ── Commandes ──────────────────────────────────────────────────────────────

/**
 * Lister les commandes (filtres par statut, table...)
 */
export async function listCommandes(filters?: {
    statut?: StatutCommande;
    table?: number;
}): Promise<ApiResponse<{ commandes: Commande[]; count: number }>> {
    const params = new URLSearchParams();
    if (filters?.statut) params.set("statut", filters.statut);
    if (filters?.table) params.set("table", String(filters.table));
    const query = params.toString() ? `?${params.toString()}` : "";
    return apiRequest(`/commandes/${query}`);
}

/**
 * Détail d'une commande
 */
export async function getCommande(id: number): Promise<ApiResponse<Commande>> {
    return apiRequest(`/commandes/${id}/`);
}

/**
 * Mes commandes — Table uniquement (filtrées par session QR courante)
 */
export async function getMesCommandes(): Promise<ApiResponse<{ commandes: Commande[]; count: number }>> {
    return apiRequest("/commandes/mes-commandes/");
}

/**
 * File des commandes cuisine — Cuisinier / Chef Cuisinier
 */
export async function listCommandesCuisine(statut: "en_attente" | "prete" = "en_attente"): Promise<ApiResponse<{ commandes: Commande[]; count: number }>> {
    return apiRequest(`/commandes/cuisine/?statut=${statut}`);
}

/**
 * Marquer une commande comme PRÊTE (Cuisinier)
 */
export async function marquerPrete(id: number): Promise<ApiResponse<Commande>> {
    return apiRequest(`/commandes/${id}/prete/`, { method: "POST" });
}

/**
 * Marquer une commande livraison comme EN LIVRAISON (Serveur/Admin/Manager)
 */
export async function marquerEnLivraison(id: number): Promise<ApiResponse<Commande>> {
    return apiRequest(`/commandes/${id}/en-livraison/`, { method: "POST" });
}

/**
 * Marquer une commande comme SERVIE (Serveur)
 */
export async function marquerServie(id: number): Promise<ApiResponse<Commande>> {
    return apiRequest(`/commandes/${id}/servie/`, { method: "POST" });
}

/**
 * Valider le paiement (Serveur) → statut PAYÉE
 */
export async function validerPaiement(id: number): Promise<ApiResponse<Commande>> {
    return apiRequest(`/commandes/${id}/payee/`, { method: "POST" });
}

/**
 * Télécharger le reçu PDF d'une commande
 */
export async function downloadRecu(id: number): Promise<Blob> {
    const token = (await import("./client")).getAccessToken();
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const res = await fetch(`${BASE_URL}/commandes/${id}/recu/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Erreur téléchargement reçu");
    return res.blob();
}

/**
 * Supprimer une commande (Admin uniquement)
 */
export async function deleteCommande(id: number): Promise<ApiResponse> {
    return apiRequest(`/commandes/${id}/`, { method: "DELETE" });
}