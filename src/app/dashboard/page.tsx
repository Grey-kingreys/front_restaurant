"use client";
// src/app/dashboard/page.tsx

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROLE_COLORS, NAV_CONFIG } from "@/lib/navigation";
import type { Role } from "@/types";

const WELCOME: Record<Role, { subtitle: string }> = {
    Rsuper_admin: { subtitle: "Gérez tous les restaurants et consultez les statistiques globales." },
    Radmin: { subtitle: "Gérez votre équipe, votre menu et vos finances." },
    Rmanager: { subtitle: "Supervisez les opérations et les performances." },
    Rserveur: { subtitle: "Consultez vos tables et validez les paiements." },
    Rchef_cuisinier: { subtitle: "Gérez le menu et la file des commandes." },
    Rcuisinier: { subtitle: "Consultez la file et marquez les plats comme prêts." },
    Rcomptable: { subtitle: "Gérez votre caisse et suivez les dépenses." },
    Rtable: { subtitle: "Consultez le menu et suivez votre commande." },
};

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user?.must_change_password) router.replace("/auth/change-password");
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !user) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    const role = user.role as Role;
    const roleColor = ROLE_COLORS[role];
    const roleLabel = ROLE_LABELS[role];
    const sections = NAV_CONFIG[role];
    const subtitle = WELCOME[role].subtitle;

    const initials = user.nom_complet
        ? user.nom_complet.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : user.login.slice(0, 2).toUpperCase();

    const firstName = user.nom_complet?.split(" ")[0] || user.login;

    return (
        <>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .dash-root {
          min-height: 100vh;
          background: var(--bg-dark);
          padding: 1.25rem 1rem 2.5rem;
        }
        .dash-inner {
          max-width: 860px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Hero card ── */
        .dash-hero {
          background: var(--bg-card);
          border: 1px solid var(--border-amber);
          border-radius: 1rem;
          padding: 1.125rem 1.25rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.875rem;
          box-shadow: var(--shadow-card);
        }
        .dash-avatar {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.875rem; color: #0c0a09;
          flex-shrink: 0;
        }
        .dash-hero-body { flex: 1; min-width: 0; }
        .dash-greeting {
          font-weight: 700;
          font-size: 1rem;
          color: var(--text-primary);
          font-family: var(--font-playfair), serif;
          margin: 0 0 0.2rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .dash-subtitle {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .dash-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.15rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.65rem;
          font-weight: 700;
          margin-top: 0.3rem;
        }
        .dash-profil-btn {
          padding: 0.4rem 0.75rem;
          border-radius: 0.55rem;
          border: 1px solid var(--border-amber-hover);
          color: var(--amber-glow);
          font-size: 0.72rem;
          font-weight: 600;
          text-decoration: none;
          flex-shrink: 0;
          white-space: nowrap;
          transition: all 0.2s;
        }

        /* ── Grille sections ── */
        .dash-grid {
          display: grid;
          gap: 0.75rem;
          grid-template-columns: 1fr;
        }
        .dash-section-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 0.875rem;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .dash-section-card:hover { border-color: var(--border-amber); }
        .dash-section-head {
          padding: 0.6rem 0.875rem;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--bg-section-alt);
        }
        .dash-section-title {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin: 0;
        }
        .dash-items { padding: 0.4rem 0.5rem; }
        .dash-item {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.45rem 0.5rem;
          border-radius: 0.45rem;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.15s;
        }
        .dash-item:hover {
          background: var(--icon-bg);
          color: var(--amber-glow);
        }
        .dash-item-icon {
          width: 26px; height: 26px;
          border-radius: 0.35rem;
          background: var(--icon-bg);
          border: 1px solid var(--icon-border);
          display: flex; align-items: center; justify-content: center;
          color: var(--icon-primary);
          flex-shrink: 0;
        }

        .dash-footer {
          text-align: center;
          margin-top: 1.75rem;
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        /* ── Tablette ≥ 640px ── */
        @media (min-width: 640px) {
          .dash-root { padding: 1.5rem 1.5rem 3rem; }
          .dash-hero { padding: 1.25rem 1.5rem; gap: 1rem; border-radius: 1.125rem; }
          .dash-avatar { width: 52px; height: 52px; font-size: 1rem; }
          .dash-greeting { font-size: 1.1rem; }
          .dash-subtitle { font-size: 0.8rem; }
          .dash-profil-btn { font-size: 0.78rem; padding: 0.45rem 0.875rem; }
          .dash-grid { grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
          .dash-item { font-size: 0.84rem; }
        }

        /* ── Desktop ≥ 1024px ── */
        @media (min-width: 1024px) {
          .dash-root { padding: 2rem 2rem 3rem; }
          .dash-hero { padding: 1.5rem 1.75rem; border-radius: 1.25rem; margin-bottom: 1.25rem; }
          .dash-avatar { width: 60px; height: 60px; font-size: 1.2rem; }
          .dash-greeting { font-size: 1.25rem; white-space: normal; }
          .dash-subtitle { font-size: 0.875rem; -webkit-line-clamp: unset; overflow: visible; }
          .dash-role-badge { font-size: 0.7rem; }
          .dash-profil-btn { font-size: 0.82rem; padding: 0.5rem 1rem; }
          .dash-grid { grid-template-columns: repeat(3, 1fr); gap: 1rem; }
          .dash-section-head { padding: 0.7rem 1rem; }
          .dash-items { padding: 0.5rem 0.625rem; }
          .dash-item { font-size: 0.85rem; gap: 0.6rem; padding: 0.5rem 0.6rem; }
          .dash-item-icon { width: 28px; height: 28px; }
          .dash-footer { font-size: 0.75rem; }
        }
      `}</style>

            {/* Glow fond */}
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "40vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(245,158,11,0.07) 0%, transparent 70%)" }} />

            <div className="dash-root">
                <div className="dash-inner">

                    {/* Hero */}
                    <div className="dash-hero">
                        <div className="dash-avatar">{initials}</div>

                        <div className="dash-hero-body">
                            <h1 className="dash-greeting">Bonjour, {firstName} !</h1>
                            <p className="dash-subtitle">{subtitle}</p>
                            <div>
                                <span className="dash-role-badge" style={{ background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}` }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: roleColor.text, display: "inline-block", flexShrink: 0 }} />
                                    {roleLabel}
                                </span>
                                {user.restaurant_nom && (
                                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                                        📍 {user.restaurant_nom}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link href="/profil" className="dash-profil-btn">Mon profil</Link>
                    </div>

                    {/* Grille accès rapide */}
                    <div className="dash-grid">
                        {sections.map((section, si) => (
                            <div key={si} className="dash-section-card">
                                {section.title && (
                                    <div className="dash-section-head">
                                        <p className="dash-section-title">{section.title}</p>
                                    </div>
                                )}
                                <div className="dash-items">
                                    {section.items.map((item) => (
                                        <Link key={item.label} href={item.href} className="dash-item">
                                            <span className="dash-item-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 13, height: 13 }}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                                </svg>
                                            </span>
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="dash-footer">
                        RestoPro · {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                    </p>
                </div>
            </div>
        </>
    );
}