"use client";
// src/app/menu/page.tsx

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useMenu, CATEGORIES } from "@/hooks/useMenu";
import { PlatCardStaff, PlatCardTable } from "@/components/menu/PlatCard";
import { addToPanier } from "@/lib/api/commandes";
import type { Plat } from "@/lib/api/menu";
import type { Role } from "@/types";
import { cssVar, typography, radius, spacing, palette } from "@/theme/theme";

// Rôles qui peuvent éditer le menu
const CAN_EDIT: Role[] = ["Radmin", "Rmanager", "Rchef_cuisinier"];
// Rôles qui peuvent voir le menu (Staff)
const IS_STAFF: Role[] = ["Radmin", "Rmanager", "Rchef_cuisinier", "Rcuisinier", "Rserveur", "Rcomptable", "Rsuper_admin"];

export default function MenuPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const isTable = user?.role === "Rtable";

    const {
        plats, allPlats, loading, error, stats,
        categorie, setCategorie,
        search, setSearch,
        disponibleFilter, setDisponibleFilter,
        handleToggle, handleDelete, refetch,
    } = useMenu({ tableMode: isTable });

    // Panier state (pour Table)
    const [cartMap, setCartMap] = useState<Record<number, number>>({}); // id → quantité
    const [addingId, setAddingId] = useState<number | null>(null);
    const [cartFeedback, setCartFeedback] = useState<string | null>(null);

    // Toast feedback
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
        await handleToggle(id);
        if (plat) {
            showToast(`« ${plat.nom} » ${plat.disponible ? "désactivé" : "activé"}`);
        }
    };

    const handleDeleteWithConfirm = (id: number) => {
        const plat = allPlats.find((p) => p.id === id);
        if (!plat) return;
        if (!window.confirm(`Supprimer « ${plat.nom} » définitivement ?`)) return;
        handleDelete(id);
        showToast(`« ${plat.nom} » supprimé`);
    };

    if (isLoading || !user) return <PageLoader />;

    const role = user.role as Role;
    const canEdit = CAN_EDIT.includes(role);
    const isStaff = IS_STAFF.includes(role);
    const totalCart = Object.values(cartMap).reduce((a, b) => a + b, 0);

    return (
        <>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform: translateY(10px); } to { opacity:1; transform: translateY(0); } }
        @keyframes toastIn { from { opacity:0; transform: translateX(100%); } to { opacity:1; transform: translateX(0); } }
        .menu-root { min-height:100vh; background:var(--bg-dark); padding: 1.25rem 1rem 3rem; }
        .menu-inner { max-width:1100px; margin:0 auto; }
        .plats-grid { display:grid; gap:0.875rem; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
        @media(min-width:640px)  { .menu-root { padding: 1.5rem 1.5rem 3rem; } }
        @media(min-width:1024px) { .menu-root { padding: 2rem 2rem 3rem; } }
        .cat-btn { 
          padding: 0.45rem 0.875rem; border-radius: 9999px; border: 1px solid var(--border-subtle);
          background: transparent; cursor: pointer; font-size: 0.78rem; font-weight: 600;
          color: var(--text-muted); transition: all 0.15s; white-space: nowrap;
        }
        .cat-btn.active { background: var(--gradient-btn); color: #0c0a09; border-color: transparent; }
        .cat-btn:not(.active):hover { border-color: var(--border-amber); color: var(--text-primary); }
        .filter-toggle { 
          padding: 0.4rem 0.75rem; border-radius: 9999px;
          border: 1px solid var(--border-subtle); background: transparent;
          cursor: pointer; font-size: 0.75rem; font-weight: 600;
          color: var(--text-muted); transition: all 0.15s;
        }
        .filter-toggle.active { border-color: var(--amber-glow); color: var(--amber-glow); background: rgba(245,158,11,0.08); }
      `}</style>

            {/* Glow fond */}
            <div style={{
                position: "fixed", top: 0, left: 0, right: 0, height: "35vh",
                pointerEvents: "none", zIndex: 0,
                background: "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(245,158,11,0.06) 0%, transparent 70%)",
            }} />

            {/* Toast */}
            {toastMsg && (
                <div style={{
                    position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200,
                    padding: "0.75rem 1.25rem",
                    borderRadius: radius.xl,
                    background: toastType === "success" ? "rgba(34,197,94,0.95)" : "rgba(239,68,68,0.95)",
                    color: "#fff", fontWeight: 600, fontSize: "0.85rem",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                    animation: "toastIn 0.3s ease",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    backdropFilter: "blur(8px)",
                }}>
                    {toastType === "success" ? "✓" : "✗"} {toastMsg}
                </div>
            )}

            <div className="menu-root">
                <div className="menu-inner" style={{ position: "relative", zIndex: 1 }}>

                    {/* ── Header ── */}
                    <div style={{
                        display: "flex", alignItems: "flex-start",
                        justifyContent: "space-between", gap: spacing["3"],
                        marginBottom: spacing["5"],
                        flexWrap: "wrap",
                    }}>
                        <div>
                            {/* Breadcrumb */}
                            <nav style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.4rem" }}>
                                <Link href="/dashboard" style={{ fontSize: typography.xs, color: cssVar.textMuted, textDecoration: "none" }}>
                                    Tableau de bord
                                </Link>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 10, height: 10, color: cssVar.textMuted }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                </svg>
                                <span style={{ fontSize: typography.xs, color: cssVar.textSecondary }}>Menu</span>
                            </nav>
                            <h1 style={{
                                margin: 0, fontSize: typography["2xl"], fontWeight: typography.bold,
                                fontFamily: typography.fontSerif, color: cssVar.textPrimary,
                            }}>
                                {isTable ? "Notre Menu" : "Gestion du Menu"}
                            </h1>
                            <p style={{ margin: "0.2rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                                {isTable
                                    ? `${plats.length} plat${plats.length > 1 ? "s" : ""} disponible${plats.length > 1 ? "s" : ""}`
                                    : `${stats.disponibles} disponibles · ${stats.indisponibles} indisponibles · ${stats.total} au total`}
                            </p>
                        </div>

                        <div style={{ display: "flex", gap: spacing["2"], alignItems: "center", flexWrap: "wrap" }}>
                            {/* Bouton panier (Table) */}
                            {isTable && totalCart > 0 && (
                                <Link href="/commandes/panier" style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                    padding: "0.55rem 1rem",
                                    borderRadius: radius.lg,
                                    background: "var(--gradient-btn)",
                                    color: "#0c0a09", fontWeight: 700,
                                    fontSize: typography.sm, textDecoration: "none",
                                    position: "relative",
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 15, height: 15 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                                    </svg>
                                    Mon panier
                                    <span style={{
                                        background: "#0c0a09", color: "var(--amber-glow)",
                                        borderRadius: "9999px", padding: "0.1rem 0.4rem",
                                        fontSize: "0.65rem", fontWeight: 800,
                                    }}>
                                        {totalCart}
                                    </span>
                                </Link>
                            )}

                            {/* Bouton ajouter plat (Staff éditeur) */}
                            {canEdit && (
                                <Link href="/menu/nouveau" style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                    padding: "0.55rem 1rem",
                                    borderRadius: radius.lg,
                                    background: "var(--gradient-btn)",
                                    color: "#0c0a09", fontWeight: 700,
                                    fontSize: typography.sm, textDecoration: "none",
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    Ajouter un plat
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* ── Stats rapides (Staff seulement) ── */}
                    {isStaff && !isTable && (
                        <div style={{
                            display: "flex", gap: "0.625rem",
                            marginBottom: spacing["5"],
                            flexWrap: "wrap",
                        }}>
                            {[
                                { label: "Total", value: stats.total, color: cssVar.amberGlow },
                                { label: "Disponibles", value: stats.disponibles, color: "#22c55e" },
                                { label: "Indisponibles", value: stats.indisponibles, color: "#ef4444" },
                                ...stats.parCategorie.filter((c) => c.count > 0).map((c) => ({
                                    label: `${c.emoji} ${c.label}`,
                                    value: c.count,
                                    color: cssVar.textMuted,
                                })),
                            ].map((s) => (
                                <div key={s.label} style={{
                                    padding: "0.45rem 0.875rem",
                                    borderRadius: radius.lg,
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border-subtle)",
                                    display: "flex", alignItems: "center", gap: "0.4rem",
                                }}>
                                    <span style={{ fontSize: typography.lg, fontWeight: 800, color: s.color }}>
                                        {s.value}
                                    </span>
                                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Filtres ── */}
                    <div style={{
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: radius.xl,
                        padding: "0.875rem",
                        marginBottom: spacing["5"],
                        display: "flex", flexDirection: "column", gap: "0.625rem",
                    }}>
                        {/* Recherche */}
                        <div style={{ position: "relative" }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{
                                position: "absolute", left: "0.75rem", top: "50%",
                                transform: "translateY(-50%)",
                                width: 15, height: 15, color: cssVar.textMuted, pointerEvents: "none",
                            }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Rechercher un plat…"
                                style={{
                                    width: "100%", padding: "0.6rem 0.875rem 0.6rem 2.25rem",
                                    borderRadius: radius.lg,
                                    border: "1px solid var(--border-subtle)",
                                    background: "var(--bg-section-alt)",
                                    color: cssVar.textPrimary,
                                    fontSize: typography.base, outline: "none",
                                    boxSizing: "border-box",
                                }}
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    style={{
                                        position: "absolute", right: "0.75rem", top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "none", border: "none", cursor: "pointer",
                                        color: cssVar.textMuted, padding: 0,
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Catégories + dispo filter */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap" }}>
                            {CATEGORIES.map((c) => (
                                <button
                                    key={c.value}
                                    onClick={() => setCategorie(c.value as typeof categorie)}
                                    className={`cat-btn${categorie === c.value ? " active" : ""}`}
                                >
                                    {c.emoji} {c.label}
                                </button>
                            ))}

                            {/* Filtre dispo (Staff seulement) */}
                            {isStaff && !isTable && (
                                <>
                                    <div style={{ width: 1, height: 20, background: "var(--border-subtle)", margin: "0 0.25rem" }} />
                                    <button
                                        onClick={() => setDisponibleFilter(disponibleFilter === true ? undefined : true)}
                                        className={`filter-toggle${disponibleFilter === true ? " active" : ""}`}
                                    >
                                        ✓ Disponibles
                                    </button>
                                    <button
                                        onClick={() => setDisponibleFilter(disponibleFilter === false ? undefined : false)}
                                        className={`filter-toggle${disponibleFilter === false ? " active" : ""}`}
                                    >
                                        ✗ Indisponibles
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ── Contenu ── */}
                    {loading ? (
                        <div style={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            minHeight: 300, gap: "0.75rem", color: cssVar.textMuted,
                        }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: "50%",
                                border: "3px solid var(--border-amber)",
                                borderTopColor: "var(--amber-glow)",
                                animation: "spin 0.75s linear infinite",
                            }} />
                            Chargement du menu…
                        </div>
                    ) : error ? (
                        <div style={{
                            textAlign: "center", padding: "3rem",
                            background: "var(--bg-card)", borderRadius: radius.xl,
                            border: "1px solid rgba(239,68,68,0.2)",
                        }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚠️</div>
                            <p style={{ color: cssVar.textSecondary, marginBottom: "1rem" }}>{error}</p>
                            <button
                                onClick={refetch}
                                style={{
                                    padding: "0.55rem 1.25rem", borderRadius: radius.lg,
                                    border: "1px solid var(--border-amber)",
                                    background: "transparent", color: "var(--amber-glow)",
                                    cursor: "pointer", fontSize: typography.sm, fontWeight: 600,
                                }}
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : plats.length === 0 ? (
                        <div style={{
                            textAlign: "center", padding: "4rem 2rem",
                            background: "var(--bg-card)", borderRadius: radius.xl,
                            border: "1px solid var(--border-subtle)",
                        }}>
                            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🍽️</div>
                            <h3 style={{ margin: "0 0 0.5rem", color: cssVar.textPrimary }}>
                                {search ? "Aucun résultat" : "Aucun plat"}
                            </h3>
                            <p style={{ margin: "0 0 1.5rem", color: cssVar.textMuted, fontSize: typography.sm }}>
                                {search
                                    ? `Aucun plat ne correspond à « ${search} »`
                                    : canEdit
                                        ? "Commencez par ajouter votre premier plat."
                                        : "Le menu est vide pour l'instant."}
                            </p>
                            {canEdit && !search && (
                                <Link href="/menu/nouveau" style={{
                                    display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                    padding: "0.65rem 1.5rem",
                                    borderRadius: radius.lg,
                                    background: "var(--gradient-btn)",
                                    color: "#0c0a09", fontWeight: 700, textDecoration: "none",
                                }}>
                                    + Ajouter le premier plat
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="plats-grid">
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
                                        onDelete={role === "Radmin" ? handleDeleteWithConfirm : undefined}
                                    />
                                ))}
                        </div>
                    )}

                    {/* Résumé résultats */}
                    {!loading && plats.length > 0 && (
                        <p style={{
                            textAlign: "center", marginTop: spacing["6"],
                            fontSize: typography.xs, color: cssVar.textMuted,
                        }}>
                            {plats.length} plat{plats.length > 1 ? "s" : ""}
                            {search ? ` pour « ${search} »` : ""}
                            {categorie ? ` dans ${CATEGORIES.find((c) => c.value === categorie)?.label}` : ""}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

function PageLoader() {
    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center",
            justifyContent: "center", background: cssVar.bgDark,
        }}>
            <div style={{
                width: 34, height: 34, borderRadius: "50%",
                border: "3px solid var(--border-amber)",
                borderTopColor: "var(--amber-glow)",
                animation: "spin .75s linear infinite",
            }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}