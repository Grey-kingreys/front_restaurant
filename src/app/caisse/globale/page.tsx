"use client";
// src/app/caisse/globale/page.tsx
// Caisse Globale — vue journalière du restaurant (read-only pour le comptable)

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getCaisseGlobaleActive, listCaissesGlobales, fermerCaisseGlobale, ouvrirCaisseGlobale } from "@/lib/api/paiements";
import type { CaisseGlobale } from "@/lib/api/paiements";
import {
    cssVar, typography, radius, spacing,
    cardBase, cardSection, btnPrimary, btnOutline,
    inputStyle, alertAmber, alertError, sectionHead, sectionHeadTitle,
} from "@/theme/theme";

// ── Helpers ────────────────────────────────────────────────────────────────

const gnf = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "—";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(n) ? "—" : n.toLocaleString("fr-FR") + " GNF";
};

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const fmtDateTime = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.35rem",
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: cssVar.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
};

// ── Ligne historique ───────────────────────────────────────────────────────

function HistoRow({ c, isActive }: { c: CaisseGlobale; isActive: boolean }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: `1px solid ${cssVar.borderSubtle}`, gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem", flex: 1, minWidth: 140 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: typography.sm, fontWeight: typography.medium, color: cssVar.textPrimary }}>
                        {fmtDate(c.date_ouverture)}
                    </span>
                    {isActive && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "0.1rem 0.45rem", borderRadius: radius.full, fontSize: typography.xs, fontWeight: typography.semibold, background: "var(--bg-section-alt)", color: "#22c55e", border: "1px solid var(--border-subtle)" }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} />
                            En cours
                        </span>
                    )}
                    {!isActive && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "0.1rem 0.45rem", borderRadius: radius.full, fontSize: typography.xs, fontWeight: typography.semibold, background: "rgba(148,163,184,.08)", color: cssVar.textMuted, border: `1px solid ${cssVar.borderSubtle}` }}>
                            Clôturée
                        </span>
                    )}
                </div>
                {c.closed_at && (
                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                        Clôturée le {fmtDateTime(c.closed_at)}
                    </span>
                )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: typography.sm, fontWeight: typography.bold, color: cssVar.textPrimary }}>{gnf(c.solde)}</p>
                {c.montant_physique_fermeture && (
                    <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted }}>
                        Physique : {gnf(c.montant_physique_fermeture)}
                    </p>
                )}
            </div>
        </div>
    );
}

// ── Modal Fermer caisse globale ────────────────────────────────────────────

function ModalFermerGlobale({
    caisse,
    onClose,
    onDone,
}: { caisse: CaisseGlobale; onClose: () => void; onDone: () => void }) {
    const [montantPhysique, setMontantPhysique] = useState("");
    const [motifEcart, setMotifEcart] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const soldeVirtuel = parseFloat(caisse.solde);
    const physique = parseFloat(montantPhysique);
    const ecart = !isNaN(physique) ? physique - soldeVirtuel : null;
    const showMotifEcart = ecart !== null && ecart !== 0;

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr("");
        if (isNaN(physique) || physique < 0) { setErr("Montant physique invalide."); return; }
        if (showMotifEcart && motifEcart.trim().length < 5) { setErr("Motif d'écart requis (min 5 caractères)."); return; }
        setLoading(true);
        try {
            const payload: { montant_physique: number; motif_ecart?: string } = { montant_physique: physique };
            if (showMotifEcart) payload.motif_ecart = motifEcart.trim();
            const res = await fermerCaisseGlobale(payload);
            if (res.success) { onDone(); }
            else setErr(res.message || "Erreur lors de la fermeture.");
        } catch {
            setErr("Erreur lors de la fermeture.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ ...cardBase, padding: "1.5rem", width: "100%", maxWidth: 460 }}>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: typography.lg, fontWeight: typography.bold, color: cssVar.textPrimary }}>Clôturer la caisse globale</h3>
                <p style={{ margin: "0 0 1rem", fontSize: typography.sm, color: cssVar.textSecondary }}>
                    Solde virtuel du jour : <strong style={{ color: cssVar.textPrimary }}>{gnf(caisse.solde)}</strong>
                </p>
                {err && <div style={{ ...alertError, marginBottom: "0.75rem" }}>{err}</div>}
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                        <label style={labelStyle}>Montant physique compté (GNF)</label>
                        <input type="number" min="0" value={montantPhysique} onChange={e => setMontantPhysique(e.target.value)} style={inputStyle} placeholder="ex. 850000" />
                    </div>
                    {ecart !== null && (
                        <div style={{ ...alertAmber, display: "flex", justifyContent: "space-between" }}>
                            <span>Écart</span>
                            <strong style={{ color: ecart === 0 ? "#22c55e" : "#f59e0b" }}>
                                {ecart >= 0 ? "+" : ""}{gnf(ecart)}
                            </strong>
                        </div>
                    )}
                    {showMotifEcart && (
                        <div>
                            <label style={labelStyle}>Motif de l&apos;écart <span style={{ color: "#ef4444" }}>*</span></label>
                            <input type="text" value={motifEcart} onChange={e => setMotifEcart(e.target.value)} style={inputStyle} placeholder="ex. Dépenses non enregistrées" />
                        </div>
                    )}
                    <div style={{ ...alertAmber, fontSize: typography.xs }}>
                        Cette clôture est irréversible. Le solde sera transféré vers la Caisse Générale.
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                        <button type="button" onClick={onClose} style={{ ...btnOutline, padding: "0.5rem 1rem" }}>Annuler</button>
                        <button type="submit" disabled={loading} style={{ ...btnPrimary, background: "linear-gradient(135deg,#ef4444,#b91c1c)", padding: "0.5rem 1.25rem", fontSize: typography.sm }}>
                            {loading ? "…" : "Clôturer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Page principale ────────────────────────────────────────────────────────

export default function CaisseGlobalePage() {
    const { user, isLoading: authLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [active, setActive] = useState<CaisseGlobale | null>(null);
    const [historique, setHistorique] = useState<CaisseGlobale[]>([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [pageErr, setPageErr] = useState("");
    const [activeErr, setActiveErr] = useState(""); // Erreur spécifique si pas de caisse active
    const [showFermerModal, setShowFermerModal] = useState(false);
    const [showOuvrirModal, setShowOuvrirModal] = useState(false);
    const [ouvrirLoading, setOuvrirLoading] = useState(false);

    const fetchAll = useCallback(async () => {
        setPageErr("");
        setActiveErr("");
        try {
            const [activeRes, histoRes] = await Promise.all([
                getCaisseGlobaleActive(),
                listCaissesGlobales(),
            ]);
            if (activeRes.success && activeRes.data) {
                setActive(activeRes.data);
            } else {
                setActive(null);
                setActiveErr(activeRes.message || "Impossible de charger la caisse active.");
            }
            if (histoRes.success && histoRes.data) setHistorique(histoRes.data.caisses);
        } catch {
            setPageErr("Erreur lors du chargement de la caisse globale.");
        } finally {
            setPageLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !hasPermission("view_caisse_globale")) {
                router.replace("/dashboard");
                return;
            }
            fetchAll();
        }
    }, [authLoading, user, router, fetchAll]);

    const canClose = hasPermission("manage_caisse_globale");

    const handleOuvrirCaisse = async () => {
        setOuvrirLoading(true);
        try {
            const res = await ouvrirCaisseGlobale();
            if (res.success) {
                setShowOuvrirModal(false);
                fetchAll();
            } else {
                alert(res.message || "Erreur lors de l'ouverture.");
            }
        } catch {
            alert("Erreur lors de l'ouverture.");
        } finally {
            setOuvrirLoading(false);
        }
    };

    if (authLoading || pageLoading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${cssVar.borderSubtle}`, borderTopColor: cssVar.amberGlow, animation: "spin 0.7s linear infinite" }} />
            </div>
        );
    }

    return (
        <div style={{ padding: `${spacing["6"]} ${spacing["6"]}`, maxWidth: 880, margin: "0 auto" }}>
            {/* En-tête */}
            <div style={{ marginBottom: spacing["5"] }}>
                <h1 style={{ margin: 0, fontSize: typography["2xl"], fontWeight: typography.bold, color: cssVar.textPrimary }}>
                    Caisse Globale
                </h1>
                <p style={{ margin: "0.25rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                    Caisse journalière du restaurant — se réinitialise chaque jour à 05h00
                </p>
            </div>

            {pageErr && <div style={{ ...alertError, marginBottom: spacing["4"] }}>{pageErr}</div>}

            {/* Caisse active du jour */}
            {active ? (
                <div style={{ ...cardBase, padding: "1.25rem 1.5rem", marginBottom: spacing["5"] }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                            <p style={{ margin: "0 0 0.25rem", fontSize: typography.xs, fontWeight: typography.bold, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                                Caisse du {fmtDate(active.date_ouverture)}
                            </p>
                            <p style={{ margin: 0, fontSize: typography["4xl"], fontWeight: typography.bold, color: cssVar.amberGlow, lineHeight: 1.1 }}>
                                {gnf(active.solde)}
                            </p>
                            <p style={{ margin: "0.35rem 0 0", fontSize: typography.xs, color: cssVar.textMuted }}>
                                Ouverte le {fmtDateTime(active.created_at)}
                            </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "0.25rem 0.65rem", borderRadius: radius.full, fontSize: typography.xs, fontWeight: typography.semibold, background: active.is_closed ? "rgba(148,163,184,.08)" : "rgba(34,197,94,.10)", color: active.is_closed ? cssVar.textMuted : "#22c55e", border: `1px solid ${active.is_closed ? cssVar.borderSubtle : "rgba(34,197,94,.25)"}` }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: active.is_closed ? cssVar.textMuted : "#22c55e" }} />
                                {active.is_closed ? "Clôturée" : "Ouverte"}
                            </span>
                            {canClose && !active.is_closed && (
                                <button onClick={() => setShowFermerModal(true)} style={{ ...btnOutline, borderColor: "rgba(239,68,68,.4)", color: "#ef4444", padding: "0.45rem 1rem" }}>
                                    Clôturer la journée
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ ...cardBase, padding: "1.5rem", marginBottom: spacing["5"], border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt }}>
                    <p style={{ margin: "0 0 1rem", fontSize: typography.sm, color: "#f59e0b", fontWeight: typography.semibold }}>
                        ⏰ {activeErr || "Aucune caisse globale ouverte pour aujourd'hui."}
                    </p>
                    {activeErr.includes("ouverte") && canClose && (
                        <button
                            onClick={() => setShowOuvrirModal(true)}
                            style={{ padding: "0.5rem 1rem", borderRadius: radius.lg, background: "#f59e0b", color: "white", border: "none", fontWeight: 600, fontSize: typography.sm, cursor: "pointer" }}
                        >
                            → Ouvrir manuellement
                        </button>
                    )}
                    {!activeErr.includes("ouverte") && (
                        <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted }}>
                            Elle s&apos;ouvrira automatiquement à 05h00 via la tâche planifiée.
                        </p>
                    )}
                </div>
            )}

            {/* Historique */}
            <div style={cardSection}>
                <div style={sectionHead}>
                    <p style={sectionHeadTitle}>Historique des caisses</p>
                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                        {historique.length} journée{historique.length !== 1 ? "s" : ""}
                    </span>
                </div>
                {historique.length === 0 ? (
                    <p style={{ margin: 0, padding: "2rem 1rem", textAlign: "center", fontSize: typography.sm, color: cssVar.textMuted }}>
                        Aucun historique disponible.
                    </p>
                ) : (
                    [...historique]
                        .sort((a, b) => new Date(b.date_ouverture).getTime() - new Date(a.date_ouverture).getTime())
                        .map(c => (
                            <HistoRow key={c.id} c={c} isActive={active?.id === c.id} />
                        ))
                )}
            </div>

            {/* Modal fermeture */}
            {showFermerModal && active && (
                <ModalFermerGlobale
                    caisse={active}
                    onClose={() => setShowFermerModal(false)}
                    onDone={() => { setShowFermerModal(false); fetchAll(); }}
                />
            )}

            {showOuvrirModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                    <div style={{ ...cardBase, padding: "1.5rem", width: "100%", maxWidth: 460 }}>
                        <h3 style={{ margin: "0 0 0.25rem", fontSize: typography.lg, fontWeight: typography.bold, color: cssVar.textPrimary }}>Ouvrir la caisse globale</h3>
                        <p style={{ margin: "0 0 1rem", fontSize: typography.sm, color: cssVar.textSecondary }}>
                            Voulez-vous ouvrir manuellement la caisse globale pour aujourd&apos;hui ?
                        </p>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowOuvrirModal(false)} style={{ padding: "0.65rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                            <button onClick={handleOuvrirCaisse} disabled={ouvrirLoading} style={{ padding: "0.65rem 1.25rem", borderRadius: radius.lg, border: "1px solid #f59e0b", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontWeight: 700, fontSize: typography.sm, cursor: ouvrirLoading ? "not-allowed" : "pointer", opacity: ouvrirLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                {ouvrirLoading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #f59e0b", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                                Ouvrir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
