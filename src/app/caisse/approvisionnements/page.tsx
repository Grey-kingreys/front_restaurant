"use client";
// src/app/caisse/approvisionnements/page.tsx
// Validation des demandes d'approvisionnement — Admin / Manager (validate_approvisionnement).

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    listDemandesAppro,
    approuverDemandeAppro,
    refuserDemandeAppro,
    type DemandeApprovisionnement,
    type StatutDemandeAppro,
} from "@/lib/api/paiements";
import { cssVar, typography, radius, modalCard } from "@/theme/theme";
import { Wallet, Check, X, RefreshCw, Clock } from "lucide-react";
import { apiErrorMessage } from "@/lib/apiErrors";

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-subtle)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

const STATUT: Record<string, { color: string; label: string }> = {
    en_attente: { color: "#f59e0b", label: "En attente" },
    approuvee:  { color: "#22c55e", label: "Approuvée" },
    refusee:    { color: "#ef4444", label: "Refusée" },
};

export default function ApprovisionnementsPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [demandes, setDemandes] = useState<DemandeApprovisionnement[]>([]);
    const [loading, setLoading]   = useState(true);
    const [filter, setFilter]     = useState<StatutDemandeAppro | "">("en_attente");
    const [actionId, setActionId] = useState<number | null>(null);
    const [refusId, setRefusId]   = useState<number | null>(null);
    const [motifRefus, setMotifRefus] = useState("");
    const [toast, setToast]       = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchDemandes = useCallback(async () => {
        setLoading(true);
        const res = await listDemandesAppro(filter || undefined);
        if (res.success && res.data) setDemandes(res.data.demandes);
        setLoading(false);
    }, [filter]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("validate_approvisionnement")) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, hasPermission, router]);

    useEffect(() => {
        if (isAuthenticated && user && hasPermission("validate_approvisionnement")) fetchDemandes();
    }, [isAuthenticated, user, hasPermission, fetchDemandes]);

    const fmt = (iso: string) => new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    const fmtMontant = (v: string) => `${Number(v).toLocaleString("fr-FR")} GNF`;

    const approuver = async (id: number) => {
        setActionId(id);
        try {
            const res = await approuverDemandeAppro(id);
            if (res.success) { showToast("Approvisionnement approuvé et transféré."); await fetchDemandes(); }
            else showToast(apiErrorMessage(res, "Impossible d'approuver."), "error");
        } catch { showToast("Erreur réseau.", "error"); }
        setActionId(null);
    };

    const refuser = async () => {
        if (refusId == null) return;
        setActionId(refusId);
        try {
            const res = await refuserDemandeAppro(refusId, motifRefus);
            if (res.success) { showToast("Demande refusée."); setRefusId(null); setMotifRefus(""); await fetchDemandes(); }
            else showToast(apiErrorMessage(res, "Impossible de refuser."), "error");
        } catch { showToast("Erreur réseau.", "error"); }
        setActionId(null);
    };

    if (isLoading || !user) return <PageLoader />;
    if (!hasPermission("validate_approvisionnement")) return null;

    const enAttente = demandes.filter(d => d.statut === "en_attente").length;

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                .dem-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:1rem; padding:1rem 1.25rem; animation:fadeIn 0.2s ease; }
                .dem-tab { padding:0.45rem 0.9rem; border-radius:9999px; border:1px solid var(--border-subtle); background:transparent; cursor:pointer; font-size:0.82rem; font-weight:600; color:var(--text-muted); }
                .dem-tab.active { background:var(--gradient-btn); color:#0c0a09; border-color:transparent; }
                .dem-btn { display:flex; align-items:center; gap:0.35rem; padding:0.5rem 0.9rem; border-radius:0.6rem; font-size:0.8rem; font-weight:700; cursor:pointer; }
                .dem-btn:disabled { opacity:0.55; cursor:not-allowed; }
            `}</style>

            {toast && (
                <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200, padding: "0.75rem 1.25rem", borderRadius: radius.xl, background: toast.type === "success" ? "rgba(34,197,94,0.96)" : "rgba(239,68,68,0.96)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="rp-page-pad" style={{ minHeight: "100vh", background: "var(--bg-dark)" }}>
                <div style={{ maxWidth: 820, margin: "0 auto" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.3rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-xl)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                                    <Wallet size={20} />
                                </div>
                                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary }}>Approvisionnements</h1>
                            </div>
                            <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                                Valider les demandes des comptables{enAttente > 0 && ` — ${enAttente} en attente`}
                            </p>
                        </div>
                        <button onClick={fetchDemandes} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.6rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            <RefreshCw size={13} /> Actualiser
                        </button>
                    </div>

                    {/* Filtres */}
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                        {([["en_attente", "En attente"], ["approuvee", "Approuvées"], ["refusee", "Refusées"], ["", "Toutes"]] as [StatutDemandeAppro | "", string][]).map(([v, label]) => (
                            <button key={v} className={`dem-tab${filter === v ? " active" : ""}`} onClick={() => setFilter(v)}>{label}</button>
                        ))}
                    </div>

                    {/* Liste */}
                    {loading ? (
                        <div style={{ padding: "3rem", display: "flex", justifyContent: "center" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-subtle)", borderTopColor: "#f59e0b", animation: "spin .7s linear infinite" }} />
                        </div>
                    ) : demandes.length === 0 ? (
                        <div className="dem-card" style={{ textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, padding: "2.5rem" }}>
                            <Clock size={28} style={{ opacity: 0.5, marginBottom: "0.5rem" }} />
                            <p style={{ margin: 0 }}>Aucune demande {filter === "en_attente" ? "en attente" : ""}.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            {demandes.map(d => {
                                const s = STATUT[d.statut] ?? { color: "#9ca3af", label: d.statut };
                                const busy = actionId === d.id;
                                return (
                                    <div key={d.id} className="dem-card">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                                            <div style={{ minWidth: 0 }}>
                                                <p style={{ margin: 0, fontSize: typography.base, fontWeight: 800, color: cssVar.textPrimary }}>{fmtMontant(d.montant)}</p>
                                                <p style={{ margin: "2px 0 0", fontSize: typography.xs, color: cssVar.textMuted }}>
                                                    {d.comptable_nom ?? d.demande_par_login ?? "—"} · {fmt(d.created_at)}
                                                </p>
                                            </div>
                                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: s.color, background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", whiteSpace: "nowrap" }}>{s.label}</span>
                                        </div>
                                        <p style={{ margin: "0 0 0.5rem", fontSize: typography.sm, color: cssVar.textSecondary }}>{d.motif}</p>
                                        {d.statut === "refusee" && d.motif_refus && (
                                            <p style={{ margin: "0 0 0.5rem", fontSize: typography.xs, color: "#ef4444" }}>Refus : {d.motif_refus}</p>
                                        )}
                                        {d.statut === "approuvee" && d.validee_par_login && (
                                            <p style={{ margin: "0 0 0.5rem", fontSize: typography.xs, color: cssVar.textMuted }}>Validé par {d.validee_par_login}</p>
                                        )}
                                        {d.statut === "en_attente" && (
                                            <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border-subtle)" }}>
                                                <button className="dem-btn" disabled={busy} onClick={() => approuver(d.id)} style={{ border: "1px solid #22c55e", background: "rgba(34,197,94,0.08)", color: "#22c55e" }}>
                                                    <Check size={14} /> Approuver
                                                </button>
                                                <button className="dem-btn" disabled={busy} onClick={() => { setRefusId(d.id); setMotifRefus(""); }} style={{ border: "1px solid #ef4444", background: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                                                    <X size={14} /> Refuser
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal refus */}
            {refusId != null && (
                <div onClick={() => setRefusId(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ ...modalCard, maxWidth: 380, borderRadius: radius.xl }}>
                        <h3 style={{ margin: "0 0 1rem", fontSize: typography.base, fontWeight: 800, color: cssVar.textPrimary }}>Refuser la demande</h3>
                        <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Motif du refus *</label>
                        <input type="text" value={motifRefus} onChange={e => setMotifRefus(e.target.value)} autoFocus placeholder="Expliquez le refus" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box", marginBottom: "1rem" }} />
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={() => setRefusId(null)} style={{ flex: 1, padding: "0.6rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                            <button onClick={refuser} disabled={motifRefus.trim().length < 3} style={{ flex: 2, padding: "0.6rem", borderRadius: radius.lg, border: "none", background: "rgba(239,68,68,0.9)", color: "#fff", fontWeight: 700, fontSize: typography.sm, cursor: motifRefus.trim().length < 3 ? "not-allowed" : "pointer", opacity: motifRefus.trim().length < 3 ? 0.6 : 1 }}>Confirmer le refus</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
