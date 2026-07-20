"use client";
// src/app/caisse/page.tsx
// Gestion de la caisse comptable — Rcomptable uniquement

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    getMaCaisseActive,
    ouvrirCaisseComptable,
    fermerCaisseComptable,
    approvisionnerCaisse,
    creerDepense,
    listRemises,
    validerRemise,
    listDemandesAppro,
    type CaisseComptable,
    type MouvementCaisse,
    type RemiseServeur,
    type DemandeApprovisionnement,
} from "@/lib/api/paiements";
import { cssVar, typography, radius } from "@/theme/theme";
import {
    CreditCard,
    X,
    Check,
    RefreshCw,
    ArrowUpCircle,
    ArrowDownCircle,
    Wallet,
    ClipboardList,
    Lock,
    Unlock,
    Clock,
} from "lucide-react";

// Style d'un statut de demande d'approvisionnement
const DEM_STATUT: Record<string, { color: string; label: string }> = {
    en_attente: { color: "#f59e0b", label: "En attente" },
    approuvee:  { color: "#22c55e", label: "Approuvée" },
    refusee:    { color: "#ef4444", label: "Refusée" },
};

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: React.ReactNode; icon: React.ReactNode; color?: string }) {
    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "1.125rem", padding: "1.125rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: "0.875rem", background: color ? `${color}18` : "var(--bg-section-alt)", border: `1px solid ${color ? `${color}30` : "var(--border-subtle)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: color ?? "var(--amber-glow)", flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{title}</p>
                <p style={{ margin: "2px 0 0", fontSize: typography.lg, fontWeight: 800, color: cssVar.textPrimary }}>{value}</p>
            </div>
        </div>
    );
}

type TabKey = "mouvements" | "remises" | "demandes";
type ModalMode = "ouvrir" | "fermer" | "appro" | "depense" | "remise" | null;

export default function CaissePage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [caisse, setCaisse]           = useState<CaisseComptable | null>(null);
    const [mouvements, setMouvements]   = useState<MouvementCaisse[]>([]);
    const [remises, setRemises]         = useState<RemiseServeur[]>([]);
    const [demandes, setDemandes]       = useState<DemandeApprovisionnement[]>([]);
    const [loadingMain, setLoadingMain] = useState(true);
    const [activeTab, setActiveTab]     = useState<TabKey>("mouvements");
    const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [modal, setModal]             = useState<ModalMode>(null);
    const [selectedRemise, setSelectedRemise] = useState<RemiseServeur | null>(null);

    // Champs formulaires
    const [fMontant, setFMontant]       = useState("");
    const [fMotif, setFMotif]           = useState("");
    const [fMontantPhysique, setFMontantPhysique] = useState("");
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError]     = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("manage_caisse_comptable")) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, router, hasPermission]);

    const fetchAll = useCallback(async () => {
        setLoadingMain(true);
        try {
            const cRes = await getMaCaisseActive();
            if (cRes.success && cRes.data) {
                setCaisse(cRes.data);
                setMouvements(cRes.data.mouvements ?? []);
            } else {
                setCaisse(null);
            }
            const rRes = await listRemises();
            if (rRes.success && rRes.data) setRemises(rRes.data.remises ?? []);
            const dRes = await listDemandesAppro();
            if (dRes.success && dRes.data) setDemandes(dRes.data.demandes ?? []);
        } finally {
            setLoadingMain(false);
        }
    }, []);

    useEffect(() => { if (isAuthenticated) fetchAll(); }, [fetchAll, isAuthenticated]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const closeModal = () => { setModal(null); setFormError(null); setFMontant(""); setFMotif(""); setFMontantPhysique(""); setSelectedRemise(null); };

    const handleOuvrir = async () => {
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await ouvrirCaisseComptable();
            if (res.success) { showToast("Caisse ouverte."); closeModal(); fetchAll(); }
            else setFormError("Impossible d'ouvrir la caisse.");
        } catch { setFormError("Erreur de connexion."); }
        finally { setFormLoading(false); }
    };

    const handleFermer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caisse) return;
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await fermerCaisseComptable(caisse.id, { montant_physique: parseFloat(fMontantPhysique), motif_ecart: fMotif || undefined });
            if (res.success) { showToast("Caisse fermée."); closeModal(); fetchAll(); }
            else setFormError("Impossible de fermer la caisse.");
        } catch { setFormError("Erreur."); }
        finally { setFormLoading(false); }
    };

    const handleAppro = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caisse) return;
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await approvisionnerCaisse(caisse.id, { montant: parseFloat(fMontant), motif: fMotif });
            if (res.success) { showToast("Demande envoyée — en attente de validation."); closeModal(); setActiveTab("demandes"); fetchAll(); }
            else setFormError(res.message || "Impossible d'envoyer la demande.");
        } catch { setFormError("Erreur."); }
        finally { setFormLoading(false); }
    };

    const handleDepense = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caisse) return;
        setFormLoading(true);
        setFormError(null);
        try {
            const today = new Date().toISOString().split("T")[0];
            const res = await creerDepense(caisse.id, { montant: parseFloat(fMontant), motif: fMotif, date_depense: today });
            if (res.success) { showToast("Dépense enregistrée."); closeModal(); fetchAll(); }
            else setFormError("Impossible d'enregistrer.");
        } catch { setFormError("Erreur."); }
        finally { setFormLoading(false); }
    };

    const handleValiderRemise = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedRemise) return;
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await validerRemise(selectedRemise.id, { montant_physique: parseFloat(fMontantPhysique), motif_ecart: fMotif || undefined });
            if (res.success) { showToast("Remise validée."); closeModal(); fetchAll(); }
            else setFormError("Impossible de valider.");
        } catch { setFormError("Erreur."); }
        finally { setFormLoading(false); }
    };

    const fmt = (iso: string) => new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    const fmtMontant = (v: string) => `${Number(v).toLocaleString("fr-FR")} GNF`;

    if (isLoading || !user) return <PageLoader />;
    if (!hasPermission("manage_caisse_comptable")) return null;

    const remisesEnAttente = remises.filter(r => !r.valide);

    // Écart temps réel (fermeture caisse / validation remise) :
    // montant physique saisi − solde virtuel attendu.
    const soldeAttendu = modal === "fermer"
        ? (caisse ? Number(caisse.solde) : 0)
        : modal === "remise"
            ? (selectedRemise ? Number(selectedRemise.montant_virtuel) : 0)
            : 0;
    const physiqueSaisi = fMontantPhysique.trim() === "" ? null : Number(fMontantPhysique);
    const ecart = physiqueSaisi === null || Number.isNaN(physiqueSaisi) ? null : physiqueSaisi - soldeAttendu;
    const motifRequis = ecart !== null && ecart !== 0;

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                @keyframes modalIn { from { opacity:0; transform:translateY(12px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
                .cai-root { min-height:100vh; background:var(--bg-dark); }
                .cai-inner { max-width:1100px; margin:0 auto; }
                .tab-btn { padding:0.5rem 1rem; border-radius:9999px; border:1px solid var(--border-subtle); background:transparent; cursor:pointer; font-size:0.875rem; font-weight:600; color:var(--text-muted); transition:all 0.15s; white-space:nowrap; }
                .tab-btn.active { background:var(--gradient-btn); color:#0c0a09; border-color:transparent; }
                .mvt-row { display:flex; align-items:center; gap:0.75rem; padding:0.75rem 0; border-bottom:1px solid var(--border-subtle); animation:fadeIn 0.2s ease; }
                .mvt-row:last-child { border-bottom:none; }
                .action-btn { display:flex; align-items:center; justify-content:center; gap:0.4rem; padding:0.6rem 1rem; border-radius:0.625rem; border:1px solid; cursor:pointer; font-size:0.8rem; font-weight:700; transition:all 0.15s; }
            `}</style>

            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "35vh", pointerEvents: "none", zIndex: 0, background: "transparent" }} />

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200, padding: "0.75rem 1.25rem", borderRadius: radius.xl, background: toast.type === "success" ? "rgba(34,197,94,0.96)" : "rgba(239,68,68,0.96)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
                    {toast.msg}
                </div>
            )}

            {/* Modal */}
            {modal && (
                <>
                    <div onClick={closeModal} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
                    <div style={{ position: "fixed", inset: 0, zIndex: 91, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                        <div style={{ width: "100%", maxWidth: 420, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "1.25rem", padding: "1.5rem", animation: "modalIn 0.25s ease" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                                <h2 style={{ margin: 0, fontSize: typography.lg, fontWeight: 800, color: cssVar.textPrimary }}>
                                    {modal === "ouvrir" ? "Ouvrir la caisse" : modal === "fermer" ? "Fermer la caisse" : modal === "appro" ? "Demande d'approvisionnement" : modal === "depense" ? "Enregistrer une dépense" : "Valider la remise"}
                                </h2>
                                <button onClick={closeModal} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.5rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", cursor: "pointer", color: cssVar.textMuted }}>
                                    <X size={15} />
                                </button>
                            </div>

                            {formError && (
                                <div style={{ marginBottom: "1rem", padding: "0.625rem 0.875rem", borderRadius: radius.lg, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: typography.sm }}>
                                    {formError}
                                </div>
                            )}

                            {modal === "ouvrir" && (
                                <div>
                                    <p style={{ margin: "0 0 1.25rem", fontSize: typography.sm, color: cssVar.textMuted }}>Ouvrir votre caisse comptable pour la journée ?</p>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button onClick={closeModal} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                                        <button onClick={handleOuvrir} disabled={formLoading} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: formLoading ? "not-allowed" : "pointer", opacity: formLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                            {formLoading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #0c0a09", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                                            Ouvrir
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(modal === "fermer" || modal === "remise") && (
                                <form onSubmit={modal === "fermer" ? handleFermer : handleValiderRemise} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                                    {modal === "remise" && selectedRemise && (
                                        <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                                            Montant virtuel : <strong style={{ color: cssVar.textPrimary }}>{fmtMontant(selectedRemise.montant_virtuel)}</strong>
                                        </p>
                                    )}
                                    <div>
                                        <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Montant physique (GNF) *</label>
                                        <input type="number" value={fMontantPhysique} onChange={e => setFMontantPhysique(e.target.value)} required min="0" placeholder="0" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                                    </div>

                                    {/* Écart temps réel : montant physique − solde virtuel attendu */}
                                    {(() => {
                                        const nul = ecart === 0;
                                        const color = ecart === null ? cssVar.textMuted : nul ? "#22c55e" : ecart > 0 ? "#f59e0b" : "#ef4444";
                                        const label = ecart === null ? "" : nul ? "Aucun écart" : ecart > 0 ? "Excédent" : "Manquant";
                                        return (
                                            <div style={{ padding: "0.7rem 0.875rem", borderRadius: radius.lg, background: ecart === null ? "var(--bg-section-alt)" : `${color}14`, border: `1px solid ${ecart === null ? "var(--border-subtle)" : `${color}55`}` }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: typography.xs, color: cssVar.textMuted }}>
                                                    <span>Solde virtuel attendu</span>
                                                    <span style={{ color: cssVar.textSecondary, fontWeight: 600 }}>{fmtMontant(String(soldeAttendu))}</span>
                                                </div>
                                                {ecart !== null && (
                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.4rem", paddingTop: "0.4rem", borderTop: `1px solid ${color}33`, fontSize: typography.sm, fontWeight: 800, color }}>
                                                        <span>{label}</span>
                                                        <span>{ecart > 0 ? "+" : ""}{ecart.toLocaleString("fr-FR")} GNF</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    <div>
                                        <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: motifRequis ? "#ef4444" : cssVar.textMuted, marginBottom: "0.375rem" }}>Motif d&apos;écart {motifRequis ? "(obligatoire)" : "(si différence)"}</label>
                                        <input type="text" value={fMotif} onChange={e => setFMotif(e.target.value)} required={motifRequis} placeholder={motifRequis ? "Expliquez l'écart constaté" : "Optionnel"} style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: `1px solid ${motifRequis ? "rgba(239,68,68,0.4)" : "var(--border-subtle)"}`, background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button type="button" onClick={closeModal} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                                        <button type="submit" disabled={formLoading} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "none", background: modal === "fermer" ? "rgba(239,68,68,0.85)" : "var(--gradient-btn)", color: modal === "fermer" ? "#fff" : "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: formLoading ? "not-allowed" : "pointer", opacity: formLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                            {formLoading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${modal === "fermer" ? "#fff" : "#0c0a09"}`, borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                                            {modal === "fermer" ? "Fermer la caisse" : "Valider"}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {(modal === "appro" || modal === "depense") && (
                                <form onSubmit={modal === "appro" ? handleAppro : handleDepense} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Montant (GNF) *</label>
                                        <input type="number" value={fMontant} onChange={e => setFMontant(e.target.value)} required min="1" placeholder="0" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Motif *</label>
                                        <input type="text" value={fMotif} onChange={e => setFMotif(e.target.value)} required placeholder={modal === "appro" ? "Source de l'approvisionnement" : "Nature de la dépense"} style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button type="button" onClick={closeModal} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                                        <button type="submit" disabled={formLoading} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid", borderColor: modal === "appro" ? "#22c55e" : "#ef4444", background: modal === "appro" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", color: modal === "appro" ? "#22c55e" : "#ef4444", fontWeight: 700, fontSize: typography.sm, cursor: formLoading ? "not-allowed" : "pointer", opacity: formLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                            {formLoading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${modal === "appro" ? "#22c55e" : "#ef4444"}`, borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                                            {modal === "appro" ? "Envoyer la demande" : "Enregistrer"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="cai-root rp-page-pad">
                <div className="cai-inner">

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.3rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "0.875rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "#14b8a6" }}>
                                    <CreditCard size={20} />
                                </div>
                                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary }}>Ma Caisse</h1>
                            </div>
                            <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                                Gestion de votre caisse comptable quotidienne
                            </p>
                        </div>
                        <button onClick={fetchAll} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.6rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            <RefreshCw size={13} /> Actualiser
                        </button>
                    </div>

                    {loadingMain ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "0.75rem", color: cssVar.textMuted }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                            Chargement de la caisse…
                        </div>
                    ) : (
                        <>
                            {/* Stat cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
                                <StatCard title="Solde caisse" value={caisse ? fmtMontant(caisse.solde) : "—"} icon={<Wallet size={20} />} color="#14b8a6" />
                                <StatCard title="Statut" value={caisse ? (caisse.is_closed ? "Fermée" : "Ouverte") : "Non initialisée"} icon={caisse?.is_closed ? <Lock size={20} /> : <Unlock size={20} />} color={caisse?.is_closed ? "#ef4444" : "#22c55e"} />
                                <StatCard title="Remises en attente" value={remisesEnAttente.length} icon={<ClipboardList size={20} />} color={remisesEnAttente.length > 0 ? "#f59e0b" : "#22c55e"} />
                                <StatCard title="Mouvements" value={mouvements.length} icon={<ArrowUpCircle size={20} />} color="#3b82f6" />
                            </div>

                            {/* Actions caisse */}
                            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: "1.125rem 1.25rem", marginBottom: "1.5rem" }}>
                                <p style={{ margin: "0 0 0.875rem", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cssVar.textMuted }}>Actions</p>
                                <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap" }}>
                                    {!caisse || caisse.is_closed ? (
                                        <button className="action-btn" onClick={() => setModal("ouvrir")} style={{ color: "#22c55e", borderColor: "rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.06)" }}>
                                            <Unlock size={14} /> Ouvrir la caisse
                                        </button>
                                    ) : (
                                        <>
                                            <button className="action-btn" onClick={() => setModal("appro")} style={{ color: "#22c55e", borderColor: "rgba(34,197,94,0.35)", background: "rgba(34,197,94,0.06)" }}>
                                                <ArrowUpCircle size={14} /> Approvisionner
                                            </button>
                                            <button className="action-btn" onClick={() => setModal("depense")} style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.06)" }}>
                                                <ArrowDownCircle size={14} /> Dépense
                                            </button>
                                            <button className="action-btn" onClick={() => setModal("fermer")} style={{ color: "#f59e0b", borderColor: "rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.06)" }}>
                                                <Lock size={14} /> Fermer la caisse
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Tabs */}
                            <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                                <button className={`tab-btn${activeTab === "mouvements" ? " active" : ""}`} onClick={() => setActiveTab("mouvements")}>
                                    Mouvements ({mouvements.length})
                                </button>
                                <button className={`tab-btn${activeTab === "remises" ? " active" : ""}`} onClick={() => setActiveTab("remises")}>
                                    Remises serveurs {remisesEnAttente.length > 0 && `(${remisesEnAttente.length} en attente)`}
                                </button>
                                <button className={`tab-btn${activeTab === "demandes" ? " active" : ""}`} onClick={() => setActiveTab("demandes")}>
                                    Mes demandes {demandes.filter(d => d.statut === "en_attente").length > 0 && `(${demandes.filter(d => d.statut === "en_attente").length})`}
                                </button>
                                <button className="tab-btn" onClick={() => router.push("/caisse/historique")}>
                                    Historique →
                                </button>
                            </div>

                            {/* Mouvements */}
                            {activeTab === "mouvements" && (
                                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: "0.875rem 1.25rem" }}>
                                    {mouvements.length === 0 ? (
                                        <p style={{ textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, padding: "2rem" }}>Aucun mouvement enregistré.</p>
                                    ) : (
                                        mouvements.map(m => (
                                            <div key={m.id} className="mvt-row">
                                                <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: m.type_mouvement === "approvisionnement" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: m.type_mouvement === "approvisionnement" ? "#22c55e" : "#ef4444" }}>
                                                    {m.type_mouvement === "approvisionnement" ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.motif}</p>
                                                    <p style={{ margin: "1px 0 0", fontSize: typography.xs, color: cssVar.textMuted }}>{fmt(m.created_at)}</p>
                                                </div>
                                                <span style={{ fontWeight: 800, fontSize: typography.sm, color: m.type_mouvement === "approvisionnement" ? "#22c55e" : "#ef4444", whiteSpace: "nowrap" }}>
                                                    {m.type_mouvement === "approvisionnement" ? "+" : "−"}{fmtMontant(m.montant)}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Remises */}
                            {activeTab === "remises" && (
                                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: "0.875rem 1.25rem" }}>
                                    {remises.length === 0 ? (
                                        <p style={{ textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, padding: "2rem" }}>Aucune remise serveur à valider.</p>
                                    ) : (
                                        remises.map(r => (
                                            <div key={r.id} className="mvt-row">
                                                <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: r.valide ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: r.valide ? "#22c55e" : "#f59e0b" }}>
                                                    <ClipboardList size={16} />
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>
                                                        Remise #{r.id} — Serveur #{r.serveur}
                                                    </p>
                                                    <p style={{ margin: "1px 0 0", fontSize: typography.xs, color: cssVar.textMuted }}>{fmt(r.created_at)} · Virtuel : {fmtMontant(r.montant_virtuel)}</p>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    {r.valide ? (
                                                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#22c55e", background: "var(--bg-section-alt)", padding: "0.2rem 0.5rem", borderRadius: "9999px" }}>✓ Validée</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setSelectedRemise(r); setFMontantPhysique(r.montant_virtuel); setModal("remise"); }}
                                                            style={{ padding: "0.4rem 0.75rem", borderRadius: "0.5rem", border: "1px solid rgba(245,158,11,0.35)", background: "rgba(245,158,11,0.06)", color: "#f59e0b", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                                                        >
                                                            Valider
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* Mes demandes d'approvisionnement */}
                            {activeTab === "demandes" && (
                                <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: "0.875rem 1.25rem" }}>
                                    {demandes.length === 0 ? (
                                        <p style={{ textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, padding: "2rem" }}>Aucune demande d&apos;approvisionnement.</p>
                                    ) : (
                                        demandes.map(d => {
                                            const s = DEM_STATUT[d.statut] ?? { color: "#9ca3af", label: d.statut };
                                            return (
                                                <div key={d.id} className="mvt-row">
                                                    <div style={{ width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `${s.color}1a`, color: s.color }}>
                                                        {d.statut === "en_attente" ? <Clock size={16} /> : d.statut === "approuvee" ? <Check size={16} /> : <X size={16} />}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.motif}</p>
                                                        <p style={{ margin: "1px 0 0", fontSize: typography.xs, color: cssVar.textMuted }}>
                                                            {fmt(d.created_at)}
                                                            {d.statut === "refusee" && d.motif_refus && ` · Refus : ${d.motif_refus}`}
                                                            {d.statut === "approuvee" && d.validee_par_login && ` · par ${d.validee_par_login}`}
                                                        </p>
                                                    </div>
                                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem" }}>
                                                        <span style={{ fontWeight: 800, fontSize: typography.sm, color: cssVar.textPrimary, whiteSpace: "nowrap" }}>{fmtMontant(d.montant)}</span>
                                                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: s.color, background: `${s.color}1a`, padding: "0.1rem 0.45rem", borderRadius: "9999px" }}>{s.label}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                        </>
                    )}
                </div>
            </div>
        </>
    );
}
