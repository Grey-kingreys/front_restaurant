"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { listCommandes, type Commande, type StatutCommande } from "@/lib/api/commandes";
import { cssVar, typography, radius, spacing } from "@/theme/theme";
import { 
    Clock, 
    Flame, 
    Check, 
    CheckCircle2, 
    ArrowLeft, 
    RefreshCw,
    ShoppingBag
} from "lucide-react";

const STATUT_CONFIG: Record<StatutCommande, { label: string; color: string; bg: string; border: string }> = {
    en_attente: { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    prete: { label: "Prête", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)" },
    servie: { label: "Servie", color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)" },
    payee: { label: "Payée", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
};

export default function MesCommandesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && user.role !== "Rtable") router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, router]);

    const fetchCommandes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Pour une table, le backend filtre automatiquement par session
            const res = await listCommandes();
            if (res.success && res.data) {
                setCommandes(res.data.commandes);
            } else {
                setError("Impossible de charger vos commandes.");
            }
        } catch {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user?.role === "Rtable") fetchCommandes();
    }, [isAuthenticated, user, fetchCommandes]);

    if (isLoading || !user) return <PageLoader />;

    return (
        <div className="mes-cmd-root">
            <style>{`
                @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
                .mes-cmd-root { min-height:100vh; background:var(--bg-dark); padding: 1.5rem 1rem 5rem; }
                .mes-cmd-inner { max-width:600px; margin:0 auto; }
                .cmd-card { 
                    background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: ${radius.xl}; 
                    padding: 1.25rem; margin-bottom: 1rem; animation: fadeIn 0.3s ease forwards;
                }
                .item-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border-subtle); }
                .item-row:last-child { border-bottom: none; }
            `}</style>

            <div className="mes-cmd-inner">
                {/* Header */}
                <div style={{ marginBottom: spacing["6"] }}>
                    <Link href="/menu" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", fontSize: typography.sm, marginBottom: "1rem" }}>
                        <ArrowLeft size={14} />
                        Retour au menu
                    </Link>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h1 style={{ margin: 0, fontSize: typography["2xl"], fontWeight: typography.bold, fontFamily: typography.fontSerif, color: "var(--text-primary)" }}>
                            Mes Commandes
                        </h1>
                        <button onClick={fetchCommandes} style={{ background: "none", border: "none", color: "var(--amber-glow)", cursor: "pointer" }}>
                            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "4rem" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin 0.75s linear infinite", margin: "0 auto" }} />
                    </div>
                ) : commandes.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl }}>
                        <ShoppingBag size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                        <h3 style={{ color: "var(--text-primary)" }}>Aucune commande</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: typography.sm }}>Vous n'avez pas encore passé de commande dans cette session.</p>
                        <Link href="/menu" className="btn-primary" style={{ marginTop: "1.5rem", display: "inline-flex" }}>Commander maintenant</Link>
                    </div>
                ) : (
                    commandes.map((cmd) => {
                        const sc = STATUT_CONFIG[cmd.statut];
                        return (
                            <div key={cmd.id} className="cmd-card">
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                    <span style={{ fontWeight: 800, color: "var(--amber-glow)", fontFamily: "monospace" }}>#{cmd.id}</span>
                                    <span style={{ 
                                        display: "inline-flex", alignItems: "center", gap: "0.3rem", 
                                        padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", 
                                        fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` 
                                    }}>
                                        <StatutIcon statut={cmd.statut} />
                                        {sc.label}
                                    </span>
                                </div>
                                
                                <div style={{ marginBottom: "1rem" }}>
                                    {cmd.items.map((item) => (
                                        <div key={item.id} className="item-row">
                                            <span style={{ color: "var(--text-primary)", fontSize: typography.sm }}>
                                                <span style={{ fontWeight: 800, color: "var(--amber-glow)" }}>{item.quantite}x</span> {item.plat_nom}
                                            </span>
                                            <span style={{ color: "var(--text-secondary)", fontSize: typography.sm, fontWeight: 600 }}>
                                                {Number(item.sous_total).toLocaleString("fr-FR")} GNF
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "2px dashed var(--border-subtle)" }}>
                                    <span style={{ fontSize: typography.sm, color: "var(--text-muted)", fontWeight: 600 }}>Total</span>
                                    <span style={{ fontSize: typography.lg, fontWeight: 900, color: "var(--text-primary)" }}>
                                        {Number(cmd.montant_total).toLocaleString("fr-FR")} GNF
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function StatutIcon({ statut }: { statut: StatutCommande }) {
    const size = 12;
    if (statut === "en_attente") return <Clock size={size} />;
    if (statut === "prete") return <Flame size={size} />;
    if (statut === "servie") return <Check size={size} />;
    return <CheckCircle2 size={size} />;
}

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
        </div>
    );
}
