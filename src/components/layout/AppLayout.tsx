"use client";
// src/components/layout/AppLayout.tsx

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar, { SIDEBAR_W } from "./Sidebar";
import ThemeSwitcher from "../ui/ThemeSwitcher";
import { Menu } from "lucide-react";

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

export const SIDEBAR_EXPANDED_W = "15rem";
export const SIDEBAR_COLLAPSED_W = "4.5rem";

export default function AppLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

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
            <Sidebar 
                mobileOpen={mobileOpen} 
                onMobileClose={() => setMobileOpen(false)} 
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Header Mobile — hamburger + theme switcher */}
            <div className="rp-mobile-header" style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 45,
                height: "3.5rem", display: "flex", alignItems: "center",
                padding: "0 0.75rem", background: "var(--bg-card)",
                borderBottom: "1px solid var(--border-subtle)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}>

                <button
                    onClick={() => setMobileOpen(true)}
                    aria-label="Ouvrir le menu"
                    style={{
                        width: 40, height: 40, borderRadius: "0.65rem",
                        background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--amber-glow)",
                    }}
                >
                    <Menu size={18} />
                </button>

                <div style={{ marginLeft: "auto" }}>
                    <ThemeSwitcher variant="navbar" />
                </div>
            </div>

            {/* Contenu principal décalé sur desktop */}
            <main className="rp-main" style={{ 
                minHeight: "100vh", 
                background: "var(--bg-dark)",
                transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
            }}>
                {children}
            </main>

            <style>{`
        @media (min-width: 1024px) {
          .rp-main      { margin-left: ${isCollapsed ? SIDEBAR_COLLAPSED_W : SIDEBAR_EXPANDED_W}; }
          .rp-mobile-header { display: none !important; }
        }
        @media (max-width: 1023px) {
          .rp-main      { margin-left: 0; padding-top: 3.5rem; }
          .rp-mobile-header { display: flex !important; }
        }
      `}</style>
        </>
    );
}