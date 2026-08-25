"use client";
// src/app/menu/page.tsx
// Module Menu complet - liste, filtres, actions staff et table

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu, CATEGORIES } from "@/hooks/useMenu";
import { PlatCardStaff, PlatCardTable } from "@/components/menu/PlatCard";
import { addToPanier } from "@/lib/api/commandes";
import type { Plat } from "@/lib/api/menu";
import type { Role } from "@/types";
import { cssVar, typography, radius, spacing } from "@/theme/theme";
import {
    Plus,
    Search,
    X,
    ShoppingCart,
    Filter,
    Check,
    RefreshCw,
    ChevronRight,
    ClipboardList
} from "lucide-react";

const CAN_EDIT: Role[] = ["Radmin", "Rmanager", "Rchef_cuisinier"];
const IS_STAFF: Role[] = ["Radmin", "Rmanager", "Rchef_cuisinier", "Rcuisinier", "Rserveur", "Rcomptable", "Rsuper_admin"];

export default function MenuPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();
    const isTable = user?.role === "Rtable";

    const {
        plats, allPlats, loading, error, stats,
        categorie, setCategorie,
        search, setSearch,
        disponibleFilter, setDisponibleFilter,
        handleToggle, handleDelete, refetch,
    } = useMenu({ tableMode: isTable });

    const [cartMap, setCartMap] = useState<Record<number, number>>({});
    const [addingId, setAddingId] = useState<number | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [toastType, setToastType] = useState<"success" | "error">("success");

    const showToast = useCallback((msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg);
        setToastType(type);
        setTimeout(() => setToastMsg(null), 3000);
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
    }, [isLoading, isAuthenticated, router]);

    const handleAddToCart = async (plat: Plat) => {
        if (!plat.disponible) return;
        setAddingId(plat.id);
        try {
            const newQty = (cartMap[plat.id] ?? 0) + 1;
            await addToPanier(plat.id, newQty);
            setCartMap((prev) => ({ ...prev, [plat.id]: newQty }));
            showToast(`« ${plat.nom} » ajouté au panier`);
        } catch {
            showToast("Impossible d'ajouter au panier", "error");
        } finally {
            setAddingId(null);
        }
    };

    const handleToggleWithToast = async (id: number) => {
        const plat = allPlats.find((p) => p.id === id);
        if (!plat) return;
        const etaitDisponible = plat.disponible;
        await handleToggle(id);
        showToast(`« ${plat.nom} » ${etaitDisponible ? "désactivé" : "activé"}`);
    };

    const handleDeleteWithConfirm = (id: number) => {
        const plat = allPlats.find((p) => p.id === id);
        if (!plat) return;
        if (!window.confirm(`Supprimer « ${plat.nom} » définitivement ?`)) return;
        handleDelete(id);
        showToast(`« ${plat.nom} » supprimé`);
    };

    if (isLoading || !user) return <PageLoader />;

    const canEdit = hasPermission("manage_menu");
    const isStaff = !isTable;
    const totalCart = Object.values(cartMap).reduce((a, b) => a + b, 0);

    return (
        <>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform: translateX(60px) scale(0.95); } to { opacity:1; transform: translateX(0) scale(1); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        .menu-root { min-height:100vh; background:var(--bg-dark); }
        .menu-inner { max-width:1100px; margin:0 auto; }
        .cat-btn {
          padding: 0.5rem 0.875rem; border-radius: 9999px; border: 1px solid var(--border-subtle);
          background: transparent; cursor: pointer; font-size: 0.875rem; font-weight: 600;
          color: var(--text-muted); transition: all 0.15s; white-space: nowrap;
          display:flex; align-items:center; gap:0.35rem; min-height:40px;
        }
        .cat-btn.active { background: var(--gradient-btn); color: #0c0a09; border-color: transparent; }
        .cat-btn:not(.active):hover { border-color: var(--border-amber); color: var(--text-primary); }
        .filter-toggle {
          padding: 0.5rem 0.875rem; border-radius: 9999px;
          border: 1px solid var(--border-subtle); background: transparent;
          cursor: pointer; font-size: 0.875rem; font-weight: 600;
          color: var(--text-muted); transition: all 0.15s;
          display:flex; align-items:center; gap:0.35rem; min-height:40px; white-space:nowrap;
        }
        .filter-toggle.active { border-color: var(--amber-glow); color: var(--amber-glow); background: rgba(245,158,11,0.08); }
        .stat-pill { padding:0.5rem 0.875rem; border-radius:0.65rem; background:var(--bg-card); border:1px solid var(--border-subtle); display:flex; align-items:center; gap:0.4rem; white-space:nowrap; }
      `}</style>

            {/* Toast */}
            {toastMsg && (
                <div style={{
                    position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200,
                    padding: "0.75rem 1.25rem", borderRadius: radius.xl,
                    background: toastType === "success" ? "rgba(34,197,94,0.96)" : "rgba(239,68,68,0.96)",
                    color: "#fff", fontWeight: 600, fontSize: "0.85rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                    animation: "toastIn 0.3s ease",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    backdropFilter: "blur(8px)",
                }}>
                    {toastType === "success"
                        ? <Check size={16} />
                        : <X size={16} />}
                    {toastMsg}
                </div>
            )}

            <div className="menu-root rp-page-pad">
                <div className="menu-inner" style={{ position: "relative", zIndex: 1 }}>

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing["3"], marginBottom: spacing["5"], flexWrap: "wrap" }}>
                        <div>
                            <nav style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.4rem" }}>
                                <Link href="/dashboard" style={{ fontSize: typography.xs, color: cssVar.textMuted, textDecoration: "none" }}>
                                    Tableau de bord
                                </Link>
                                <ChevronRight size={10} style={{ color: "var(--text-muted)" }} />
                                <span style={{ fontSize: typography.xs, color: cssVar.textSecondary }}>Menu</span>
                            </nav>
                            <h1 className="rp-h1" style={{ margin: 0, fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary }}>
                                {isTable ? "Notre Menu" : "Gestion du Menu"}
                            </h1>
                            <p style={{ margin: "0.2rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                                {isTable
                                    ? `${plats.length} plat${plats.length > 1 ? "s" : ""} disponible${plats.length > 1 ? "s" : ""}`
                                    : `${stats.disponibles} disponibles · ${stats.indisponibles} indisponibles · ${stats.total} au total`}
                            </p>
                        </div>

                        <div className="rp-header-actions" style={{ display: "flex", gap: spacing["2"], alignItems: "center", flexWrap: "wrap" }}>
                            {isTable && totalCart > 0 && (
                                <Link href="/commandes/panier" style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                    padding: "0.55rem 1rem", borderRadius: radius.lg,
                                    background: "var(--gradient-btn)", color: "#0c0a09",
                                    fontWeight: 700, fontSize: typography.sm, textDecoration: "none",
                                }}>
                                    <ShoppingCart size={15} />
                                    Mon panier
                                    <span style={{ background: "#0c0a09", color: "var(--amber-glow)", borderRadius: "var(--radius-full)", padding: "0.1rem 0.4rem", fontSize: "0.65rem", fontWeight: 800 }}>
                                        {totalCart}
                                    </span>
                                </Link>
                            )}

                            {canEdit && (
                                <Link href="/menu/nouveau" style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                    padding: "0.55rem 1rem", borderRadius: radius.lg,
                                    background: "var(--gradient-btn)", color: "#0c0a09",
                                    fontWeight: 700, fontSize: typography.sm, textDecoration: "none",
                                }}>
                                    <Plus size={14} />
                                    Ajouter un plat
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Stats rapides (Staff) */}
                    {isStaff && !isTable && (
                        <div className="rp-scroll-x" style={{ marginBottom: spacing["5"] }}>
                            {[
                                { label: "Total", value: stats.total, color: cssVar.amberGlow },
                                { label: "Disponibles", value: stats.disponibles, color: "#22c55e" },
                                { label: "Indisponibles", value: stats.indisponibles, color: "#ef4444" },
                                ...stats.parCategorie.filter((c) => c.count > 0).map((c) => ({
                                    label: c.label, value: c.count, color: cssVar.textMuted,
                                })),
                            ].map((s) => (
                                <div key={s.label} className="stat-pill">
                                    <span style={{ fontSize: typography.lg, fontWeight: 800, color: s.color }}>{s.value}</span>
                                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>{s.label}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Filtres */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: "0.875rem", marginBottom: spacing["5"], display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                        {/* Recherche */}
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none", display: "flex" }}>
                                <Search size={15} />
                            </span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un plat…"
                                style={{
                                    width: "100%", padding: "0.6rem 0.875rem 0.6rem 2.25rem",
                                    borderRadius: radius.lg, border: "1px solid var(--border-subtle)",
                                    background: "var(--bg-section-alt)", color: cssVar.textPrimary,
                                    fontSize: typography.base, outline: "none", boxSizing: "border-box",
                                }}
                            />
                            {search && (
                                <button onClick={() => setSearch("")} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: cssVar.textMuted, padding: 0, display: "flex" }}>
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Catégories + disponibilité */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            {/* Dropdown catégorie */}
                            <div style={{ position: "relative", flexShrink: 0 }}>
                                <span style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none", display: "flex" }}>
                                    <Filter size={13} />
                                </span>
                                <select
                                    value={categorie ?? ""}
                                    onChange={(e) => setCategorie((e.target.value || undefined) as typeof categorie)}
                                    style={{
                                        padding: "0.5rem 2rem 0.5rem 2rem",
                                        borderRadius: radius.lg,
                                        border: `1px solid ${categorie ? "var(--border-amber)" : "var(--border-subtle)"}`,
                                        background: "var(--bg-section-alt)",
                                        color: categorie ? "var(--amber-glow)" : "var(--text-secondary)",
                                        fontSize: typography.sm, fontWeight: 600,
                                        cursor: "pointer", outline: "none",
                                        appearance: "none", WebkitAppearance: "none",
                                        minWidth: 160,
                                    }}
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c.value ?? ""} value={c.value ?? ""}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                                {/* Chevron */}
                                <span style={{ position: "absolute", right: "0.65rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none", fontSize: "0.65rem" }}>▼</span>
                            </div>

                            {/* Filtres disponibilité (staff uniquement) */}
                            {isStaff && !isTable && (
                                <>
                                    <button
                                        onClick={() => setDisponibleFilter(disponibleFilter === true ? undefined : true)}
                                        className={`filter-toggle${disponibleFilter === true ? " active" : ""}`}
                                    >
                                        <Check size={12} />
                                        Disponibles
                                    </button>
                                    <button
                                        onClick={() => setDisponibleFilter(disponibleFilter === false ? undefined : false)}
                                        className={`filter-toggle${disponibleFilter === false ? " active" : ""}`}
                                    >
                                        <X size={12} />
                                        Indisponibles
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Contenu principal */}
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "0.75rem", color: cssVar.textMuted }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin 0.75s linear infinite" }} />
                            Chargement du menu…
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid rgba(239,68,68,0.2)" }}>
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem", color: "#ef4444" }}>
                                <X size={32} />
                            </div>
                            <p style={{ color: cssVar.textSecondary, marginBottom: "1rem" }}>{error}</p>
                            <button onClick={refetch} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.25rem", borderRadius: radius.lg, border: "1px solid var(--border-amber)", background: "transparent", color: "var(--amber-glow)", cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}>
                                <RefreshCw size={14} />
                                Réessayer
                            </button>
                        </div>
                    ) : plats.length === 0 ? (
                        <EmptyState search={search} canEdit={canEdit} categorie={categorie} />
                    ) : (
                        <div className="rp-plats-grid" style={{ animation: "fadeIn 0.3s ease" }}>
                            {isTable
                                ? plats.map((plat) => (
                                    <PlatCardTable
                                        key={plat.id}
                                        plat={plat}
                                        onAddToCart={handleAddToCart}
                                        quantiteInCart={cartMap[plat.id] ?? 0}
                                        adding={addingId === plat.id}
                                    />
                                ))
                                : plats.map((plat) => (
                                    <PlatCardStaff
                                        key={plat.id}
                                        plat={plat}
                                        canEdit={canEdit}
                                        onToggle={handleToggleWithToast}
                                        onDelete={canEdit ? handleDeleteWithConfirm : undefined}
                                    />
                                ))}
                        </div>
                    )}

                    {/* Résumé */}
                    {!loading && plats.length > 0 && (
                        <p style={{ textAlign: "center", marginTop: spacing["6"], fontSize: typography.xs, color: cssVar.textMuted }}>
                            {plats.length} plat{plats.length > 1 ? "s" : ""}
                            {search ? ` pour « ${search} »` : ""}
                            {categorie ? ` · ${CATEGORIES.find((c) => c.value === categorie)?.label}` : ""}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────



function EmptyState({ search, canEdit, categorie }: { search: string; canEdit: boolean; categorie: string }) {
    return (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid var(--border-subtle)" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", color: "var(--icon-primary)" }}>
                <ClipboardList size={28} />
            </div>
            <h3 style={{ margin: "0 0 0.5rem", color: "var(--text-primary)" }}>
                {search ? "Aucun résultat" : "Aucun plat"}
            </h3>
            <p style={{ margin: "0 0 1.5rem", color: "var(--text-muted)", fontSize: typography.sm }}>
                {search
                    ? `Aucun plat ne correspond à « ${search} »`
                    : canEdit
                        ? "Commencez par ajouter votre premier plat."
                        : "Le menu est vide pour l'instant."}
            </p>
            {canEdit && !search && (
                <Link href="/menu/nouveau" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.5rem", borderRadius: radius.lg, background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, textDecoration: "none" }}>
                    <Plus size={14} />
                    Ajouter le premier plat
                </Link>
            )}
        </div>
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