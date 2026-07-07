"use client";
// src/app/caisse-generale/page.tsx
// Caisse Générale — coffre permanent du restaurant (lecture seule, Admin/Manager)

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getCaisseGenerale } from "@/lib/api/paiements";
import type { CaisseGenerale } from "@/lib/api/paiements";
import {
    cssVar, typography, radius, spacing,
    cardBase, cardSection, alertError,
    sectionHead, sectionHeadTitle,
} from "@/theme/theme";

// ── Helpers ────────────────────────────────────────────────────────────────

const gnf = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "—";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(n) ? "—" : n.toLocaleString("fr-FR") + " GNF";
};

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

// ── Page ───────────────────────────────────────────────────────────────────

const ALLOWED_ROLES = ["Radmin", "Rmanager"];

export default function CaisseGeneralePage() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [caisse, setCaisse] = useState<CaisseGenerale | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const fetchCaisse = useCallback(async () => {
        setErr("");
        try {
            const res = await getCaisseGenerale();
            if (res.success && res.data) setCaisse(res.data);
            else setErr(res.message || "Impossible de charger la Caisse Générale.");
        } catch {
            setErr("Erreur lors du chargement.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !ALLOWED_ROLES.includes(user.role)) {
                router.replace("/dashboard");
                return;
            }
            fetchCaisse();
        }
    }, [authLoading, user, router, fetchCaisse]);

    if (authLoading || loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${cssVar.borderSubtle}`, borderTopColor: cssVar.amberGlow, animation: "spin 0.7s linear infinite" }} />
            </div>
        );
    }

    return (
        <div style={{ padding: `${spacing["6"]} ${spacing["6"]}`, maxWidth: 700, margin: "0 auto" }}>
            {/* En-tête */}
            <div style={{ marginBottom: spacing["6"] }}>
                <h1 style={{ margin: 0, fontSize: typography["2xl"], fontWeight: typography.bold, color: cssVar.textPrimary }}>
                    Caisse Générale
                </h1>
                <p style={{ margin: "0.25rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                    Coffre permanent du restaurant — alimenté par les fermetures de caisses
                </p>
            </div>

            {err && (
                <div style={{ ...cardBase, padding: "1.5rem", marginBottom: spacing["4"], border: `1px solid rgba(239,68,68,0.2)`, background: "rgba(239,68,68,0.05)" }}>
                    <p style={{ margin: "0 0 1rem", fontSize: typography.sm, color: "#ef4444", fontWeight: typography.semibold }}>
                        ⚠️ {err}
                    </p>
                    {err.includes("n'a pas encore ete initialisee") && (
                        <button
                            onClick={() => {
                                setLoading(true);
                                window.location.href = "#init";
                            }}
                            style={{ padding: "0.5rem 1rem", borderRadius: radius.lg, background: "#f59e0b", color: "white", border: "none", fontWeight: 600, fontSize: typography.sm, cursor: "pointer" }}
                        >
                            → Initialiser la Caisse
                        </button>
                    )}
                </div>
            )}

            {!caisse && !err && (
                <div style={{ ...cardBase, padding: "2rem", textAlign: "center" }}>
                    <p style={{ margin: 0, color: cssVar.textMuted, fontSize: typography.sm }}>
                        La Caisse Générale n&apos;a pas encore été initialisée.
                    </p>
                </div>
            )}

            {caisse && (
                <>
                    {/* Solde principal */}
                    <div style={{ ...cardBase, padding: "1.5rem 2rem", marginBottom: spacing["4"] }}>
                        <p style={{ margin: "0 0 0.25rem", fontSize: typography.xs, fontWeight: typography.bold, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                            Solde actuel
                        </p>
                        <p style={{ margin: 0, fontSize: "2.5rem", fontWeight: typography.bold, color: cssVar.amberGlow, lineHeight: 1.1 }}>
                            {gnf(caisse.solde)}
                        </p>
                        <p style={{ margin: "0.5rem 0 0", fontSize: typography.xs, color: cssVar.textMuted }}>
                            Depuis le {fmtDateTime(caisse.created_at)}
                        </p>
                    </div>

                    {/* Détails */}
                    <div style={cardSection}>
                        <div style={sectionHead}>
                            <p style={sectionHeadTitle}>Détails</p>
                        </div>
                        <div style={{ padding: "0.75rem 1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <Row label="Restaurant" value={caisse.restaurant_nom ?? `#${caisse.restaurant}`} />
                            <Row label="Solde initial" value={gnf(caisse.solde_initial)} />
                            <Row label="Solde actuel" value={gnf(caisse.solde)} highlight />
                            <Row
                                label="Variation"
                                value={(() => {
                                    const delta = parseFloat(caisse.solde) - parseFloat(caisse.solde_initial);
                                    return (delta >= 0 ? "+" : "") + gnf(delta);
                                })()}
                                color={parseFloat(caisse.solde) >= parseFloat(caisse.solde_initial) ? "#22c55e" : "#ef4444"}
                            />
                            <Row label="Dernière mise à jour" value={fmtDateTime(caisse.updated_at)} />
                        </div>
                    </div>

                    {/* Note explicative */}
                    <div style={{ marginTop: spacing["4"], padding: "0.75rem 1rem", borderRadius: radius.lg, background: "rgba(245,158,11,.06)", border: "1px solid rgba(245,158,11,.15)", fontSize: typography.xs, color: cssVar.textMuted, lineHeight: 1.6 }}>
                        Le solde est alimenté automatiquement à chaque fermeture de Caisse Globale et de Caisse Comptable. Il ne peut pas être modifié manuellement depuis cette interface.
                    </div>
                </>
            )}
        </div>
    );
}

function Row({ label, value, highlight, color }: { label: string; value: string; highlight?: boolean; color?: string }) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0", borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
            <span style={{ fontSize: typography.sm, color: cssVar.textSecondary }}>{label}</span>
            <span style={{ fontSize: typography.sm, fontWeight: highlight ? typography.bold : typography.medium, color: color ?? (highlight ? cssVar.textPrimary : cssVar.textSecondary) }}>
                {value}
            </span>
        </div>
    );
}
