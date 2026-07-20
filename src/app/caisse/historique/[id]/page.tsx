"use client";
// src/app/caisse/historique/[id]/page.tsx
// Détail d'une caisse comptable fermée : montants clés + tous les mouvements.

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getCaisseComptable, type CaisseComptable } from "@/lib/api/paiements";
import { cssVar, typography, radius } from "@/theme/theme";
import {
    ArrowLeft, Wallet, Banknote, AlertTriangle, ArrowUpCircle, ArrowDownCircle,
    Send, Scale, Lock,
} from "lucide-react";

const MVT: Record<string, { color: string; sign: string; icon: React.ReactNode }> = {
    approvisionnement: { color: "#22c55e", sign: "+", icon: <ArrowUpCircle size={16} /> },
    depense:           { color: "#ef4444", sign: "−", icon: <ArrowDownCircle size={16} /> },
    fermeture:         { color: "#8b5cf6", sign: "→", icon: <Send size={16} /> },
    ecart:             { color: "#f59e0b", sign: "≠", icon: <Scale size={16} /> },
};

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: React.ReactNode; icon: React.ReactNode; color: string }) {
    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "1rem", padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: "0.75rem", background: `${color}18`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
            <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{title}</p>
                <p style={{ margin: "2px 0 0", fontSize: typography.base, fontWeight: 800, color: cssVar.textPrimary }}>{value}</p>
            </div>
        </div>
    );
}

export default function CaisseDetailPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = Number(params?.id);

    const [caisse, setCaisse] = useState<CaisseComptable | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const canAccess = hasPermission("manage_caisse_comptable") || hasPermission("view_caisse_globale");

    const fetchCaisse = useCallback(async () => {
        setLoading(true);
        const res = await getCaisseComptable(id);
        if (res.success && res.data) setCaisse(res.data);
        else setNotFound(true);
        setLoading(false);
    }, [id]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !canAccess) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, canAccess, router]);

    useEffect(() => {
        if (isAuthenticated && user && canAccess && id) fetchCaisse();
    }, [isAuthenticated, user, canAccess, id, fetchCaisse]);

    const fmt = (iso: string) => new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    const fmtMontant = (v: string | null) => `${Number(v ?? 0).toLocaleString("fr-FR")} GNF`;
    const dateLabel = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

    if (isLoading || !user || loading) return <PageLoader />;
    if (!canAccess) return null;

    if (notFound || !caisse) return (
        <div className="rp-page-pad" style={{ minHeight: "100vh", background: "var(--bg-dark)" }}>
            <div style={{ maxWidth: 820, margin: "0 auto" }}>
                <button onClick={() => router.push("/caisse/historique")} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", marginBottom: "1.5rem" }}>
                    <ArrowLeft size={14} /> Historique
                </button>
                <p style={{ color: cssVar.textMuted }}>Caisse introuvable.</p>
            </div>
        </div>
    );

    const virtuel = Number(caisse.solde);
    const physique = caisse.montant_physique_fermeture != null ? Number(caisse.montant_physique_fermeture) : null;
    const ecart = physique != null ? physique - virtuel : null;
    const mouvements = caisse.mouvements ?? [];

    return (
        <>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "35vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(20,184,166,0.05) 0%, transparent 70%)" }} />

            <div className="rp-page-pad" style={{ minHeight: "100vh", background: "var(--bg-dark)" }}>
                <div style={{ maxWidth: 820, margin: "0 auto" }}>
                    <button onClick={() => router.push("/caisse/historique")} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", marginBottom: "1.25rem" }}>
                        <ArrowLeft size={14} /> Historique
                    </button>

                    {/* En-tête */}
                    <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.3rem" }}>
                            <div style={{ width: 40, height: 40, borderRadius: "0.875rem", background: "rgba(20,184,166,0.1)", border: "1px solid rgba(20,184,166,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#14b8a6" }}>
                                <Lock size={18} />
                            </div>
                            <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: cssVar.textPrimary }}>Caisse du {dateLabel(caisse.opened_at)}</h1>
                        </div>
                        <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                            {caisse.comptable_nom || caisse.comptable_login} · Ouverte {fmt(caisse.opened_at)}
                            {caisse.closed_at && ` · Fermée ${fmt(caisse.closed_at)}`}
                        </p>
                    </div>

                    {/* Montants clés */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        <StatCard title="Solde virtuel" value={fmtMontant(caisse.solde)} icon={<Wallet size={18} />} color="#14b8a6" />
                        <StatCard title="Physique compté" value={fmtMontant(caisse.montant_physique_fermeture)} icon={<Banknote size={18} />} color="#3b82f6" />
                        <StatCard
                            title="Écart"
                            value={ecart == null ? "—" : ecart === 0 ? "Aucun" : `${ecart > 0 ? "+" : ""}${ecart.toLocaleString("fr-FR")}`}
                            icon={<Scale size={18} />}
                            color={ecart == null || ecart === 0 ? "#22c55e" : "#f59e0b"}
                        />
                    </div>

                    {caisse.motif_ecart && (
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.8rem 1rem", borderRadius: radius.lg, background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", color: "#f59e0b", fontSize: typography.sm, marginBottom: "1.5rem" }}>
                            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                            <span><strong>Motif de l&apos;écart :</strong> {caisse.motif_ecart}</span>
                        </div>
                    )}

                    {/* Mouvements */}
                    <h2 style={{ margin: "0 0 0.75rem", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted }}>Mouvements de la caisse</h2>
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: "0.5rem 1.25rem" }}>
                        {mouvements.length === 0 ? (
                            <p style={{ textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, padding: "2rem" }}>Aucun mouvement enregistré.</p>
                        ) : (
                            mouvements.map(m => {
                                const s = MVT[m.type_mouvement] ?? { color: "#9ca3af", sign: "", icon: <Wallet size={16} /> };
                                return (
                                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
                                        <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: `${s.color}1a`, color: s.color }}>{s.icon}</div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>{m.type_mouvement_display}</p>
                                            <p style={{ margin: "1px 0 0", fontSize: typography.xs, color: cssVar.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.motif} · {fmt(m.created_at)}</p>
                                        </div>
                                        <span style={{ fontWeight: 800, fontSize: typography.sm, color: s.color, whiteSpace: "nowrap" }}>{s.sign}{fmtMontant(m.montant)}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
