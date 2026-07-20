"use client";
// src/app/remises/page.tsx
// Historique des remises — Rserveur (ses propres remises)

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listRemises, type RemiseServeur } from "@/lib/api/paiements";
import { cssVar, typography, radius } from "@/theme/theme";
import {
    ClipboardList,
    RefreshCw,
    Check,
    X,
    ChevronDown,
    Banknote,
} from "lucide-react";

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

function StatutBadge({ valide }: { valide: boolean }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700,
            color: valide ? "#22c55e" : "#f59e0b",
            background: valide ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
            border: `1px solid ${valide ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: valide ? "#22c55e" : "#f59e0b" }} />
            {valide ? "Validée" : "En attente"}
        </span>
    );
}

export default function RemisesPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [remises, setRemises]         = useState<RemiseServeur[]>([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<string | null>(null);
    const [filterValide, setFilterValide] = useState<"" | "true" | "false">("");
    const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("view_remises")) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, router]);

    const fetchRemises = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await listRemises();
            if (data.success && data.data) {
                const all = data.data.remises;
                if (filterValide === "true") setRemises(all.filter(r => r.valide));
                else if (filterValide === "false") setRemises(all.filter(r => !r.valide));
                else setRemises(all);
            } else {
                setError("Impossible de charger les remises.");
            }
        } catch {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    }, [filterValide]);

    useEffect(() => { if (isAuthenticated) fetchRemises(); }, [fetchRemises, isAuthenticated]);

    const fmt = (iso: string) =>
        new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const fmtMontant = (v: string | null) =>
        v ? `${Number(v).toLocaleString("fr-FR")} GNF` : "—";

    if (isLoading || !user) return <PageLoader />;
    if (!hasPermission("view_remises")) return null;

    const totalVirtuels = remises.reduce((s, r) => s + parseFloat(r.montant_virtuel || "0"), 0);
    const validees = remises.filter(r => r.valide);
    const enAttente = remises.filter(r => !r.valide);

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
                .rem-root { min-height:100vh; background:var(--bg-dark); }
                .rem-inner { max-width:900px; margin:0 auto; }
                .rem-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:1.125rem; padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem; animation:fadeIn 0.2s ease; transition:border-color 0.15s; }
                .rem-card:hover { border-color:var(--border-amber); }
            `}</style>

            {toast && (
                <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200, padding: "0.75rem 1.25rem", borderRadius: radius.xl, background: toast.type === "success" ? "rgba(34,197,94,0.96)" : "rgba(239,68,68,0.96)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="rem-root rp-page-pad">
                <div className="rem-inner">

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.3rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "0.875rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7" }}>
                                    <Banknote size={20} />
                                </div>
                                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary }}>Mes remises</h1>
                            </div>
                            <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                                Historique de vos remises en caisse
                            </p>
                        </div>
                        <button onClick={fetchRemises} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.6rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            <RefreshCw size={13} /> Actualiser
                        </button>
                    </div>

                    {/* Stats rapides */}
                    {!loading && remises.length > 0 && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            {[
                                { label: "Total remises", val: remises.length, color: "#a855f7" },
                                { label: "Validées", val: validees.length, color: "#22c55e" },
                                { label: "En attente", val: enAttente.length, color: "#f59e0b" },
                                { label: "Total virtuel", val: `${totalVirtuels.toLocaleString("fr-FR")} GNF`, color: "#3b82f6" },
                            ].map(s => (
                                <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "0.875rem", padding: "0.875rem 1rem" }}>
                                    <p style={{ margin: "0 0 2px", fontSize: typography.xs, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{s.label}</p>
                                    <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: 800, color: s.color }}>{s.val}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Filtre */}
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
                        <div style={{ position: "relative" }}>
                            <select
                                value={filterValide}
                                onChange={e => setFilterValide(e.target.value as "" | "true" | "false")}
                                style={{ background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", borderRadius: "0.625rem", padding: "0.5rem 2rem 0.5rem 0.75rem", color: cssVar.textPrimary, fontSize: "0.8rem", fontWeight: 600, outline: "none", appearance: "none", cursor: "pointer" }}
                            >
                                <option value="">Toutes les remises</option>
                                <option value="true">Validées</option>
                                <option value="false">En attente</option>
                            </select>
                            <ChevronDown size={12} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none" }} />
                        </div>
                    </div>

                    {/* Contenu */}
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 280, gap: "0.75rem", color: cssVar.textMuted }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                            Chargement des remises…
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid rgba(239,68,68,0.2)" }}>
                            <p style={{ color: cssVar.textSecondary, marginBottom: "1rem" }}>{error}</p>
                            <button onClick={fetchRemises} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.25rem", borderRadius: radius.lg, border: "1px solid var(--border-amber)", background: "transparent", color: "var(--amber-glow)", cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}>
                                <RefreshCw size={14} /> Réessayer
                            </button>
                        </div>
                    ) : remises.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid var(--border-subtle)" }}>
                            <ClipboardList size={40} style={{ color: cssVar.textMuted, margin: "0 auto 1rem", display: "block" }} />
                            <h3 style={{ margin: "0 0 0.5rem", color: cssVar.textPrimary }}>Aucune remise</h3>
                            <p style={{ margin: 0, color: cssVar.textMuted, fontSize: typography.sm }}>
                                Vos remises en caisse apparaîtront ici après chaque paiement encaissé.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                            {remises.map(r => (
                                <div key={r.id} className="rem-card">
                                    {/* Icône */}
                                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: r.valide ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: r.valide ? "#22c55e" : "#f59e0b", flexShrink: 0 }}>
                                        <Banknote size={18} />
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                                            <span style={{ fontSize: typography.sm, fontWeight: 700, color: cssVar.textPrimary }}>
                                                Remise #{r.id}
                                            </span>
                                            <StatutBadge valide={r.valide} />
                                        </div>
                                        <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted }}>
                                            {fmt(r.created_at)}
                                        </p>
                                        {r.motif_ecart && (
                                            <p style={{ margin: "0.2rem 0 0", fontSize: "0.7rem", color: "#f59e0b", background: "rgba(245,158,11,0.08)", padding: "0.15rem 0.4rem", borderRadius: "0.375rem", display: "inline-block" }}>
                                                ⚠ {r.motif_ecart}
                                            </p>
                                        )}
                                    </div>

                                    {/* Montants */}
                                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "flex-end" }}>
                                            <div>
                                                <span style={{ fontSize: "0.7rem", color: cssVar.textMuted }}>Virtuel </span>
                                                <span style={{ fontSize: typography.sm, fontWeight: 800, color: cssVar.textPrimary }}>{fmtMontant(r.montant_virtuel)}</span>
                                            </div>
                                            {r.montant_physique && (
                                                <div>
                                                    <span style={{ fontSize: "0.7rem", color: cssVar.textMuted }}>Physique </span>
                                                    <span style={{ fontSize: typography.xs, fontWeight: 700, color: r.valide ? "#22c55e" : cssVar.textMuted }}>{fmtMontant(r.montant_physique)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
