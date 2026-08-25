// src/lib/api/public.ts
// Fonctions API pour la vitrine publique (commandes livraison/emporter).

import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

// ── Types ──────────────────────────────────────────────────────────────────

export interface RestaurantPublic {
    id: number;
    nom: string;
    slug: string;
    adresse: string | null;
    telephone: string | null;
    latitude: string | null;
    longitude: string | null;
    accept_livraison: boolean;
    accept_emporter: boolean;
}

export interface PlatPublic {
    id: number;
    nom: string;
    description: string | null;
    prix_unitaire: string;
    categorie: string;
    image_url: string | null;
    necessite_validation_cuisine: boolean;
}

export interface PlatGlobal {
    id: number;
    nom: string;
    description: string | null;
    prix_unitaire: string;
    categorie: string;
    image_url: string | null;
    restaurant: {
        nom: string;
        slug: string;
        adresse: string | null;
        latitude: string | null;
        longitude: string | null;
    };
}

export type TypeCommande = "livraison" | "emporter";
export type ModePaiement = "livraison" | "orange_money" | "mtn" | "carte" | "paydunya";

export interface OrderItem {
    plat_id: number;
    quantite: number;
}

export interface CommandePayload {
    type_commande: TypeCommande;
    mode_paiement: ModePaiement;
    adresse_livraison?: string;
    /** Position choisie sur la carte (livraison) */
    latitude?: number;
    longitude?: number;
    telephone: string;
    items: OrderItem[];
}

export interface CommandeResult {
    commande_id: number;
    cle_suivi: string;
    statut: string;
    montant_total: string;
    type_commande: TypeCommande;
    mode_paiement: ModePaiement;
    suivi_url: string;
}

export interface SuiviCommande {
    commande_id: number;
    restaurant: string;
    statut: string;
    statut_label: string;
    statut_index: number;
    statut_total: number;
    type_commande: TypeCommande;
    mode_paiement: ModePaiement;
    montant_total: string;
    adresse_livraison: string | null;
    /** Au moins un plat passe par la cuisine → l'étape « Préparation » s'affiche */
    necessite_passage_cuisine: boolean;
    date_commande: string;
    items: { nom: string; quantite: number; prix_unitaire: string; sous_total: string }[];
}

export interface MaCommande {
    commande_id: number;
    cle_suivi: string;
    restaurant: string;
    restaurant_slug: string;
    statut: string;
    statut_label: string;
    type_commande: TypeCommande;
    mode_paiement: ModePaiement;
    montant_total: string;
    nb_items: number;
    annulable: boolean;
    motif_annulation: string | null;
    date_commande: string;
}

export interface MesCommandesData {
    commandes: MaCommande[];
    stats: { total: number; en_cours: number; total_depense: string };
}

export type StatutReservation =
    | "en_attente" | "confirmee" | "refusee" | "annulee" | "terminee" | "no_show";

export interface DisponibiliteCheck {
    disponible: boolean;
    message: string;
    duree_minutes: number;
    heure_fin: string;
    capacite_max: number;
}

export interface MaReservation {
    id: number;
    restaurant: string;
    restaurant_slug: string;
    date_reservation: string;
    heure: string;
    heure_fin: string;
    duree_minutes: number;
    nombre_personnes: number;
    note: string;
    statut: StatutReservation;
    statut_label: string;
    annulable: boolean;
    delai_annulation_heures: number;
    date_creation: string;
}

export interface ReservationPayload {
    date: string;   // AAAA-MM-JJ
    heure: string;  // HH:MM
    nombre_personnes: number;
    note?: string;
}

export interface ClientRegisterPayload {
    email: string;
    password: string;
    password_confirm: string;
    nom_complet: string;
    telephone?: string;
}

export interface ClientAuthData {
    access: string;
    refresh: string;
    user: { id: number; email: string; nom_complet: string; telephone: string | null; role: string };
}

// ── Endpoints ──────────────────────────────────────────────────────────────

export async function listRestaurantsPublics(): Promise<ApiResponse<{ restaurants: RestaurantPublic[]; count: number }>> {
    return apiRequest("/public/restaurants/", { skipAuth: true });
}

export async function getRestaurantPublic(slug: string): Promise<ApiResponse<{ restaurant: RestaurantPublic; plats: PlatPublic[]; count_plats: number }>> {
    return apiRequest(`/public/restaurants/${slug}/`, { skipAuth: true });
}

export async function listTousPlats(): Promise<ApiResponse<{ plats: PlatGlobal[]; count: number }>> {
    return apiRequest("/public/plats/", { skipAuth: true });
}

export async function commander(slug: string, payload: CommandePayload): Promise<ApiResponse<CommandeResult>> {
    return apiRequest(`/public/restaurants/${slug}/commander/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getSuiviCommande(clesuivi: string): Promise<ApiResponse<SuiviCommande>> {
    return apiRequest(`/public/commandes/${clesuivi}/`, { skipAuth: true });
}

/** URL de téléchargement du reçu PDF (endpoint public par clé de suivi). */
export function recuPdfUrl(cleSuivi: string): string {
    const base = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/+$/, "");
    return `${base}/public/commandes/${cleSuivi}/recu/`;
}

/** (Re)envoie le lien du reçu par SMS (Nimba) au numéro de la commande. */
export async function renvoyerRecuSms(cleSuivi: string): Promise<ApiResponse> {
    return apiRequest(`/public/commandes/${cleSuivi}/recu/sms/`, {
        method: "POST",
        skipAuth: true,
    });
}

export async function annulerCommandeClient(
    id: number,
    motif?: string
): Promise<ApiResponse<{ commande_id: number; statut: string; statut_label: string }>> {
    return apiRequest(`/public/mes-commandes/${id}/annuler/`, {
        method: "POST",
        body: JSON.stringify({ motif: motif ?? "" }),
    });
}

export async function getMesCommandes(): Promise<ApiResponse<MesCommandesData>> {
    return apiRequest("/public/mes-commandes/");
}

// ── Réservations (client) ────────────────────────────────────────────────────

export async function checkDisponibilite(
    slug: string,
    params: { date: string; heure: string; personnes: number }
): Promise<ApiResponse<DisponibiliteCheck>> {
    const qs = new URLSearchParams({ date: params.date, heure: params.heure, personnes: String(params.personnes) });
    return apiRequest(`/public/restaurants/${slug}/tables/?${qs.toString()}`, { skipAuth: true });
}

export async function reserver(slug: string, payload: ReservationPayload): Promise<ApiResponse<MaReservation>> {
    return apiRequest(`/public/restaurants/${slug}/reserver/`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getMesReservations(): Promise<ApiResponse<{ reservations: MaReservation[]; count: number }>> {
    return apiRequest("/public/mes-reservations/");
}

export async function annulerReservation(id: number): Promise<ApiResponse<MaReservation>> {
    return apiRequest(`/public/reservations/${id}/annuler/`, { method: "POST" });
}

// ── Contact (formulaire vitrine) ─────────────────────────────────────────────

export async function envoyerContact(
    payload: { nom: string; email: string; message: string }
): Promise<ApiResponse<null>> {
    return apiRequest("/public/contact/", {
        method: "POST",
        body: JSON.stringify(payload),
        skipAuth: true,
    });
}

export async function registerClient(payload: ClientRegisterPayload): Promise<ApiResponse<ClientAuthData>> {
    return apiRequest("/public/auth/register/", {
        method: "POST",
        body: JSON.stringify(payload),
        skipAuth: true,
    });
}

// ── Livraison externe (livreur sans compte, via token) ───────────────────────

export interface LivraisonPublique {
    commande_id: number;
    restaurant: string;
    restaurant_telephone: string | null;
    statut: string;
    statut_label: string;
    client_nom: string | null;
    client_telephone: string | null;
    adresse_livraison: string | null;
    latitude: string | null;
    longitude: string | null;
    mode_paiement: string;
    montant_total: string;
    items: { nom: string; quantite: number; sous_total: string }[];
    paiement_autorise: boolean;
    actions: {
        peut_passer_en_livraison: boolean;
        peut_etre_servie: boolean;
        peut_encaisser: boolean;
    };
}

export type LivraisonAction = "en_livraison" | "servie" | "payee";

export async function getLivraisonPublique(token: string): Promise<ApiResponse<LivraisonPublique>> {
    return apiRequest(`/public/livraison/${token}/`, { skipAuth: true });
}

export async function actionLivraisonPublique(token: string, action: LivraisonAction): Promise<ApiResponse<LivraisonPublique>> {
    return apiRequest(`/public/livraison/${token}/action/`, {
        method: "POST",
        body: JSON.stringify({ action }),
        skipAuth: true,
    });
}

// Labels et helpers paiement - icon est une clé résolue dans le composant via PAYMENT_ICONS
export const MODES_PAIEMENT: { value: ModePaiement; label: string; icon: "banknote" | "smartphone" | "credit-card" | "globe"; disponible: boolean }[] = [
    { value: "livraison",    label: "Paiement à la livraison", icon: "banknote",    disponible: true },
    { value: "orange_money", label: "Orange Money",            icon: "smartphone",  disponible: false },
    { value: "mtn",          label: "MTN Mobile Money",        icon: "smartphone",  disponible: false },
    { value: "carte",        label: "Carte bancaire",          icon: "credit-card", disponible: false },
    { value: "paydunya",     label: "PayDunya",                icon: "globe",       disponible: false },
];
