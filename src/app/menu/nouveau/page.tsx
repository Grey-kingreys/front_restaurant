"use client";
// src/app/menu/nouveau/page.tsx
// Création d'un nouveau plat — Chef Cuisinier, Admin, Manager

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { PlatForm } from "@/components/menu/PlatForm";
import { cssVar, typography, radius, spacing } from "@/theme/theme";
import { PlusIcon } from "@/components/icons";

export default function NouveauPlatPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("manage_menu")) {
            router.replace("/menu");
        }
    }, [isLoading, isAuthenticated, user, router, hasPermission]);

    if (isLoading || !user) return <PageLoader />;
    if (!hasPermission("manage_menu")) return null;

    return (
        <>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .nouveau-root { min-height:100vh; background:var(--bg-dark); padding: 1.25rem 1rem 3rem; }
        .nouveau-inner { max-width:720px; margin:0 auto; position:relative; z-index:1; }
        @media(min-width:640px) { .nouveau-root { padding: 1.5rem 1.5rem 3rem; } }
        @media(min-width:1024px) { .nouveau-root { padding: 2rem 2rem 3rem; } }
      `}</style>

            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "40vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(245,158,11,0.07) 0%, transparent 70%)" }} />

            <div className="nouveau-root">
                <div className="nouveau-inner">

                    {/* Breadcrumb */}
                    <nav style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginBottom: "1rem" }}>
                        <Link href="/dashboard" style={{ fontSize: typography.xs, color: cssVar.textMuted, textDecoration: "none" }}>
                            Tableau de bord
                        </Link>
                        <Chevron />
                        <Link href="/menu" style={{ fontSize: typography.xs, color: cssVar.textMuted, textDecoration: "none" }}>
                            Menu
                        </Link>
                        <Chevron />
                        <span style={{ fontSize: typography.xs, color: cssVar.textSecondary }}>Nouveau plat</span>
                    </nav>

                    {/* Header */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-amber)", borderRadius: radius["2xl"], padding: `${spacing["5"]} ${spacing["5"]}`, marginBottom: spacing["4"], boxShadow: cssVar.shadowCard }}>
                        <div style={{ display: "flex", alignItems: "center", gap: spacing["3"] }}>
                            <div style={{ width: 44, height: 44, borderRadius: radius.xl, background: "var(--icon-bg)", border: "1px solid var(--icon-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--icon-primary)", flexShrink: 0 }}>
                                <PlusIcon size={20} />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: typography.xl, fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary }}>
                                    Nouveau plat
                                </h1>
                                <p style={{ margin: "0.15rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                                    Ajoutez un plat au menu de votre restaurant
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: spacing["5"] }}>
                        <PlatForm />
                    </div>

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