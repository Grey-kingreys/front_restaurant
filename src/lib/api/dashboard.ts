// src/lib/api/dashboard.ts
// Analytics, exports et rapports (Admin / Manager)

import { apiRequest } from "./client";
import type { ApiResponse } from "@/types";

export interface DashboardStats {
    commandes_du_jour: number;
    revenus_du_jour: string;
    depenses_du_jour: string;
    benefice_net: string;
    tables_occupees: number;
    commandes_en_attente: number;
    commandes_pretes: number;
}

export interface RapportJournalier {
    date: string;
    commandes: number;
    revenus: string;
    depenses: string;
    benefice_net: string;
}

// ── Stats du jour ──────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return apiRequest("/dashboard/stats/");
}

// ── Rapport journalier ─────────────────────────────────────────────────────

export async function getRapportJournalier(
    date?: string
): Promise<ApiResponse<RapportJournalier>> {
    const query = date ? `?date=${date}` : "";
    return apiRequest(`/dashboard/rapport-journalier/${query}`);
}

/**
 * Exporter le rapport en PDF ou Excel
 */
export async function exportRapport(
    format: "pdf" | "excel",
    date?: string
): Promise<Blob> {
    const token = (await import("./client")).getAccessToken();
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    const query = date ? `?date=${date}&format=${format}` : `?format=${format}`;
    const res = await fetch(`${BASE_URL}/dashboard/export/${query}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Erreur export rapport");
    return res.blob();
}

/**
 * Envoyer le rapport par email manuellement
 */
export async function envoyerRapportEmail(date?: string): Promise<ApiResponse> {
    return apiRequest("/dashboard/envoyer-rapport/", {
        method: "POST",
        body: JSON.stringify({ date }),
    });
}