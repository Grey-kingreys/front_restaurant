"use client";
// src/app/statistiques/page.tsx
// Statistiques globales de la plateforme — Super Admin uniquement

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getPlatformStats, type PlatformStats, type RestaurantParStats } from "@/lib/api/company";
import { cssVar, typography, radius } from "@/theme/theme";
import { BarChart2, RefreshCw, Users, TableProperties, Building2 } from "lucide-react";
import type { Role } from "@/types";

const ROLES_AUTORISES: Role[] = ["Rsuper_admin"];

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) {
    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "1.125rem 1.25rem", display: "flex", alignItems: "center", gap: "0.875rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-lg)", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted }}>{label}</p>
                <p style={{ margin: "0.1rem 0 0", fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary, lineHeight: 1 }}>{value}</p>
            </div>
        </div>
    );
}

export default function StatistiquesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [stats, setStats]   = useState<PlatformStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]   = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !ROLES_AUTORISES.includes(user.role as Role)) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, router]);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getPlatformStats();
            if (res.success && res.data) setStats(res.data);
            else setError("Impossible de charger les statistiques.");
        } catch {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { if (isAuthenticated) fetchStats(); }, [fetchStats, isAuthenticated]);

    if (isLoading || !user) return <PageLoader />;
    if (!ROLES_AUTORISES.includes(user.role as Role)) return null;

    const totalUtilisateurs = stats?.utilisateurs_par_restaurant.reduce((s, r) => s + r.nombre_utilisateurs, 0) ?? 0;
    const totalTables       = stats?.utilisateurs_par_restaurant.reduce((s, r) => s + r.nombre_tables, 0) ?? 0;

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                .stat-row:hover { background: var(--bg-section-alt) !important; }
                .rp-table-desktop th, .rp-table-desktop td { padding: 0.75rem 1rem; text-align: left; }
                .rp-table-desktop th { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); border-bottom: 1px solid var(--border-subtle); }
                .rp-table-desktop td { font-size: 0.85rem; border-bottom: 1px solid var(--border-subtle); color: var(--text-secondary); }
                .rp-table-desktop tr:last-child td { border-bottom: none; }
            `}</style>

            <div style={{ minHeight: "100vh", background: "var(--bg-dark)" }} className="rp-page-pad">
                <div style={{ maxWidth: 1000, margin: "0 auto" }}>

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{ width: 40, height: 40, borderRadius: "var(--radius-xl)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber-glow)" }}>
                                <BarChart2 size={20} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary }}>Statistiques plateforme</h1>
                                <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>Vue globale de tous les restaurants</p>
                            </div>
                        </div>
                        <button onClick={fetchStats} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.6rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            <RefreshCw size={13} /> Actualiser
                        </button>
                    </div>

                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "0.75rem", color: cssVar.textMuted }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                            Chargement…
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid rgba(239,68,68,0.2)" }}>
                            <p style={{ color: cssVar.textSecondary, marginBottom: "1rem" }}>{error}</p>
                            <button onClick={fetchStats} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.25rem", borderRadius: radius.lg, border: "1px solid var(--border-amber)", background: "transparent", color: "var(--amber-glow)", cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}>
                                <RefreshCw size={14} /> Réessayer
                            </button>
                        </div>
                    ) : stats ? (
                        <>
                            {/* KPI cards */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.875rem", marginBottom: "1.75rem" }}>
                                <StatCard label="Total restaurants" value={stats.restaurants_total}     color="var(--amber-glow)"  icon={<Building2 size={18} />} />
                                <StatCard label="Actifs"            value={stats.restaurants_actifs}    color="#22c55e"            icon={<Building2 size={18} />} />
                                <StatCard label="Suspendus"         value={stats.restaurants_suspendus} color="#ef4444"            icon={<Building2 size={18} />} />
                                <StatCard label="Utilisateurs"      value={totalUtilisateurs}           color="#3b82f6"            icon={<Users size={18} />} />
                                <StatCard label="Tables configurées" value={totalTables}                color="#a855f7"            icon={<TableProperties size={18} />} />
                            </div>

                            {/* Tableau par restaurant */}
                            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, overflow: "hidden" }}>
                                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-subtle)" }}>
                                    <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: cssVar.textPrimary }}>Par restaurant</h2>
                                </div>

                                <div style={{ overflowX: "auto" }}>
                                    <table className="rp-table-desktop" style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr>
                                                <th>Restaurant</th>
                                                <th>Statut</th>
                                                <th style={{ textAlign: "right" }}>Utilisateurs</th>
                                                <th style={{ textAlign: "right" }}>Tables</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.utilisateurs_par_restaurant.map((r: RestaurantParStats) => (
                                                <tr key={r.restaurant_id} className="stat-row" style={{ transition: "background 0.12s" }}>
                                                    <td>
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                            <div style={{ width: 28, height: 28, borderRadius: "var(--radius-md)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber-glow)", flexShrink: 0 }}>
                                                                <Building2 size={13} />
                                                            </div>
                                                            <span style={{ fontWeight: 600, color: cssVar.textPrimary }}>{r.restaurant_nom}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-full)", fontSize: "0.7rem", fontWeight: 700, color: r.is_active ? "#22c55e" : "#ef4444", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)" }}>
                                                            <span style={{ width: 4, height: 4, borderRadius: "50%", background: r.is_active ? "#22c55e" : "#ef4444" }} />
                                                            {r.is_active ? "Actif" : "Suspendu"}
                                                        </span>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <span style={{ fontWeight: 700, color: cssVar.textPrimary }}>{r.nombre_utilisateurs}</span>
                                                    </td>
                                                    <td style={{ textAlign: "right" }}>
                                                        <span style={{ fontWeight: 700, color: cssVar.textPrimary }}>{r.nombre_tables}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </>
    );
}
