"use client";
// src/app/caisse/historique/page.tsx
// Historique des caisses comptables fermées.
// Comptable : ses caisses. Admin / Manager (view_caisse_globale) : toutes.

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listCaissesComptables, type CaisseComptableListItem } from "@/lib/api/paiements";
import { cssVar, typography, radius } from "@/theme/theme";
import { History, RefreshCw, ChevronRight, Archive } from "lucide-react";

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

const dateLabel = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
const heure = (iso: string) =>
    new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export default function HistoriqueCaissesPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [caisses, setCaisses] = useState<CaisseComptableListItem[]>([]);
    const [loading, setLoading] = useState(true);

    const canAccess = hasPermission("manage_caisse_comptable") || hasPermission("view_caisse_globale");
    const isSupervisor = hasPermission("view_caisse_globale");

    const fetchCaisses = useCallback(async () => {
        setLoading(true);
        const res = await listCaissesComptables(true);
        if (res.success && res.data) setCaisses(res.data.caisses);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !canAccess) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, canAccess, router]);

    useEffect(() => {
        if (isAuthenticated && user && canAccess) fetchCaisses();
    }, [isAuthenticated, user, canAccess, fetchCaisses]);

    const fmtMontant = (v: string) => `${Number(v).toLocaleString("fr-FR")} GNF`;

    if (isLoading || !user) return <PageLoader />;
    if (!canAccess) return null;

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                .hist-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:1rem; padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem; cursor:pointer; animation:fadeIn 0.2s ease; transition:border-color .15s; text-align:left; width:100%; }
                .hist-card:hover { border-color:var(--border-amber); }
            `}</style>

            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "35vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(20,184,166,0.05) 0%, transparent 70%)" }} />

            <div className="rp-page-pad" style={{ minHeight: "100vh", background: "var(--bg-dark)" }}>
                <div style={{ maxWidth: 820, margin: "0 auto" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.3rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "0.875rem", background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#14b8a6" }}>
                                    <History size={20} />
                                </div>
                                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary }}>Historique des caisses</h1>
                            </div>
                            <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                                {isSupervisor ? "Toutes les caisses comptables fermées" : "Vos caisses comptables fermées"}
                            </p>
                        </div>
                        <button onClick={fetchCaisses} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.6rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            <RefreshCw size={13} /> Actualiser
                        </button>
                    </div>

                    {/* Liste */}
                    {loading ? (
                        <div style={{ padding: "3rem", display: "flex", justifyContent: "center" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-subtle)", borderTopColor: "#14b8a6", animation: "spin .7s linear infinite" }} />
                        </div>
                    ) : caisses.length === 0 ? (
                        <div style={{ textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, padding: "3rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl }}>
                            <Archive size={28} style={{ opacity: 0.5, marginBottom: "0.5rem" }} />
                            <p style={{ margin: 0 }}>Aucune caisse fermée pour le moment.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "0.75rem" }}>
                            {caisses.map(c => {
                                const ecart = c.montant_physique_fermeture != null ? Number(c.montant_physique_fermeture) - Number(c.solde) : null;
                                return (
                                    <button key={c.id} className="hist-card" onClick={() => router.push(`/caisse/historique/${c.id}`)}>
                                        <div style={{ width: 44, height: 44, borderRadius: "0.75rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "#14b8a6", flexShrink: 0 }}>
                                            <Archive size={20} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: typography.base, fontWeight: 700, color: cssVar.textPrimary }}>Caisse du {dateLabel(c.opened_at)}</p>
                                            <p style={{ margin: "2px 0 0", fontSize: typography.xs, color: cssVar.textMuted }}>
                                                {isSupervisor && `${c.comptable_nom || c.comptable_login} · `}
                                                Fermée à {c.closed_at ? heure(c.closed_at) : "—"} · Physique {fmtMontant(c.montant_physique_fermeture ?? "0")}
                                            </p>
                                        </div>
                                        {ecart !== null && ecart !== 0 && (
                                            <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#f59e0b", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", padding: "0.2rem 0.55rem", borderRadius: "9999px", whiteSpace: "nowrap" }}>
                                                {ecart > 0 ? "Excédent" : "Manquant"} {Math.abs(ecart).toLocaleString("fr-FR")}
                                            </span>
                                        )}
                                        <ChevronRight size={18} style={{ color: cssVar.textMuted, flexShrink: 0 }} />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
