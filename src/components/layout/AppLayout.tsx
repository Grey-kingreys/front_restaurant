"use client";
// src/components/layout/AppLayout.tsx

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import ImpersonationBanner, { BANNER_H } from "./ImpersonationBanner";
import ThemeSwitcher from "../ui/ThemeSwitcher";
import { Menu } from "lucide-react";
import { useTableGeoCheck } from "@/hooks/useTableGeoCheck";
import { useTableDistanceCheck } from "@/hooks/useTableDistanceCheck";
import { hasQrTableSession } from "@/lib/api/client";
import { SessionCountdown } from "@/components/table/SessionCountdown";

// Routes qui affichent la sidebar (préfixes)
const PRIVATE_PREFIXES = [
    "/dashboard",
    "/client",            // espace client (sidebar)
    "/profil",
    "/auth/change-password",
    "/restaurants",       // liste restaurants (super admin)
    "/restaurant/",       // flux commande client (menu/checkout/confirmation) + paramètres restaurant
    "/menu",
    "/commandes",
    "/livraisons",        // espace livreur / staff (la page publique /livraison/<token> reste sans sidebar)
    "/paiements",
    "/caisse",
    "/caisse-generale",
    "/equipe",
    "/tables",
    "/remises",
    "/reservations",
    "/statistiques",
    "/rapports",
    "/parametres",
    "/roles",
];
// NB : le flux /restaurant/<slug> affiche la sidebar pour un utilisateur connecté ;
// un visiteur anonyme garde le header public sans sidebar (showSidebar exige isAuthenticated).

function isPrivateRoute(pathname: string): boolean {
    return PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export const SIDEBAR_EXPANDED_W = "15rem";
export const SIDEBAR_COLLAPSED_W = "4.5rem";

type CountdownReason = "all_paid" | "expired" | null;

export default function AppLayout({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading, isImpersonating, user, logout } = useAuth();
    const topOffset = isImpersonating ? BANNER_H : "0px";
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [outOfRangeWarning, setOutOfRangeWarning] = useState<string | null>(null);
    const [countdownReason, setCountdownReason] = useState<CountdownReason>(null);

    const isRtable = isAuthenticated && user?.role === "Rtable";
    // GPS, expiration et déconnexion post-paiement ne concernent QUE les sessions QR.
    // Une table connectée en login+password est une session « classique » sans ces contraintes.
    const isQrTableSession = isRtable && hasQrTableSession();

    useTableGeoCheck(isQrTableSession, {
        onOutOfRange: (_strikes, message) => setOutOfRangeWarning(message),
        onDisconnect: () => logout(),
        onAllPaid: () => setCountdownReason("all_paid"),
        onExpiredWarn: () => setOutOfRangeWarning("Votre session a expiré, mais vos commandes sont en cours. Vous serez déconnecté après le paiement."),
    });

    // Table login+password : on applique UNIQUEMENT la restriction de distance
    // (pas d'expiration de session ni de déconnexion post-paiement — celles-ci
    // restent réservées aux sessions QR).
    const isManualTable = isRtable && !hasQrTableSession();
    useTableDistanceCheck(isManualTable, {
        onOutOfRange: (_strikes, message) => setOutOfRangeWarning(message),
        onDisconnect: () => logout(),
    });

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
            {/* Bannière GPS hors zone (Rtable) */}
            {outOfRangeWarning && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 9998,
                    background: "rgba(239,68,68,0.95)", color: "#fff",
                    padding: "0.6rem 1rem", textAlign: "center",
                    fontSize: "0.82rem", fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                }}>
                    <span>⚠️ {outOfRangeWarning}</span>
                    <button onClick={() => setOutOfRangeWarning(null)} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1rem", lineHeight: 1, marginLeft: "0.5rem" }}>✕</button>
                </div>
            )}

            {/* Compte à rebours post-paiement ou session expirée (Rtable) */}
            {countdownReason && (
                <SessionCountdown
                    reason={countdownReason}
                    onLogout={() => { setCountdownReason(null); logout(); }}
                />
            )}

            <ImpersonationBanner />
            <Sidebar
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
                isCollapsed={isCollapsed}
                toggleCollapse={() => setIsCollapsed(!isCollapsed)}
                topOffset={topOffset}
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
                paddingTop: topOffset,
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
          .rp-main      { margin-left: 0; padding-top: calc(3.5rem + ${topOffset}); }
          .rp-mobile-header { display: flex !important; top: ${topOffset}; }
        }
      `}</style>
        </>
    );
}