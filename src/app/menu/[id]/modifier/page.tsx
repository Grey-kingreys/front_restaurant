"use client";
// src/app/menu/[id]/modifier/page.tsx
// Modification d'un plat existant — Chef Cuisinier, Admin, Manager

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getPlat } from "@/lib/api/menu";
import { PlatForm } from "@/components/menu/PlatForm";
import type { Plat } from "@/lib/api/menu";
import { cssVar, typography, radius, spacing } from "@/theme/theme";
import { PencilSquareIcon, ArrowPathIcon } from "@/components/icons";

export default function ModifierPlatPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();
    const params = useParams();
    const platId = Number(params.id);

    const [plat, setPlat] = useState<Plat | null>(null);
    const [fetching, setFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("manage_menu")) router.replace("/menu");
    }, [isLoading, isAuthenticated, user, router, hasPermission]);

    useEffect(() => {
        if (!isAuthenticated || !platId) return;
        setFetching(true);
        getPlat(platId)
            .then((res) => {
                if (res.success && res.data) setPlat(res.data);
                else setFetchError("Plat introuvable.");
            })
            .catch(() => setFetchError("Erreur de connexion."))
            .finally(() => setFetching(false));
    }, [isAuthenticated, platId]);

    if (isLoading || fetching) return <PageLoader />;
    if (!user || !hasPermission("manage_menu")) return null;

    return (
        <>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .modifier-root { min-height:100vh; background:var(--bg-dark); padding: 1.25rem 1rem 3rem; }
        .modifier-inner { max-width:720px; margin:0 auto; position:relative; z-index:1; }
        @media(min-width:640px) { .modifier-root { padding: 1.5rem 1.5rem 3rem; } }
        @media(min-width:1024px) { .modifier-root { padding: 2rem 2rem 3rem; } }
      `}</style>

            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "40vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(245,158,11,0.07) 0%, transparent 70%)" }} />

            <div className="modifier-root">
                <div className="modifier-inner">

                    {/* Breadcrumb */}
                    <nav style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                        <Link href="/dashboard" style={{ fontSize: typography.xs, color: cssVar.textMuted, textDecoration: "none" }}>Tableau de bord</Link>
                        <Chevron />
                        <Link href="/menu" style={{ fontSize: typography.xs, color: cssVar.textMuted, textDecoration: "none" }}>Menu</Link>
                        <Chevron />
                        <span style={{ fontSize: typography.xs, color: cssVar.textSecondary }}>
                            {plat ? `Modifier « ${plat.nom} »` : "Modifier le plat"}
                        </span>
                    </nav>

                    {/* Header */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-amber)", borderRadius: radius["2xl"], padding: `${spacing["5"]} ${spacing["5"]}`, marginBottom: spacing["4"], boxShadow: cssVar.shadowCard }}>
                        <div style={{ display: "flex", alignItems: "center", gap: spacing["3"] }}>
                            <div style={{ width: 44, height: 44, borderRadius: radius.xl, background: "var(--icon-bg)", border: "1px solid var(--icon-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--icon-primary)", flexShrink: 0 }}>
                                <PencilSquareIcon size={20} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h1 style={{ margin: 0, fontSize: typography.xl, fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {plat ? `Modifier « ${plat.nom} »` : "Modifier le plat"}
                                </h1>
                                <p style={{ margin: "0.15rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                                    Mettez à jour les informations de ce plat
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contenu */}
                    {fetchError ? (
                        <div style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: radius.xl, padding: "3rem", textAlign: "center" }}>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>{fetchError}</p>
                            <button
                                onClick={() => { setFetchError(null); setFetching(true); getPlat(platId).then((res) => { if (res.success && res.data) setPlat(res.data); else setFetchError("Plat introuvable."); }).catch(() => setFetchError("Erreur.")).finally(() => setFetching(false)); }}
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.25rem", borderRadius: radius.lg, border: "1px solid var(--border-amber)", background: "transparent", color: "var(--amber-glow)", cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}
                            >
                                <ArrowPathIcon size={14} />
                                Réessayer
                            </button>
                        </div>
                    ) : (
                        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: spacing["5"] }}>
                            {plat && <PlatForm plat={plat} />}
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

function Chevron() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width={10} height={10} style={{ color: "var(--text-muted)" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
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