// src/lib/api/commandes.ts
// Gestion du cycle de vie des commandes

import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

export type StatutCommande =
    | "en_attente"
    | "prete"
    | "servie"
    | "payee";

export interface CommandeItem {
    id: number;
    plat: number;
    plat_nom: string;
    quantite: number;
    prix_unitaire: string;
    sous_total: string;
}

export interface Commande {
    id: number;
    restaurant: number;
    table: number;
    table_numero: string;
    session: string | null;
    montant_total: string;
    statut: StatutCommande;
    items: CommandeItem[];
    serveur_ayant_servi: number | null;
    cuisinier_ayant_prepare: number | null;
    date_paiement: string | null;
    date_commande: string;
    date_modification: string;
}

export interface PanierItem {
    id: number;
    plat: number;
    plat_nom: string;
    quantite: number;
    prix_unitaire: string;
    date_ajout: string;
}

// ── Panier (Rtable) ────────────────────────────────────────────────────────

export async function getPanier(): Promise<ApiResponse<{ items: PanierItem[] }>> {
    return apiRequest("/commandes/panier/");
}

export async function addToPanier(platId: number, quantite: number = 1): Promise<ApiResponse<PanierItem>> {
    return apiRequest("/commandes/panier/", {
        method: "POST",
        body: JSON.stringify({ plat: platId, quantite }),
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
    return apiRequest("/commandes/panier/valider/", { method: "POST" });
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
 * Marquer une commande comme PRÊTE (Cuisinier)
 */
export async function marquerPrete(id: number): Promise<ApiResponse<Commande>> {
    return apiRequest(`/commandes/${id}/prete/`, { method: "POST" });
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
    return apiRequest(`/commandes/${id}/payer/`, { method: "POST" });
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