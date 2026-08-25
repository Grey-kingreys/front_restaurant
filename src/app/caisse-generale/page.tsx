"use client";
// src/app/caisse-generale/page.tsx
// Caisse Générale - coffre permanent du restaurant (lecture seule, Admin/Manager)

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getCaisseGenerale, initCaisseGenerale } from "@/lib/api/paiements";
import type { CaisseGenerale } from "@/lib/api/paiements";
import {
    cssVar, typography, radius, spacing,
    cardBase, cardSection,
    sectionHead, sectionHeadTitle,
} from "@/theme/theme";
import { apiErrorMessage } from "@/lib/apiErrors";

// ── Helpers ────────────────────────────────────────────────────────────────

const gnf = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "-";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(n) ? "-" : n.toLocaleString("fr-FR") + " GNF";
};

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" });

// ── Page ───────────────────────────────────────────────────────────────────

export default function CaisseGeneralePage() {
    const { user, isLoading: authLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [caisse, setCaisse] = useState<CaisseGenerale | null>(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    // Initialisation de la caisse (Admin uniquement)
    const [soldeInitial, setSoldeInitial] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [initErr, setInitErr] = useState("");

    const fetchCaisse = useCallback(async () => {
        setErr("");
        try {
            const res = await getCaisseGenerale();
            if (res.success && res.data) setCaisse(res.data);
            else setErr(apiErrorMessage(res, "Impossible de charger la Caisse Générale."));
        } catch {
            setErr("Erreur lors du chargement.");
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInit = async () => {
        const val = parseFloat(soldeInitial);
        if (isNaN(val) || val < 0) {
            setInitErr("Saisis un solde initial valide (0 ou plus).");
            return;
        }
        setSubmitting(true);
        setInitErr("");
        try {
            const res = await initCaisseGenerale({ solde_initial: val });
            if (res.success && res.data) {
                setCaisse(res.data);
                setErr("");
            } else {
                setInitErr(apiErrorMessage(res, "Échec de l'initialisation de la caisse."));
            }
        } catch {
            setInitErr("Erreur lors de l'initialisation.");
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            if (!user || !hasPermission("view_caisse_generale")) {
                router.replace("/dashboard");
                return;
            }
            fetchCaisse();
        }
    }, [authLoading, user, router, fetchCaisse, hasPermission]);

    if (authLoading || loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${cssVar.borderSubtle}`, borderTopColor: cssVar.amberGlow, animation: "spin 0.7s linear infinite" }} />
            </div>
        );
    }

    const needsInit = err.includes("n'a pas encore ete initialisee");
    // L'init exige la permission manage_caisse_globale (backend)
    const canInit = hasPermission("manage_caisse_globale");

    return (
        <div style={{ padding: `${spacing["6"]} ${spacing["6"]}`, maxWidth: 700, margin: "0 auto" }}>
            {/* En-tête */}
            <div style={{ marginBottom: spacing["6"] }}>
                <h1 style={{ margin: 0, fontSize: typography["2xl"], fontWeight: typography.bold, color: cssVar.textPrimary }}>
                    Caisse Générale
                </h1>
                <p style={{ margin: "0.25rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                    Coffre permanent du restaurant - alimenté par les fermetures de caisses
                </p>
            </div>

            {/* Caisse non initialisée - Admin : formulaire d'initialisation */}
            {needsInit && canInit && (
                <div style={{ ...cardBase, padding: "1.5rem 2rem", marginBottom: spacing["4"] }}>
                    <p style={{ margin: 0, fontSize: "1.05rem", fontWeight: typography.bold, color: cssVar.textPrimary }}>
                        Initialiser la Caisse Générale
                    </p>
                    <p style={{ margin: "0.35rem 0 1.25rem", fontSize: typography.sm, color: cssVar.textMuted, lineHeight: 1.6 }}>
                        Saisis le montant présent dans le coffre au moment de la mise en service.
                        Ce solde de départ servira de base ; il sera ensuite alimenté automatiquement
                        par les fermetures de caisses.
                    </p>

                    <label style={{ display: "block", fontSize: typography.xs, fontWeight: typography.semibold, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.4rem" }}>
                        Solde initial (GNF)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={soldeInitial}
                        onChange={(e) => setSoldeInitial(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !submitting) handleInit(); }}
                        placeholder="Ex. 500000"
                        disabled={submitting}
                        style={{
                            width: "100%", boxSizing: "border-box", padding: "0.65rem 0.85rem",
                            borderRadius: radius.lg, border: `1px solid ${cssVar.borderSubtle}`,
                            background: "rgba(255,255,255,0.04)", color: cssVar.textPrimary,
                            fontSize: "0.95rem", outline: "none",
                        }}
                    />

                    {initErr && (
                        <p style={{ margin: "0.6rem 0 0", fontSize: typography.sm, color: "#ef4444" }}>
                            ⚠️ {initErr}
                        </p>
                    )}

                    <button
                        onClick={handleInit}
                        disabled={submitting || soldeInitial.trim() === ""}
                        style={{
                            marginTop: "1.1rem", padding: "0.6rem 1.2rem", borderRadius: radius.lg,
                            background: "#f59e0b", color: "#1a1207", border: "none", fontWeight: 700,
                            fontSize: typography.sm,
                            cursor: submitting || soldeInitial.trim() === "" ? "not-allowed" : "pointer",
                            opacity: submitting || soldeInitial.trim() === "" ? 0.6 : 1,
                        }}
                    >
                        {submitting ? "Initialisation…" : "Initialiser la Caisse"}
                    </button>
                </div>
            )}

            {/* Caisse non initialisée - Manager : pas le droit d'initialiser */}
            {needsInit && !canInit && (
                <div style={{ ...cardBase, padding: "2rem", textAlign: "center" }}>
                    <p style={{ margin: 0, color: cssVar.textMuted, fontSize: typography.sm, lineHeight: 1.6 }}>
                        La Caisse Générale n&apos;a pas encore été initialisée.<br />
                        Demande à l&apos;administrateur du restaurant de la configurer.
                    </p>
                </div>
            )}

            {/* Vraie erreur (autre que « non initialisée ») */}
            {err && !needsInit && (
                <div style={{ ...cardBase, padding: "1.5rem", marginBottom: spacing["4"], border: `1px solid rgba(239,68,68,0.2)`, background: "rgba(239,68,68,0.05)" }}>
                    <p style={{ margin: 0, fontSize: typography.sm, color: "#ef4444", fontWeight: typography.semibold }}>
                        ⚠️ {err}
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
                    <div style={{ marginTop: spacing["4"], padding: "0.75rem 1rem", borderRadius: radius.lg, background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`, fontSize: typography.xs, color: cssVar.textMuted, lineHeight: 1.6 }}>
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
