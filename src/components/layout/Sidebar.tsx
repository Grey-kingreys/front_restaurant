"use client";
// src/components/layout/Sidebar.tsx
// Desktop : fixe à gauche, toujours visible — pas de bouton
// Mobile/tablette (<1024px) : drawer depuis la gauche, toggle via bouton hamburger

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_CONFIG, ROLE_LABELS, ROLE_COLORS } from "@/lib/navigation";
import type { Role } from "@/types";

// ── Icônes ─────────────────────────────────────────────────────────────────

function Icon({ name }: { name: string }) {
    const map: Record<string, React.ReactNode> = {
        dashboard: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" /></svg>,
        chart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" /></svg>,
        building: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
        users: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>,
        qr: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5ZM13.5 14.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125v-2.25Z" /></svg>,
        menu: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg>,
        orders: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" /></svg>,
        cash: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>,
        report: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>,
        export: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
        settings: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>,
        cart: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" /></svg>,
        plus: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
        profile: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
        key: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" /></svg>,
        logout: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>,
    };
    return (
        <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {map[name] ?? map.dashboard}
        </span>
    );
}

// ── Contenu interne ────────────────────────────────────────────────────────

function SidebarInner({ onNavClick }: { onNavClick?: () => void }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [loggingOut, setLoggingOut] = useState(false);

    if (!user) return null;

    const role = user.role as Role;
    const sections = NAV_CONFIG[role] ?? [];
    const roleLabel = ROLE_LABELS[role];
    const roleColor = ROLE_COLORS[role];

    const initials = user.nom_complet
        ? user.nom_complet.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : user.login.slice(0, 2).toUpperCase();

    const isActive = (href: string) => href !== "#" && pathname === href;

    const navLink = (href: string, icon: string, label: string) => {
        const active = isActive(href);
        return (
            <Link key={label} href={href} onClick={onNavClick} style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.48rem 0.6rem", borderRadius: "0.5rem",
                fontSize: "0.83rem", fontWeight: active ? 600 : 500,
                color: active ? "var(--amber-glow)" : "var(--text-secondary)",
                textDecoration: "none",
                background: active ? "rgba(245,158,11,0.08)" : "transparent",
                borderLeft: `2px solid ${active ? "var(--amber-glow)" : "transparent"}`,
                transition: "all 0.15s ease",
            }}
                onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "var(--bg-section-alt)"; el.style.color = "var(--text-primary)"; } }}
                onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.color = "var(--text-secondary)"; } }}
            >
                <span style={{ color: active ? "var(--amber-glow)" : "var(--text-muted)", opacity: active ? 1 : 0.7 }}>
                    <Icon name={icon} />
                </span>
                <span style={{ flex: 1 }}>{label}</span>
            </Link>
        );
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            {/* Logo */}
            <div style={{ padding: "1.2rem 1rem 0.9rem", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                <Link href="/dashboard" onClick={onNavClick} style={{ display: "flex", alignItems: "center", gap: "0.55rem", textDecoration: "none" }}>
                    <div style={{
                        width: 32, height: 32, borderRadius: "0.55rem",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: "0.95rem", color: "#0c0a09",
                        fontFamily: "var(--font-playfair), serif", flexShrink: 0,
                    }}>R</div>
                    <span style={{ fontWeight: 700, fontSize: "1rem", fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}>
                        Resto<span style={{ background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</span>
                    </span>
                </Link>
            </div>

            {/* Utilisateur */}
            <div style={{ padding: "0.8rem 0.875rem", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
                <Link href="/profil" onClick={onNavClick} style={{
                    display: "flex", alignItems: "center", gap: "0.6rem",
                    padding: "0.55rem 0.65rem", borderRadius: "0.65rem",
                    background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)",
                    textDecoration: "none", transition: "border-color 0.2s",
                }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-amber-hover)"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border-subtle)"}
                >
                    <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: "0.75rem", color: "#0c0a09", flexShrink: 0,
                    }}>{initials}</div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: "0.8rem", color: "var(--text-primary)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {user.nom_complet || user.login}
                        </p>
                        {user.restaurant_nom && (
                            <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: "1px 0 0" }}>{user.restaurant_nom}</p>
                        )}
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 12, height: 12, color: "var(--text-muted)", flexShrink: 0 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                </Link>
                <div style={{ marginTop: "0.4rem", paddingLeft: "0.2rem" }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: "0.3rem",
                        padding: "0.15rem 0.5rem", borderRadius: "9999px",
                        fontSize: "0.65rem", fontWeight: 700,
                        background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}`,
                    }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: roleColor.text }} />
                        {roleLabel}
                    </span>
                </div>
            </div>

            {/* Nav principale */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "0.65rem 0.75rem 0.5rem" }}>
                {sections.map((section, si) => (
                    <div key={si} style={{ marginBottom: "1.1rem" }}>
                        {section.title && (
                            <p style={{
                                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em",
                                textTransform: "uppercase", color: "var(--text-muted)",
                                padding: "0 0.35rem", marginBottom: "0.3rem",
                            }}>{section.title}</p>
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            {section.items.map((item) => navLink(item.href, item.icon, item.label))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div style={{
                padding: "0.65rem 0.75rem",
                borderTop: "1px solid var(--border-subtle)",
                display: "flex", flexDirection: "column", gap: "1px",
                flexShrink: 0,
            }}>
                {navLink("/profil", "profile", "Mon profil")}
                {navLink("/auth/change-password", "key", "Changer le mot de passe")}
                <button onClick={async () => { setLoggingOut(true); await logout(); }}
                    disabled={loggingOut}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.6rem",
                        padding: "0.48rem 0.6rem", borderRadius: "0.5rem",
                        fontSize: "0.83rem", fontWeight: 500,
                        color: loggingOut ? "var(--text-muted)" : "#f87171",
                        background: "transparent", border: "none",
                        cursor: loggingOut ? "not-allowed" : "pointer",
                        width: "100%", textAlign: "left", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => { if (!loggingOut) (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.07)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                    <Icon name="logout" />
                    {loggingOut ? "Déconnexion…" : "Se déconnecter"}
                </button>
            </div>
        </div>
    );
}

// ── Export public ──────────────────────────────────────────────────────────

export const SIDEBAR_W = "15rem";

interface SidebarProps {
    mobileOpen: boolean;
    onMobileClose: () => void;
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
    const base: React.CSSProperties = {
        width: SIDEBAR_W,
        background: "var(--bg-card)",
        borderRight: "1px solid var(--border-amber)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    };

    return (
        <>
            {/* Desktop — toujours visible, pas de bouton toggle */}
            <aside style={{ ...base, position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 40 }}
                className="rp-sidebar-desktop">
                <SidebarInner />
            </aside>

            {/* Mobile/tablette — overlay + drawer depuis la gauche */}
            <div className="rp-sidebar-mobile">
                {mobileOpen && (
                    <div onClick={onMobileClose} style={{
                        position: "fixed", inset: 0, zIndex: 49,
                        background: "rgba(0,0,0,0.52)", backdropFilter: "blur(4px)",
                    }} />
                )}
                <aside style={{
                    ...base,
                    position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
                    transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.27s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: mobileOpen ? "8px 0 32px rgba(0,0,0,0.22)" : "none",
                }}>
                    {/* Croix fermer */}
                    <button onClick={onMobileClose} style={{
                        position: "absolute", top: "0.7rem", right: "0.7rem", zIndex: 1,
                        width: 28, height: 28, borderRadius: "0.45rem",
                        background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--text-muted)",
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <SidebarInner onNavClick={onMobileClose} />
                </aside>
            </div>

            <style>{`
        .rp-sidebar-desktop { display: flex !important; }
        .rp-sidebar-mobile  { display: none !important; }
        @media (max-width: 1023px) {
          .rp-sidebar-desktop { display: none !important; }
          .rp-sidebar-mobile  { display: block !important; }
        }
      `}</style>
        </>
    );
}