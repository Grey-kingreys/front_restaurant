"use client";
// src/app/client/page.tsx - Tableau de bord client (Rclient)

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck, Clock, Wallet, ChefHat, ArrowRight, ClipboardList, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getMesCommandes, listRestaurantsPublics, type MaCommande, type RestaurantPublic } from "@/lib/api/public";

const STATUT_COLOR: Record<string, string> = {
    en_attente: "#f59e0b", prete: "#3b82f6", en_livraison: "#8b5cf6",
    servie: "#22c55e", payee: "#22c55e",
};

function formatGNF(v: string | number) {
    return Number(v).toLocaleString("fr-FR") + " GNF";
}

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
}

export default function ClientDashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [commandes, setCommandes] = useState<MaCommande[]>([]);
    const [stats, setStats] = useState({ total: 0, en_cours: 0, total_depense: "0" });
    const [restos, setRestos] = useState<RestaurantPublic[]>([]);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [cmdRes, restoRes] = await Promise.all([getMesCommandes(), listRestaurantsPublics()]);
            if (cmdRes.success && cmdRes.data) {
                setCommandes(cmdRes.data.commandes);
                setStats(cmdRes.data.stats);
            }
            if (restoRes.success && restoRes.data) setRestos(restoRes.data.restaurants);
        } catch { /* silencieux */ }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const prenom = user?.nom_complet?.split(" ")[0] ?? "";

    const statCards = [
        { label: "Commandes totales", value: stats.total, icon: ClipboardList, color: "#f59e0b" },
        { label: "En cours", value: stats.en_cours, icon: Clock, color: "#3b82f6" },
        { label: "Total dépensé", value: formatGNF(stats.total_depense), icon: Wallet, color: "#22c55e" },
    ];

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(1rem, 4vw, 2rem)" }}>
            {/* En-tête */}
            <div style={{ marginBottom: "1.75rem" }}>
                <h1 style={{ margin: "0 0 0.25rem", fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 900, color: "var(--text-primary)" }}>
                    Bonjour {prenom}
                </h1>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)" }}>
                    Parcourez les restaurants et passez vos commandes en livraison ou à emporter.
                </p>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "1rem", marginBottom: "1.75rem" }}>
                {statCards.map((s) => {
                    const Ic = s.icon;
                    return (
                        <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "1.25rem" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem" }}>
                                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-lg)", background: `${s.color}1f`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", color: s.color }}>
                                    <Ic size={18} />
                                </div>
                                <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{s.label}</span>
                            </div>
                            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-primary)" }}>{s.value}</div>
                        </div>
                    );
                })}
            </div>

            {/* CTA parcourir */}
            <Link href="/client/restaurants" style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem",
                padding: "1.25rem 1.5rem", borderRadius: "var(--radius-xl)", marginBottom: "1.75rem",
                background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0c0a09", textDecoration: "none",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <ShoppingBag size={24} />
                    <div>
                        <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>Passer une commande</div>
                        <div style={{ fontSize: "0.8rem", opacity: 0.75 }}>Découvrez les restaurants disponibles</div>
                    </div>
                </div>
                <ArrowRight size={22} />
            </Link>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "1.5rem" }}>
                {/* Commandes récentes */}
                <section>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>Commandes récentes</h2>
                        {commandes.length > 0 && (
                            <Link href="/client/commandes" style={{ fontSize: "0.82rem", color: "var(--amber-glow)", textDecoration: "none", fontWeight: 600 }}>Tout voir</Link>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "1rem 0" }}>Chargement…</div>
                    ) : commandes.length === 0 ? (
                        <div style={{ background: "var(--bg-card)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                            <ClipboardList size={28} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
                            <p style={{ margin: 0, fontSize: "0.9rem" }}>Aucune commande pour l'instant.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                            {commandes.slice(0, 4).map((c) => {
                                const color = STATUT_COLOR[c.statut] ?? "#f59e0b";
                                return (
                                    <button key={c.commande_id} onClick={() => router.push(`/restaurant/${c.restaurant_slug}/confirmation/${c.cle_suivi}`)}
                                        style={{ textAlign: "left", cursor: "pointer", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                                        <div style={{ minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>
                                                {c.type_commande === "livraison" ? <Truck size={14} /> : <ShoppingBag size={14} />}
                                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.restaurant}</span>
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                                                {c.nb_items} article{c.nb_items > 1 ? "s" : ""} · {formatDate(c.date_commande)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                                            <div style={{ fontWeight: 800, color: "#f59e0b", fontSize: "0.9rem" }}>{formatGNF(c.montant_total)}</div>
                                            <span style={{ display: "inline-block", marginTop: "0.2rem", padding: "2px 8px", borderRadius: "var(--radius-full)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", color, fontSize: "0.68rem", fontWeight: 700 }}>{c.statut_label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Restaurants suggérés */}
                <section>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                        <h2 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>Restaurants</h2>
                        {restos.length > 0 && (
                            <Link href="/client/restaurants" style={{ fontSize: "0.82rem", color: "var(--amber-glow)", textDecoration: "none", fontWeight: 600 }}>Tout voir</Link>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem", padding: "1rem 0" }}>Chargement…</div>
                    ) : restos.length === 0 ? (
                        <div style={{ background: "var(--bg-card)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                            <ChefHat size={28} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
                            <p style={{ margin: 0, fontSize: "0.9rem" }}>Aucun restaurant disponible.</p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                            {restos.slice(0, 4).map((r) => (
                                <Link key={r.id} href={`/restaurant/${r.slug}`} style={{ textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>{r.nom}</div>
                                        {r.adresse && <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}><MapPin size={11} />{r.adresse}</div>}
                                    </div>
                                    <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
                                        {r.accept_livraison && <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", padding: "2px 7px", borderRadius: "var(--radius-full)", background: "var(--bg-section-alt)", color: "#8b5cf6", fontSize: "0.66rem", fontWeight: 700 }}><Truck size={10} />Livraison</span>}
                                        {r.accept_emporter && <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", padding: "2px 7px", borderRadius: "var(--radius-full)", background: "var(--bg-section-alt)", color: "#f59e0b", fontSize: "0.66rem", fontWeight: 700 }}><ShoppingBag size={10} />Emporter</span>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
