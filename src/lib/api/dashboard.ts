// src/lib/api/dashboard.ts
import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

// ── Types par rôle ─────────────────────────────────────────────────────────

export interface RevenuPoint   { date: string; revenus: number; commandes?: number }
export interface BalancePoint  { date: string; revenus: number; depenses: number }
export interface HeurePt       { h: string; n: number }
export interface StatutPt      { statut: string; total: number; label: string }
export interface CategoriePt   { categorie: string; label: string; total: number }
export interface TopPlat       { nom: string; total: number; categorie?: string }
export interface CommandeResume { id: number; table: string; montant: string; statut: string; heure: string; attente_mins?: number }
export interface CommandeCuisine extends CommandeResume { items: { plat: string; quantite: number }[] }
export interface CmdItem       { plat: string; quantite: number; prix?: string }

export interface AdminData {
    type: "admin";
    kpis: {
        revenus_jour: string; commandes_jour: number; ticket_moyen: string;
        tables_occupees: number; tables_total: number;
        commandes_en_attente: number; commandes_pretes: number;
        depenses_jour: string; benefice_net: string; solde_generale: string;
    };
    revenus_7j: RevenuPoint[];
    statuts_live: StatutPt[];
    par_categorie: CategoriePt[];
    par_heure: HeurePt[];
    top_plats: TopPlat[];
    dernieres_commandes: CommandeResume[];
}

export interface ServeurData {
    type: "serveur";
    tables_actives: CommandeResume[];
    commandes_pretes: CommandeResume[];
    nb_tables_actives: number;
    nb_commandes_pretes: number;
    remises_jour: string;
    commandes_traitees_7j: number;
    par_heure: HeurePt[];
    tables_statuts?: { table: string; statut: string }[];
    revenus_actifs?: string;
}

export interface CuisineData {
    type: "cuisine";
    file_commandes: CommandeCuisine[];
    nb_en_attente: number;
    nb_pretes: number;
    top_plats_jour: TopPlat[];
    par_categorie: CategoriePt[];
    par_heure: HeurePt[];
    total_plats_7j?: number;
    oldest_wait_mins: number;
}

export interface ComptableData {
    type: "comptable";
    caisse: { solde: string; is_open: boolean; opened_at: string | null };
    remises_en_attente: number;
    depenses_jour: string;
    revenus_jour: string;
    benefice_net: string;
    cmds_payees_jour: number;
    solde_generale: string;
    balance_7j: BalancePoint[];
    dernieres_remises: { id: number; montant: string; valide: boolean; table: string; serveur: string; date: string }[];
}

export interface TableData {
    type: "table";
    commande_active: { id: number; statut: string; montant: string; heure: string; attente_mins: number; items: CmdItem[] } | null;
    nb_plats_disponibles: number;
    suggestions: { nom: string; categorie: string; prix: string; commandes: number }[];
}

export interface SuperadminData {
    type: "superadmin";
    total_restaurants: number;
    total_users: number;
    revenus_global_jour: string;
    commandes_global_jour: number;
    revenus_7j: { date: string; revenus: number }[];
    stats_restaurants: { nom: string; revenus_jour: string; commandes_actives: number }[];
}

export type DashboardData = AdminData | ServeurData | CuisineData | ComptableData | TableData | SuperadminData;

export async function getDashboardStats(): Promise<DashboardData> {
    const res = await apiRequest<ApiResponse<DashboardData>>("/dashboard/stats/");
    if (!res.data) throw new Error("No data returned");
    return res.data;
}
