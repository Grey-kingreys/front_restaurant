"use client";
// src/app/caisse/depenses/page.tsx
// Dépenses — enregistrer et consulter les dépenses de la session

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    getMaCaisseActive,
    creerDepense,
    listDepenses,
} from "@/lib/api/paiements";
import type { CaisseComptable, Depense } from "@/lib/api/paiements";
import {
    cssVar, typography, radius, spacing,
    cardBase, cardSection, btnPrimary,
    inputStyle, alertAmber, alertError, sectionHead, sectionHeadTitle,
} from "@/theme/theme";
import { apiErrorMessage } from "@/lib/apiErrors";

// ── Helpers ────────────────────────────────────────────────────────────────

const gnf = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "—";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(n) ? "—" : n.toLocaleString("fr-FR") + " GNF";
};

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

const todayISO = () => new Date().toISOString().split("T")[0];

const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.35rem",
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: cssVar.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
};

// ── Ligne de dépense ───────────────────────────────────────────────────────

function DepenseRow({ d }: { d: Depense }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.7rem 1rem", borderBottom: `1px solid ${cssVar.borderSubtle}`, gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", flex: 1, minWidth: 140 }}>
                <span style={{ fontSize: typography.sm, fontWeight: typography.medium, color: cssVar.textPrimary }}>{d.motif}</span>
                <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                    {d.date_depense} · {d.enregistree_par_login ? `Par ${d.enregistree_par_login}` : ""} · Enregistré le {fmtDate(d.date_enregistrement)}
                </span>
            </div>
            <span style={{ fontSize: typography.sm, fontWeight: typography.bold, color: "#ef4444", flexShrink: 0 }}>
                −{gnf(d.montant)}
            </span>
        </div>
    );
}

// ── Page principale ────────────────────────────────────────────────────────

export default function DepensesPage() {
    const { user, isLoading: authLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [caisse, setCaisse] = useState<CaisseComptable | null>(null);
    const [depenses, setDepenses] = useState<Depense[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [pageErr, setPageErr] = useState("");

    // Formulaire
    const [motif, setMotif] = useState("");
    const [montant, setMontant] = useState("");
    const [dateDepense, setDateDepense] = useState(todayISO());
    const [formLoading, setFormLoading] = useState(false);
    const [formErr, setFormErr] = useState("");
    const [formOk, setFormOk] = useState(false);

    const fetchAll = useCallback(async () => {
        setPageErr("");
        try {
            const res = await getMaCaisseActive();
            if (res.success && res.data) {
                setCaisse(res.data);
                const dep = await listDepenses(res.data.id);
                if (dep.success && dep.data) setDepenses(dep.data.depenses);
            } else {
                setCaisse(null);
            }
        } catch {
            setCaisse(null);
        } finally {
            setPageLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !hasPermission("manage_caisse_comptable")) {
                router.replace("/dashboard");
                return;
            }
            fetchAll();
        }
    }, [authLoading, user, router, fetchAll]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setFormErr("");
        setFormOk(false);
        if (!caisse) return;
        if (caisse.statut !== "ouverte") { setFormErr("La caisse est fermée."); return; }
        const m = parseFloat(montant);
        if (isNaN(m) || m <= 0) { setFormErr("Montant invalide."); return; }
        if (motif.trim().length < 3) { setFormErr("Motif trop court (min 3 caractères)."); return; }
        if (!dateDepense) { setFormErr("Date requise."); return; }
        setFormLoading(true);
        try {
            const res = await creerDepense(caisse.id, { motif: motif.trim(), montant: m, date_depense: dateDepense });
            if (res.success) {
                setMotif("");
                setMontant("");
                setDateDepense(todayISO());
                setFormOk(true);
                // Recharger la liste + caisse (solde mis à jour)
                fetchAll();
            } else {
                setFormErr(apiErrorMessage(res, "Erreur lors de l'enregistrement."));
            }
        } catch {
            setFormErr("Erreur lors de l'enregistrement.");
        } finally {
            setFormLoading(false);
        }
    }

    if (authLoading || pageLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${cssVar.borderSubtle}`, borderTopColor: cssVar.amberGlow, animation: "spin 0.7s linear infinite" }} />
            </div>
        );
    }

    const totalDepenses = depenses.reduce((s, d) => s + parseFloat(d.montant), 0);

    return (
        <div style={{ padding: `${spacing["6"]} ${spacing["6"]}`, maxWidth: 880, margin: "0 auto" }}>
            {/* En-tête */}
            <div style={{ marginBottom: spacing["5"] }}>
                <h1 style={{ margin: 0, fontSize: typography["2xl"], fontWeight: typography.bold, color: cssVar.textPrimary }}>
                    Dépenses
                </h1>
                <p style={{ margin: "0.25rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                    Enregistrez les dépenses de votre session
                </p>
            </div>

            {pageErr && <div style={{ ...alertError, marginBottom: spacing["4"] }}>{pageErr}</div>}

            {/* Avertissement si pas de caisse */}
            {!caisse && (
                <div style={{ ...alertAmber, marginBottom: spacing["4"] }}>
                    Aucune caisse ouverte. Ouvrez votre caisse depuis{" "}
                    <a href="/caisse" style={{ color: "inherit", fontWeight: typography.semibold }}>Caisse du jour</a>{" "}
                    avant de saisir une dépense.
                </div>
            )}

            {/* Résumé solde + total dépenses */}
            {caisse && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: spacing["3"], marginBottom: spacing["5"] }}>
                    <div style={{ ...cardSection, padding: "0.875rem 1.25rem", flex: 1, minWidth: 150 }}>
                        <p style={{ margin: 0, fontSize: typography.xs, fontWeight: typography.bold, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Solde caisse</p>
                        <p style={{ margin: "0.35rem 0 0", fontSize: typography["2xl"], fontWeight: typography.bold, color: cssVar.amberGlow }}>{gnf(caisse.solde)}</p>
                    </div>
                    <div style={{ ...cardSection, padding: "0.875rem 1.25rem", flex: 1, minWidth: 150 }}>
                        <p style={{ margin: 0, fontSize: typography.xs, fontWeight: typography.bold, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Total dépenses</p>
                        <p style={{ margin: "0.35rem 0 0", fontSize: typography["2xl"], fontWeight: typography.bold, color: "#ef4444" }}>−{gnf(totalDepenses)}</p>
                    </div>
                    <div style={{ ...cardSection, padding: "0.875rem 1.25rem", flex: 1, minWidth: 150 }}>
                        <p style={{ margin: 0, fontSize: typography.xs, fontWeight: typography.bold, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Statut caisse</p>
                        <p style={{ margin: "0.35rem 0 0", fontSize: typography.lg, fontWeight: typography.bold, color: caisse.statut === "ouverte" ? "#22c55e" : "#ef4444" }}>
                            {caisse.statut === "ouverte" ? "Ouverte" : "Fermée"}
                        </p>
                    </div>
                </div>
            )}

            {/* Formulaire nouvelle dépense */}
            {caisse && caisse.statut === "ouverte" && (
                <div style={{ ...cardBase, padding: "1.25rem", marginBottom: spacing["5"] }}>
                    <h2 style={{ margin: "0 0 1rem", fontSize: typography.md, fontWeight: typography.bold, color: cssVar.textPrimary }}>
                        Nouvelle dépense
                    </h2>
                    {formErr && <div style={{ ...alertError, marginBottom: "0.75rem" }}>{formErr}</div>}
                    {formOk && (
                        <div style={{ padding: "0.65rem 0.875rem", borderRadius: radius.md, background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.2)", color: "#22c55e", fontSize: typography.sm, marginBottom: "0.75rem" }}>
                            Dépense enregistrée avec succès.
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                            <div style={{ flex: 2, minWidth: 200 }}>
                                <label style={labelStyle}>Motif</label>
                                <input
                                    type="text"
                                    value={motif}
                                    onChange={e => setMotif(e.target.value)}
                                    style={inputStyle}
                                    placeholder="ex. Achat de fournitures"
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 140 }}>
                                <label style={labelStyle}>Montant (GNF)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={montant}
                                    onChange={e => setMontant(e.target.value)}
                                    style={inputStyle}
                                    placeholder="ex. 15000"
                                />
                            </div>
                            <div style={{ flex: 1, minWidth: 140 }}>
                                <label style={labelStyle}>Date</label>
                                <input
                                    type="date"
                                    value={dateDepense}
                                    onChange={e => setDateDepense(e.target.value)}
                                    style={inputStyle}
                                />
                            </div>
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button type="submit" disabled={formLoading} style={{ ...btnPrimary, padding: "0.6rem 1.5rem", fontSize: typography.sm, display: "inline-flex" }}>
                                {formLoading ? "Enregistrement…" : "Enregistrer la dépense"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste des dépenses */}
            <div style={cardSection}>
                <div style={sectionHead}>
                    <p style={sectionHeadTitle}>Historique des dépenses</p>
                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                        {depenses.length} dépense{depenses.length !== 1 ? "s" : ""}
                    </span>
                </div>
                {depenses.length === 0 ? (
                    <p style={{ margin: 0, padding: "2rem 1rem", textAlign: "center", fontSize: typography.sm, color: cssVar.textMuted }}>
                        Aucune dépense enregistrée pour cette session.
                    </p>
                ) : (
                    [...depenses].reverse().map(d => <DepenseRow key={d.id} d={d} />)
                )}
            </div>
        </div>
    );
}
