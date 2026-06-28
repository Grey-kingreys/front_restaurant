"use client";
// src/app/commandes/cuisine/page.tsx
// Kitchen Display System (KDS) pour la préparation des commandes

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listCommandesCuisine, marquerPrete, type Commande } from "@/lib/api/commandes";
import type { Role } from "@/types";
import { cssVar, typography, radius, spacing, cardBase } from "@/theme/theme";
import { Clock, CheckCircle2, RefreshCw, ChefHat, Flame, Utensils } from "lucide-react";

const ROLES_AUTORISES: Role[] = ["Rchef_cuisinier", "Rcuisinier", "Rsuper_admin", "Radmin"];

export default function CuisinePage() {
    const { user, isAuthenticated, isLoading, hasPermission, hasAnyPermission } = useAuth();
    const router = useRouter();

    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasAnyPermission("view_cuisine", "manage_cuisine")) {
            router.replace("/dashboard");
        }
    }, [isLoading, isAuthenticated, user, router, hasAnyPermission]);

    const fetchCommandes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // On récupère uniquement les commandes "en_attente" pour la cuisine
            const res = await listCommandesCuisine("en_attente");
            if (res.success && res.data) {
                // Trier les plus anciennes en premier (FIFO)
                const sorted = res.data.commandes.sort(
                    (a, b) => new Date(a.date_commande).getTime() - new Date(b.date_commande).getTime()
                );
                setCommandes(sorted);
            } else {
                setError("Impossible de charger les commandes.");
            }
        } catch {
            setError("Erreur de connexion avec le serveur.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Rafraîchissement automatique toutes les 15 secondes
    useEffect(() => {
        if (isAuthenticated && hasAnyPermission("view_cuisine", "manage_cuisine")) {
            fetchCommandes();
            const interval = setInterval(fetchCommandes, 15000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, user, fetchCommandes]);

    const handleMarquerPrete = async (id: number) => {
        setActionLoading(id);
        try {
            const res = await marquerPrete(id);
            if (res.success) {
                // Retirer la commande de la liste affichée
                setCommandes((prev) => prev.filter((c) => c.id !== id));
            } else {
                alert("Impossible de marquer la commande comme prête.");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de la mise à jour.");
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading || !user) return <PageLoader />;
    if (!hasAnyPermission("view_cuisine", "manage_cuisine")) return null;
    const canMarkPrete = hasPermission("manage_cuisine");

    return (
        <div className="kds-root rp-page-pad">
            <style>{`
                @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
                @keyframes pulse-amber { 
                    0% { box-shadow: 0 0 0 0 rgba(245,158,11, 0.4); } 
                    70% { box-shadow: 0 0 0 10px rgba(245,158,11, 0); } 
                    100% { box-shadow: 0 0 0 0 rgba(245,158,11, 0); } 
                }
                .kds-root { min-height: 100vh; background: var(--bg-dark); display: flex; flex-direction: column; }
                
                .ticket-card {
                    background: var(--bg-card);
                    border: 1px solid var(--border-amber);
                    border-radius: ${radius.xl};
                    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                    animation: fadeIn 0.3s ease forwards;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                .ticket-header {
                    background: rgba(245,158,11,0.1);
                    padding: 1rem 1.25rem;
                    border-bottom: 1px solid var(--border-amber);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .ticket-body { padding: 1.25rem; flex: 1; }
                .ticket-item {
                    display: flex; gap: 0.75rem; align-items: flex-start;
                    padding: 0.75rem 0;
                    border-bottom: 1px dashed var(--border-subtle);
                }
                .ticket-item:last-child { border-bottom: none; }
                .qty-badge {
                    background: var(--gradient-btn);
                    color: #0c0a09;
                    font-weight: 900;
                    min-width: 28px; height: 28px;
                    border-radius: 6px;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.9rem; flex-shrink: 0;
                }
                .ticket-footer {
                    padding: 1rem 1.25rem;
                    border-top: 1px solid var(--border-subtle);
                    background: var(--bg-section-alt);
                }
                .btn-prete {
                    width: 100%; padding: 0.8rem;
                    border-radius: ${radius.lg}; border: none;
                    background: var(--gradient-btn); color: #0c0a09;
                    font-weight: 800; font-size: 1rem; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; gap: 0.5rem;
                    transition: transform 0.15s, filter 0.15s;
                }
                .btn-prete:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-2px); }
                .btn-prete:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>

            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "35vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(245,158,11,0.08) 0%, transparent 70%)" }} />

            <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
                
                {/* Header global */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: spacing["6"] }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                            <ChefHat size={20} color="var(--amber-glow)" />
                            <h1 className="rp-h1" style={{ margin: 0, fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary }}>
                                File d&apos;Attente Cuisine
                            </h1>
                        </div>
                        <p style={{ margin: 0, color: cssVar.textMuted, fontSize: typography.sm }}>
                            {commandes.length} commande{commandes.length > 1 ? "s" : ""} à préparer
                        </p>
                    </div>

                    <button onClick={fetchCommandes} disabled={loading} style={{ 
                        background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", 
                        color: "var(--text-secondary)", padding: "0.6rem 1rem", borderRadius: radius.lg,
                        display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 600,
                        minHeight: "44px",
                    }}>
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Actualiser
                    </button>
                </div>

                {/* Grille des commandes */}
                {loading && commandes.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "4px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin 0.75s linear infinite" }} />
                    </div>
                ) : commandes.length === 0 ? (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(245,158,11,0.02)", border: "1px dashed var(--border-amber)", borderRadius: radius["2xl"] }}>
                        <Utensils size={64} style={{ color: "var(--border-amber)", marginBottom: "1rem", opacity: 0.5 }} />
                        <h2 style={{ color: cssVar.textPrimary, fontFamily: typography.fontSerif, marginBottom: "0.5rem" }}>Aucune commande en attente</h2>
                        <p style={{ color: cssVar.textMuted }}>La cuisine est calme pour le moment. Bon travail !</p>
                    </div>
                ) : (
                    <div className="rp-kds-grid">
                        {commandes.map((cmd) => (
                            <TicketCommande
                                key={cmd.id}
                                cmd={cmd}
                                onPrete={() => handleMarquerPrete(cmd.id)}
                                isSubmitting={actionLoading === cmd.id}
                                canMarkPrete={canMarkPrete}
                            />
                        ))}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

function TicketCommande({ cmd, onPrete, isSubmitting, canMarkPrete }: { cmd: Commande; onPrete: () => void; isSubmitting: boolean; canMarkPrete: boolean }) {
    // Calculer le temps écoulé depuis la commande
    const [elapsed, setElapsed] = useState("");
    const [isUrgent, setIsUrgent] = useState(false);

    useEffect(() => {
        const updateTime = () => {
            const diff = Math.floor((new Date().getTime() - new Date(cmd.date_commande).getTime()) / 1000); // en secondes
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            setElapsed(`${minutes}m ${seconds}s`);
            
            // Si la commande a plus de 15 minutes, elle est urgente
            setIsUrgent(minutes >= 15);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [cmd.date_commande]);

    return (
        <div className="ticket-card" style={isUrgent ? { animation: "pulse-amber 2s infinite" } : undefined}>
            <div className="ticket-header" style={isUrgent ? { background: "rgba(239,68,68,0.15)", borderBottomColor: "rgba(239,68,68,0.3)" } : undefined}>
                <div>
                    <span style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--text-primary)" }}>
                        Table {cmd.table_numero}
                    </span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px", fontWeight: 600 }}>
                        CMD #{cmd.id}
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", color: isUrgent ? "#ef4444" : "var(--amber-glow)", fontWeight: 700, fontSize: "0.9rem", background: "var(--bg-dark)", padding: "0.3rem 0.6rem", borderRadius: radius.md }}>
                    {isUrgent ? <Flame size={16} /> : <Clock size={16} />}
                    {elapsed}
                </div>
            </div>

            <div className="ticket-body">
                {cmd.items.map((item) => (
                    <div key={item.id} className="ticket-item">
                        <div className="qty-badge">{item.quantite}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.2 }}>
                                {item.plat_nom}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="ticket-footer">
                {canMarkPrete && <button
                    className="btn-prete"
                    onClick={onPrete}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <RefreshCw size={20} className="animate-spin" />
                    ) : (
                        <>
                            <CheckCircle2 size={20} />
                            Marquer comme prête
                        </>
                    )}
                </button>}
            </div>
        </div>
    );
}

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
