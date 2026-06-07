"use client";
// src/app/commandes/panier/page.tsx
// Page Panier — Consultation et validation de la commande (Table uniquement)

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
    getPanier,
    updatePanierItem,
    removePanierItem,
    validerPanier,
    type PanierItem
} from "@/lib/api/commandes";
import type { Role } from "@/types";
import { cssVar, typography, radius, spacing } from "@/theme/theme";
import {
    ShoppingCart,
    X,
    Trash2,
    ArrowLeft,
    CheckCircle2,
    Minus,
    Plus,
} from "lucide-react";

export default function PanierPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [items, setItems] = useState<PanierItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const isTable = user?.role === "Rtable";

    const fetchPanier = useCallback(async () => {
        if (!isTable) return;
        setLoading(true);
        try {
            const res = await getPanier();
            if (res.success && res.data) {
                setItems(res.data.items);
            } else {
                setError("Impossible de charger le panier.");
            }
        } catch {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    }, [isTable]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && isAuthenticated && !isTable) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, isTable, router]);

    useEffect(() => {
        if (isAuthenticated && isTable) fetchPanier();
    }, [isAuthenticated, isTable, fetchPanier]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleUpdateQty = async (itemId: number, platId: number, currentQty: number, delta: number) => {
        const newQty = currentQty + delta;
        if (newQty < 1 || newQty > 10) return;

        setItems(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, quantite: newQty, sous_total: String(newQty * Number(item.plat_detail.prix_unitaire)) }
                : item
        ));

        try {
            const res = await updatePanierItem(platId, newQty);
            if (!res.success) {
                setItems(prev => prev.map(item =>
                    item.id === itemId
                        ? { ...item, quantite: currentQty, sous_total: String(currentQty * Number(item.plat_detail.prix_unitaire)) }
                        : item
                ));
                showToast("Erreur lors de la mise à jour", "error");
            }
        } catch {
            setItems(prev => prev.map(item =>
                item.id === itemId
                    ? { ...item, quantite: currentQty, sous_total: String(currentQty * Number(item.plat_detail.prix_unitaire)) }
                    : item
            ));
            showToast("Erreur lors de la mise à jour", "error");
        }
    };

    const handleRemove = async (itemId: number, platId: number) => {
        try {
            const res = await removePanierItem(platId);
            if (res.success) {
                setItems(items.filter(item => item.id !== itemId));
                showToast("Plat retiré du panier");
            }
        } catch {
            showToast("Erreur lors de la suppression", "error");
        }
    };

    const handleValider = async () => {
        if (items.length === 0) return;
        setValidating(true);
        try {
            const res = await validerPanier();
            if (res.success) {
                showToast("Commande validée avec succès !");
                setTimeout(() => router.push("/commandes/mes-commandes"), 1500);
            } else {
                showToast(res.message || "Erreur lors de la validation", "error");
            }
        } catch (e: any) {
            showToast(e.message || "Erreur réseau", "error");
        } finally {
            setValidating(false);
        }
    };

    if (isLoading || !user || !isTable) return <PageLoader />;

    const total = items.reduce((acc, item) => acc + (Number(item.plat_detail.prix_unitaire) * item.quantite), 0);

    return (
        <>
            <style>{`
                @keyframes fadeIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
                @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
                .panier-root { min-height:100vh; background:var(--bg-dark); }
                .panier-inner { max-width:800px; margin:0 auto; position:relative; z-index:1; }
                .item-card { 
                    background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: radius.xl; 
                    padding: 1rem; display: flex; gap: 1rem; align-items: center; margin-bottom: 0.75rem;
                    animation: fadeIn 0.3s ease forwards;
                }
                .qty-btn {
                    width: 40px; height: 40px; border-radius: 0.5rem; border: 1px solid var(--border-subtle);
                    background: var(--bg-section-alt); color: var(--text-primary); cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                    flex-shrink: 0;
                }
                .qty-btn:hover { border-color: var(--amber-glow); color: var(--amber-glow); }
                .qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
                .checkout-bar {
                    position: fixed; bottom: 0; left: 0; right: 0; background: var(--bg-card);
                    border-top: 1px solid var(--border-amber); padding: 0.875rem 1.25rem;
                    display: flex; align-items: center; justify-content: space-between; gap: 1rem;
                    box-shadow: 0 -4px 20px rgba(0,0,0,0.2); z-index: 100;
                    padding-bottom: max(0.875rem, env(safe-area-inset-bottom));
                }
                @media(min-width:1024px) {
                    .checkout-bar { left: 15rem; }
                }
                @media(min-width:1024px) and (max-width:1279px) {
                    .checkout-bar.collapsed { left: 4.5rem; }
                }
            `}</style>

            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "40vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(245,158,11,0.06) 0%, transparent 70%)" }} />

            {toast && (
                <div style={{ position: "fixed", bottom: "5rem", right: "1.5rem", zIndex: 200, padding: "0.75rem 1.25rem", borderRadius: "1rem", background: toast.type === "success" ? "rgba(34,197,94,0.95)" : "rgba(239,68,68,0.95)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", animation: "slideIn 0.3s ease", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {toast.type === "success" ? <CheckCircle2 size={16} /> : <X size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="panier-root rp-page-pad" style={{ paddingBottom: "6rem" }}>
                <div className="panier-inner">
                    {/* Header */}
                    <div style={{ marginBottom: spacing["6"] }}>
                        <Link href="/menu" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", textDecoration: "none", fontSize: typography.sm, marginBottom: "1rem" }}>
                            <ArrowLeft size={14} />
                            Retour au menu
                        </Link>
                        <h1 className="rp-h1" style={{ margin: 0, fontWeight: typography.bold, fontFamily: typography.fontSerif, color: "var(--text-primary)" }}>
                            Mon Panier
                        </h1>
                        <p style={{ margin: "0.2rem 0 0", fontSize: typography.sm, color: "var(--text-muted)" }}>
                            {items.length} article{items.length > 1 ? "s" : ""} sélectionné{items.length > 1 ? "s" : ""}
                        </p>
                    </div>

                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "1rem", color: "var(--text-muted)" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin 0.75s linear infinite" }} />
                            <span>Chargement de votre panier…</span>
                        </div>
                    ) : items.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "1.25rem" }}>
                            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--icon-bg)", color: "var(--icon-primary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                                <ShoppingCart size={32} />
                            </div>
                            <h2 style={{ fontSize: typography.lg, fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Votre panier est vide</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: typography.sm, marginBottom: "2rem" }}>
                                Parcourez notre carte et ajoutez les plats qui vous font envie !
                            </p>
                            <Link href="/menu" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
                                Voir la carte
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            {items.map((item, i) => (
                                <div key={item.id} className="item-card" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: "0 0 0.2rem", fontSize: typography.base, fontWeight: 700, color: "var(--text-primary)" }}>
                                            {item.plat_detail.nom}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: typography.sm, color: "var(--amber-glow)", fontWeight: 700 }}>
                                            {Number(item.plat_detail.prix_unitaire).toLocaleString("fr-FR")} GNF
                                        </p>
                                    </div>

                                    {/* Qty Controls */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--bg-section-alt)", padding: "0.25rem", borderRadius: "0.75rem", border: "1px solid var(--border-subtle)" }}>
                                        <button 
                                            className="qty-btn" 
                                            onClick={() => handleUpdateQty(item.id, item.plat_detail.id, item.quantite, -1)}
                                            disabled={item.quantite <= 1}
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span style={{ minWidth: "1.5rem", textAlign: "center", fontWeight: 800, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                                            {item.quantite}
                                        </span>
                                        <button 
                                            className="qty-btn" 
                                            onClick={() => handleUpdateQty(item.id, item.plat_detail.id, item.quantite, 1)}
                                            disabled={item.quantite >= 10}
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>

                                    <button 
                                        onClick={() => handleRemove(item.id, item.plat_detail.id)}
                                        style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.5rem", display: "flex" }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Checkout Bar */}
            {!loading && items.length > 0 && (
                <div className="checkout-bar">
                    <div>
                        <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>Total à payer</p>
                        <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 900, color: "var(--amber-glow)" }}>
                            {total.toLocaleString("fr-FR")} GNF
                        </p>
                    </div>
                    <button 
                        onClick={handleValider}
                        disabled={validating}
                        className="btn-primary" 
                        style={{ padding: "0.875rem 2rem", fontSize: "1rem", borderRadius: "1rem" }}
                    >
                        {validating ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #0c0a09", borderTopColor: "transparent", animation: "spin 0.6s linear infinite" }} />
                                Validation…
                            </div>
                        ) : (
                            "Commander"
                        )}
                    </button>
                </div>
            )}
        </>
    );
}

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
