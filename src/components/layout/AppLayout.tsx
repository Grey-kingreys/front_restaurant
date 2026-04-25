"use client";
// src/components/layout/AppLayout.tsx

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar, { SIDEBAR_W } from "./Sidebar";

// Routes qui affichent la sidebar (préfixes)
const PRIVATE_PREFIXES = [
    "/dashboard",
    "/profil",
    "/auth/change-password",
    "/restaur",   // /restaurant/*
    "/menu",
    "/commandes",
    "/paiements",
    "/caisse",
    "/equipe",
    "/tables",
    "/rapports",
    "/parametres",
];

function isPrivateRoute(pathname: string): boolean {
    return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export default function AppLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Loader global — uniquement pendant la vérification initiale du token
    if (isLoading) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center",
                justifyContent: "center", background: "var(--bg-dark)",
            }}>
                <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    border: "3px solid var(--border-amber)",
                    borderTopColor: "var(--amber-glow)",
                    animation: "spin 0.75s linear infinite",
                }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    // Afficher la sidebar uniquement si :
    // 1. l'utilisateur est connecté ET
    // 2. la route courante est une route privée
    const showSidebar = isAuthenticated && isPrivateRoute(pathname);

    if (!showSidebar) {
        // Pages publiques (landing, login, reset-password…) → pas de sidebar
        return <>{children}</>;
    }

    // Pages privées → layout avec sidebar à gauche
    return (
        <>
            <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

            {/* Bouton hamburger — mobile/tablette uniquement */}
            <button
                onClick={() => setMobileOpen(true)}
                className="rp-hamburger"
                aria-label="Ouvrir le menu"
                style={{
                    position: "fixed", top: "0.875rem", left: "0.875rem", zIndex: 45,
                    width: 40, height: 40, borderRadius: "0.65rem",
                    background: "var(--bg-card)", border: "1px solid var(--border-amber)",
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--amber-glow)", boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
                }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>

            {/* Contenu principal décalé sur desktop */}
            <main className="rp-main" style={{ minHeight: "100vh", background: "var(--bg-dark)" }}>
                {children}
            </main>

            <style>{`
        @media (min-width: 1024px) {
          .rp-main      { margin-left: ${SIDEBAR_W}; }
          .rp-hamburger { display: none !important; }
        }
        @media (max-width: 1023px) {
          .rp-main      { margin-left: 0; }
          .rp-hamburger { display: flex !important; }
        }
      `}</style>
        </>
    );
}