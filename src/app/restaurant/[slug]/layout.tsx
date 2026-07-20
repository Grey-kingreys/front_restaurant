"use client";
// Layout public restaurant — pas de sidebar, header client avec panier

import { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, ChefHat, User } from "lucide-react";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

function PublicHeader({ slug, inApp }: { slug: string; inApp: boolean }) {
    const { count, restaurantNom } = useCart();
    const { user, isAuthenticated } = useAuth();
    const router = useRouter();
    const isClient = isAuthenticated && user?.role === "Rclient";

    return (
        <>
        {/* En mode connecté, l'app affiche un header mobile (hamburger) : on décale le header restaurant en dessous */}
        {inApp && <style>{`@media (max-width:1023px){.rp-resto-hdr{top:3.5rem !important;}}`}</style>}
        <header className="rp-resto-hdr" style={{
            position: "sticky", top: 0, zIndex: inApp ? 40 : 100,
            background: "var(--bg-card)", backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--border-subtle)",
            padding: "0 1.25rem", height: "3.75rem",
            display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
            {/* Logo */}
            <button onClick={() => router.push(`/restaurant/${slug}`)} style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "none", border: "none", cursor: "pointer" }}>
                <div style={{ width: 32, height: 32, borderRadius: "0.5rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b" }}>
                    <ChefHat size={16} />
                </div>
                <span style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text-primary)" }}>{restaurantNom || "Menu"}</span>
            </button>

            {/* Actions */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* Connexion — uniquement pour un visiteur anonyme (le client connecté a la sidebar) */}
                {!isClient && (
                    <button onClick={() => router.push(`/auth/login?next=/restaurant/${slug}`)} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.4rem 0.875rem", borderRadius: "0.5rem", border: "1px solid var(--border-subtle)", background: "none", color: "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                        <User size={14} />
                        Connexion
                    </button>
                )}

                {/* Panier */}
                <button
                    onClick={() => router.push(`/restaurant/${slug}/checkout`)}
                    style={{
                        position: "relative", display: "flex", alignItems: "center", gap: "0.4rem",
                        padding: "0.5rem 1rem", borderRadius: "0.65rem",
                        background: count > 0 ? "linear-gradient(135deg,#f59e0b,#d97706)" : "var(--bg-section-alt)",
                        border: count > 0 ? "none" : "1px solid var(--border-subtle)",
                        color: count > 0 ? "#0c0a09" : "var(--text-muted)",
                        fontWeight: 700, fontSize: "0.85rem", cursor: "pointer",
                        transition: "all 0.2s",
                    }}
                >
                    <ShoppingCart size={16} />
                    {count > 0 && <span>{count}</span>}
                </button>
            </div>
        </header>
        </>
    );
}

function RestaurantContent({ slug, children }: { slug: string; children: ReactNode }) {
    const { user, isAuthenticated } = useAuth();
    const isClient = isAuthenticated && user?.role === "Rclient";

    // Client connecté → header allégé (nom + panier) ; la sidebar fournit la navigation.
    // Visiteur anonyme → header public immersif avec connexion + panier.
    if (isClient) {
        return (
            <>
                <PublicHeader slug={slug} inApp />
                <main>{children}</main>
            </>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-dark)" }}>
            <PublicHeader slug={slug} inApp={false} />
            <main>{children}</main>
        </div>
    );
}

export default function RestaurantPublicLayout({ children }: { children: ReactNode }) {
    const params = useParams();
    const slug = params?.slug as string ?? "";

    return (
        <CartProvider slug={slug} restaurantNom="">
            <RestaurantContent slug={slug}>{children}</RestaurantContent>
        </CartProvider>
    );
}
