"use client";
// src/components/layout/Sidebar.tsx

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getNavSections, ROLE_LABELS, ROLE_COLORS } from "@/lib/navigation";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import Logo from "@/components/ui/Logo";
import type { Role } from "@/types";
import { cssVar, typography, radius, spacing, roleBadge, avatarBase } from "@/theme/theme";

import {
    LayoutDashboard,
    BarChart3,
    Building2,
    Users,
    QrCode,
    Menu,
    ClipboardList,
    Banknote,
    Download,
    Settings,
    ShoppingCart,
    Plus,
    CalendarDays,
    User,
    Key,
    LogOut,
    ChevronRight,
    X,
    ShieldCheck,
    GitBranch,
    Truck,
} from "lucide-react";

// ── Icônes ─────────────────────────────────────────────────────────────────

function Icon({ name }: { name: string }) {
    const map: Record<string, React.ReactNode> = {
        dashboard: <LayoutDashboard size={16} />,
        chart: <BarChart3 size={16} />,
        building: <Building2 size={16} />,
        users: <Users size={16} />,
        qr: <QrCode size={16} />,
        menu: <Menu size={16} />,
        orders: <ClipboardList size={16} />,
        truck: <Truck size={16} />,
        cash: <Banknote size={16} />,
        report: <BarChart3 size={16} />,
        export: <Download size={16} />,
        settings: <Settings size={16} />,
        cart: <ShoppingCart size={16} />,
        plus: <Plus size={16} />,
        calendar: <CalendarDays size={16} />,
        shield: <ShieldCheck size={16} />,
        workflow: <GitBranch size={16} />,
        profile: <User size={16} />,
        key: <Key size={16} />,
        logout: <LogOut size={16} />,
    };
    return (
        <span style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {map[name] ?? map.dashboard}
        </span>
    );
}

// ── Contenu interne ────────────────────────────────────────────────────────

function SidebarInner({ 
    onNavClick, 
    isCollapsed = false,
    toggleCollapse 
}: { 
    onNavClick?: () => void;
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
}) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [loggingOut, setLoggingOut] = useState(false);

    if (!user) return null;

    const role = user.role as Role;
    const sections = getNavSections(user);
    const rc = ROLE_COLORS[role];
    const homeHref = "/";

    const initials = user.nom_complet
        ? user.nom_complet.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : user.login.slice(0, 2).toUpperCase();

    const isActive = (href: string) => href !== "#" && pathname === href;

    const navLink = (href: string, icon: string, label: string) => {
        const active = isActive(href);
        return (
            <Link key={label} href={href} onClick={onNavClick} style={{
                display: "flex", alignItems: "center", gap: isCollapsed ? 0 : spacing["2"],
                justifyContent: isCollapsed ? "center" : "flex-start",
                padding: "0.48rem 0.6rem", borderRadius: radius.md,
                fontSize: typography.base, fontWeight: active ? typography.semibold : typography.medium,
                color: active ? cssVar.amberGlow : cssVar.textSecondary,
                textDecoration: "none",
                background: active ? "rgba(245,158,11,0.08)" : "transparent",
                borderLeft: `2px solid ${active ? cssVar.amberGlow : "transparent"}`,
                transition: "all 0.15s ease",
            }}
                title={isCollapsed ? label : undefined}
                onMouseEnter={(e) => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.background = cssVar.bgSectionAlt; el.style.color = cssVar.textPrimary; } }}
                onMouseLeave={(e) => { if (!active) { const el = e.currentTarget as HTMLAnchorElement; el.style.background = "transparent"; el.style.color = cssVar.textSecondary; } }}
            >
                <span style={{ color: active ? cssVar.amberGlow : cssVar.textMuted, opacity: active ? 1 : 0.7 }}>
                    <Icon name={icon} />
                </span>
                {!isCollapsed && <span style={{ flex: 1 }}>{label}</span>}
            </Link>
        );
    };

    // ── Bouton icône générique pour le footer collapsed ──────────────────────
    const iconBtn = (
        icon: React.ReactNode,
        onClick: () => void,
        title: string,
        color: string = cssVar.textSecondary,
        hoverBg: string = cssVar.bgSectionAlt,
        disabled = false,
    ) => (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            style={{
                width: 36, height: 36,
                display: "flex", alignItems: "center", justifyContent: "center",
                borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`,
                background: "transparent", color, cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.15s", flexShrink: 0,
                opacity: disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!disabled) { const el = e.currentTarget as HTMLButtonElement; el.style.background = hoverBg; el.style.borderColor = cssVar.borderAmberHover; } }}
            onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = "transparent"; el.style.borderColor = cssVar.borderSubtle; }}
        >
            {icon}
        </button>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            {/* ── Logo & Toggle ── */}
            <div style={{
                padding: isCollapsed ? `${spacing["4"]} ${spacing["3"]}` : `${spacing["5"]} ${spacing["4"]} ${spacing["4"]}`,
                borderBottom: `1px solid ${cssVar.borderSubtle}`,
                flexShrink: 0,
                display: "flex", alignItems: "center",
                justifyContent: isCollapsed ? "center" : "space-between",
                minHeight: 60,
            }}>
                <Logo
                    href={homeHref}
                    onClick={onNavClick}
                    variant={isCollapsed ? "icon" : "full"}
                    size={30}
                />
                {/* Bouton réduire — visible uniquement en mode étendu */}
                {toggleCollapse && !isCollapsed && (
                    <button onClick={toggleCollapse} title="Réduire" style={{
                        background: "transparent", border: "none", color: cssVar.textMuted,
                        cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem",
                        borderRadius: radius.sm, transition: "color 0.15s",
                    }}
                        onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = cssVar.textPrimary}
                        onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = cssVar.textMuted}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 18, height: 18 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
                        </svg>
                    </button>
                )}
            </div>

            {/* ── Utilisateur ── */}
            <div style={{
                padding: isCollapsed ? `${spacing["3"]} ${spacing["2"]}` : `${spacing["3"]} ${spacing["3"]}`,
                borderBottom: `1px solid ${cssVar.borderSubtle}`,
                flexShrink: 0, display: "flex", justifyContent: "center",
            }}>
                {isCollapsed ? (
                    <Link href="/profil" onClick={onNavClick} style={{ textDecoration: "none" }} title={user.nom_complet || user.login}>
                        <div style={avatarBase(34)}>{initials}</div>
                    </Link>
                ) : (
                    <div style={{ width: "100%" }}>
                        <Link href="/profil" onClick={onNavClick} style={{
                            display: "flex", alignItems: "center", gap: spacing["2"],
                            padding: "0.55rem 0.65rem", borderRadius: radius.xl,
                            background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`,
                            textDecoration: "none", transition: "border-color 0.2s",
                        }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.borderColor = cssVar.borderAmberHover}
                            onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.borderColor = cssVar.borderSubtle}
                        >
                            <div style={avatarBase(34)}>{initials}</div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ fontWeight: typography.semibold, fontSize: typography.sm, color: cssVar.textPrimary, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {user.nom_complet || user.login}
                                </p>
                                {user.restaurant_nom && (
                                    <p style={{ fontSize: typography.xs, color: cssVar.textMuted, margin: "1px 0 0" }}>{user.restaurant_nom}</p>
                                )}
                            </div>
                            <ChevronRight size={14} color={cssVar.textMuted} />
                        </Link>
                        <div style={{ marginTop: spacing["1"], paddingLeft: "0.2rem" }}>
                            <span style={roleBadge(rc.bg, rc.text, rc.border)}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: rc.text }} />
                                {ROLE_LABELS[role]}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Nav principale ── */}
            <nav style={{ flex: 1, overflowY: "auto", padding: isCollapsed ? `${spacing["3"]} ${spacing["1"]}` : `${spacing["3"]} ${spacing["3"]} ${spacing["2"]}` }}>
                {sections.map((section, si) => (
                    <div key={si} style={{ marginBottom: spacing["4"] }}>
                        {section.title && !isCollapsed && (
                            <p style={{ fontSize: typography.xs, fontWeight: typography.bold, letterSpacing: "0.12em", textTransform: "uppercase", color: cssVar.textMuted, padding: "0 0.35rem", marginBottom: spacing["1"] }}>
                                {section.title}
                            </p>
                        )}
                        {section.title && isCollapsed && (
                            <div style={{ height: "1px", background: cssVar.borderSubtle, margin: "0.5rem 0.5rem 1rem 0.5rem" }} />
                        )}
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                            {section.items.map((item) => navLink(item.href, item.icon, item.label))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* ── Footer ── */}
            {isCollapsed ? (
                /* Mode réduit : grille d'icônes centrées */
                <div style={{
                    borderTop: `1px solid ${cssVar.borderSubtle}`,
                    padding: `${spacing["3"]} 0`,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", gap: spacing["2"],
                    flexShrink: 0,
                }}>
                    {/* Profil */}
                    {iconBtn(
                        <User size={16} />,
                        () => { window.location.href = "/profil"; },
                        "Mon profil",
                    )}
                    {/* Sécurité */}
                    {iconBtn(
                        <Key size={16} />,
                        () => { window.location.href = "/auth/change-password"; },
                        "Sécurité",
                    )}
                    {/* Thème */}
                    <ThemeSwitcher variant="collapsed" />
                    {/* Logout */}
                    {iconBtn(
                        loggingOut
                            ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />
                            : <LogOut size={16} />,
                        async () => { setLoggingOut(true); await logout(); },
                        "Se déconnecter",
                        "#f87171",
                        "rgba(248,113,113,0.07)",
                        loggingOut,
                    )}
                    {/* Expand */}
                    {toggleCollapse && iconBtn(
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                        </svg>,
                        toggleCollapse,
                        "Agrandir la sidebar",
                    )}
                </div>
            ) : (
                /* Mode étendu : liens texte normaux */
                <div style={{
                    padding: `${spacing["3"]} ${spacing["3"]}`,
                    borderTop: `1px solid ${cssVar.borderSubtle}`,
                    display: "flex", flexDirection: "column", gap: "1px",
                    flexShrink: 0,
                }}>
                    {navLink("/profil", "profile", "Mon profil")}
                    {navLink("/auth/change-password", "key", "Sécurité")}
                    <div style={{ paddingTop: spacing["1"] }}>
                        <ThemeSwitcher variant="sidebar" />
                    </div>
                    <button
                        onClick={async () => { setLoggingOut(true); await logout(); }}
                        disabled={loggingOut}
                        style={{
                            display: "flex", alignItems: "center", gap: spacing["2"],
                            justifyContent: "flex-start",
                            padding: "0.48rem 0.6rem", borderRadius: radius.md,
                            fontSize: typography.base, fontWeight: typography.medium,
                            color: loggingOut ? cssVar.textMuted : "#f87171",
                            background: "transparent", border: "none",
                            cursor: loggingOut ? "not-allowed" : "pointer",
                            width: "100%", textAlign: "left", transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => { if (!loggingOut) (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.07)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                        <Icon name="logout" />
                        {loggingOut ? "Déconnexion…" : "Se déconnecter"}
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Export public ──────────────────────────────────────────────────────────

export const SIDEBAR_W = "15rem";

interface SidebarProps {
    mobileOpen: boolean;
    onMobileClose: () => void;
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
    topOffset?: string;
}

export default function Sidebar({ mobileOpen, onMobileClose, isCollapsed, toggleCollapse, topOffset = "0px" }: SidebarProps) {
    const base: React.CSSProperties = {
        width: isCollapsed ? "4.5rem" : SIDEBAR_W,
        background: cssVar.bgCard,
        borderRight: `1px solid ${cssVar.borderAmber}`,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
    };

    return (
        <>
            {/* Desktop */}
            <aside style={{ ...base, position: "fixed", top: topOffset, left: 0, bottom: 0, zIndex: 40 }} className="rp-sidebar-desktop">
                <SidebarInner isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
            </aside>

            {/* Mobile (jamais collapsed) */}
            <div className="rp-sidebar-mobile">
                {mobileOpen && (
                    <div onClick={onMobileClose} style={{
                        position: "fixed", inset: 0, zIndex: 49,
                        background: "rgba(0,0,0,0.52)", backdropFilter: "blur(4px)",
                    }} />
                )}
                <aside style={{
                    ...base,
                    width: SIDEBAR_W, // Toujours largeur normale sur mobile
                    position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50,
                    transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
                    transition: "transform 0.27s cubic-bezier(0.4,0,0.2,1)",
                    boxShadow: mobileOpen ? "8px 0 32px rgba(0,0,0,0.22)" : "none",
                }}>
                    <button onClick={onMobileClose} style={{
                        position: "absolute", top: "0.7rem", right: "0.7rem", zIndex: 1,
                        width: 28, height: 28, borderRadius: radius.md,
                        background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        color: cssVar.textMuted,
                    }}>
                        <X size={14} />
                    </button>
                    <SidebarInner onNavClick={onMobileClose} isCollapsed={false} />
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