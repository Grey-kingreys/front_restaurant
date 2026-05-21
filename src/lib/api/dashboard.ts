// src/lib/api/dashboard.ts
import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

export interface DashboardStats {
    // Admin / Manager
    revenu_aujourdhui?: string;
    commandes_actives?: number;
    tables_occupees?: number;
    total_staff?: number;
    
    // Chef / Cuisinier
    en_attente?: number;
    en_preparation?: number;
    plats_indisponibles?: number;
    plats_prets_aujourdhui?: number;
    
    // Table
    panier_count?: number;
    derniere_commande_statut?: string;
    derniere_commande_id?: number;
    
    // Super Admin
    total_restaurants?: number;
    total_utilisateurs?: number;
    total_revenu_global?: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
    const res = await apiRequest<ApiResponse<DashboardStats>>("/dashboard/stats/");
    if (!res.data) {
        throw new Error("No data returned");
    }
    return res.data;
}