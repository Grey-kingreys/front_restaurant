"use client";
// src/app/dashboard/page.tsx

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROLE_COLORS, NAV_CONFIG } from "@/lib/navigation";
import type { Role } from "@/types";
import { cssVar, typography, radius, spacing, roleBadge, avatarBase, btnOutline } from "@/theme/theme";

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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: cssVar.bgDark }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${cssVar.borderAmber}`, borderTopColor: cssVar.amberGlow, animation: "spin .75s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const role = user.role as Role;
  const rc = ROLE_COLORS[role];
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
        .dash-root  { min-height:100vh; background:var(--bg-dark); padding:1.25rem 1rem 2.5rem; }
        .dash-inner { max-width:860px; margin:0 auto; position:relative; z-index:1; }

        /* Hero */
        .dash-hero  { background:var(--bg-card); border:1px solid var(--border-amber); border-radius:1rem; padding:1.125rem 1.25rem; margin-bottom:1rem; display:flex; align-items:center; gap:0.875rem; box-shadow:var(--shadow-card); }

        /* Grille sections */
        .dash-grid  { display:grid; gap:0.75rem; grid-template-columns:1fr; }
        .dash-sec   { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:0.875rem; overflow:hidden; transition:border-color 0.2s; }
        .dash-sec:hover { border-color:var(--border-amber); }
        .dash-sec-head { padding:0.6rem 0.875rem; border-bottom:1px solid var(--border-subtle); background:var(--bg-section-alt); }
        .dash-items { padding:0.4rem 0.5rem; }
        .dash-item  { display:flex; align-items:center; gap:0.55rem; padding:0.45rem 0.5rem; border-radius:0.45rem; font-size:0.82rem; font-weight:500; color:var(--text-secondary); text-decoration:none; transition:all 0.15s; }
        .dash-item:hover { background:var(--icon-bg); color:var(--amber-glow); }
        .dash-item-icon { width:26px; height:26px; border-radius:0.35rem; background:var(--icon-bg); border:1px solid var(--icon-border); display:flex; align-items:center; justify-content:center; color:var(--icon-primary); flex-shrink:0; }

        .dash-footer { text-align:center; margin-top:1.75rem; font-size:0.7rem; color:var(--text-muted); }

        @media(min-width:640px) {
          .dash-root  { padding:1.5rem 1.5rem 3rem; }
          .dash-hero  { padding:1.25rem 1.5rem; gap:1rem; border-radius:1.125rem; }
          .dash-grid  { grid-template-columns:repeat(2,1fr); gap:0.875rem; }
        }
        @media(min-width:1024px) {
          .dash-root  { padding:2rem 2rem 3rem; }
          .dash-hero  { padding:1.5rem 1.75rem; border-radius:1.25rem; margin-bottom:1.25rem; }
          .dash-grid  { grid-template-columns:repeat(3,1fr); gap:1rem; }
        }
      `}</style>

      {/* Glow fond */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "40vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(245,158,11,0.07) 0%, transparent 70%)" }} />

      <div className="dash-root">
        <div className="dash-inner">

          {/* Hero */}
          <div className="dash-hero">
            <div style={avatarBase(44)}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontWeight: typography.bold, fontSize: typography.lg, color: cssVar.textPrimary, fontFamily: typography.fontSerif, margin: `0 0 ${spacing["1"]}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Bonjour, {firstName} !
              </h1>
              <p style={{ fontSize: typography.xs, color: cssVar.textMuted, margin: 0, lineHeight: 1.4 }}>{subtitle}</p>
              <div style={{ marginTop: spacing["1"] }}>
                <span style={roleBadge(rc.bg, rc.text, rc.border)}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: rc.text, display: "inline-block" }} />
                  {ROLE_LABELS[role]}
                </span>
                {user.restaurant_nom && (
                  <span style={{ fontSize: typography.xs, color: cssVar.textMuted, marginLeft: spacing["2"] }}>
                    📍 {user.restaurant_nom}
                  </span>
                )}
              </div>
            </div>
            <Link href="/profil" style={btnOutline}>Mon profil</Link>
          </div>

          {/* Grille accès rapide */}
          <div className="dash-grid">
            {sections.map((section, si) => (
              <div key={si} className="dash-sec">
                {section.title && (
                  <div className="dash-sec-head">
                    <p style={{ fontSize: typography.xs, fontWeight: typography.bold, letterSpacing: "0.1em", textTransform: "uppercase", color: cssVar.textMuted, margin: 0 }}>
                      {section.title}
                    </p>
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