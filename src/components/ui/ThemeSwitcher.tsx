"use client";
// src/components/ui/ThemeSwitcher.tsx
// Dropdown compact : Clair / Sombre / Système
// Utilisé dans la Sidebar (pages privées) et la Navbar (landing)

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeMode } from "@/theme/theme";
import { cssVar, radius, typography } from "@/theme/theme";
import { Sun, Moon, Monitor, ChevronDown, Check } from "lucide-react";

const OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
        value: "light",
        label: "Clair",
        icon: <Sun size={14} />,
    },
    {
        value: "dark",
        label: "Sombre",
        icon: <Moon size={14} />,
    },
    {
        value: "system",
        label: "Système",
        icon: <Monitor size={14} />,
    },
];

interface ThemeSwitcherProps {
    /** "sidebar"   → label visible, dropdown vers le haut
     *  "page"      → label visible, dropdown vers le bas
     *  "collapsed" → icône seule 36×36, dropdown vers la droite
     *  "navbar"    → compact icon-only trigger */
    variant?: "sidebar" | "page" | "navbar" | "collapsed";
}

export default function ThemeSwitcher({ variant = "sidebar" }: ThemeSwitcherProps) {
    const { themeMode, setThemeMode } = useTheme();
    const [open, setOpen] = useState(false);
    const [dropRect, setDropRect] = useState<{ top: number; left: number; width: number } | null>(null);
    const ref     = useRef<HTMLDivElement>(null);
    const btnRef  = useRef<HTMLButtonElement>(null);

    const current = OPTIONS.find((o) => o.value === themeMode) ?? OPTIONS[2];

    // Fermer si clic extérieur
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const isSidebar   = variant === "sidebar" || variant === "page";
    const isCollapsed = variant === "collapsed";
    const dropUp      = variant === "sidebar"; // sidebar → haut, page → bas

    // Pour variant "page" : calcul position fixed depuis getBoundingClientRect
    const handlePageToggle = () => {
        if (!open && btnRef.current) {
            const r = btnRef.current.getBoundingClientRect();
            setDropRect({ top: r.bottom + 6, left: r.left, width: r.width });
        }
        setOpen((v) => !v);
    };

    // ── Variant collapsed : bouton icône seule ──────────────────────────────
    if (isCollapsed) {
        return (
            <div ref={ref} style={{ position: "relative" }}>
                <button
                    onClick={() => setOpen((v) => !v)}
                    title="Thème d'affichage"
                    aria-label="Changer le thème"
                    style={{
                        width: 36, height: 36,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: radius.md,
                        border: `1px solid ${open ? cssVar.borderAmberHover : cssVar.borderSubtle}`,
                        background: open ? "rgba(245,158,11,0.08)" : "transparent",
                        color: open ? cssVar.amberGlow : cssVar.textMuted,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                        if (!open) { const el = e.currentTarget as HTMLButtonElement; el.style.background = cssVar.bgSectionAlt; el.style.color = cssVar.textPrimary; }
                    }}
                    onMouseLeave={(e) => {
                        if (!open) { const el = e.currentTarget as HTMLButtonElement; el.style.background = "transparent"; el.style.color = cssVar.textMuted; }
                    }}
                >
                    {current.icon}
                </button>

                {/* Dropdown → vers la droite */}
                {open && (
                    <div style={{
                        position: "fixed",
                        left: "5rem",
                        bottom: "auto",
                        marginTop: 0,
                        minWidth: 160,
                        background: cssVar.bgCard,
                        border: `1px solid ${cssVar.borderAmber}`,
                        borderRadius: radius.xl,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
                        zIndex: 200,
                        overflow: "hidden",
                        padding: "0.3rem",
                    }}>
                        <p style={{ fontSize: typography.xs, fontWeight: 700, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", padding: "0.3rem 0.65rem 0.4rem", margin: 0 }}>
                            Thème
                        </p>
                        {OPTIONS.map((opt) => {
                            const active = opt.value === themeMode;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => { setThemeMode(opt.value); setOpen(false); }}
                                    style={{
                                        display: "flex", alignItems: "center", gap: "0.55rem",
                                        width: "100%", padding: "0.45rem 0.65rem",
                                        borderRadius: radius.lg, border: "none",
                                        background: active ? "rgba(245,158,11,0.10)" : "transparent",
                                        color: active ? cssVar.amberGlow : cssVar.textSecondary,
                                        fontWeight: active ? typography.semibold : typography.medium,
                                        fontSize: typography.base, cursor: "pointer",
                                        textAlign: "left", transition: "background 0.15s",
                                        borderLeft: `2px solid ${active ? cssVar.amberGlow : "transparent"}`,
                                    }}
                                    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = cssVar.bgSectionAlt; }}
                                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                                >
                                    <span style={{ color: active ? cssVar.amberGlow : cssVar.textMuted, display: "flex" }}>{opt.icon}</span>
                                    {opt.label}
                                    {active && <Check size={12} style={{ marginLeft: "auto", color: cssVar.amberGlow }} />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    // ── Variants sidebar & navbar ────────────────────────────────────────────
    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Trigger */}
            <button
                ref={variant === "page" ? btnRef : undefined}
                onClick={variant === "page" ? handlePageToggle : () => setOpen((v) => !v)}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: isSidebar ? "0.48rem 0.6rem" : "0.35rem 0.65rem",
                    borderRadius: radius.lg,
                    border: `1px solid ${open ? cssVar.borderAmberHover : cssVar.borderSubtle}`,
                    background: open ? cssVar.bgSectionAlt : "transparent",
                    color: open ? cssVar.amberGlow : cssVar.textSecondary,
                    cursor: "pointer",
                    fontSize: typography.base,
                    fontWeight: typography.medium,
                    width: isSidebar ? "100%" : "auto",
                    transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                    if (!open) {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = cssVar.bgSectionAlt;
                        el.style.color = cssVar.textPrimary;
                    }
                }}
                onMouseLeave={(e) => {
                    if (!open) {
                        const el = e.currentTarget as HTMLButtonElement;
                        el.style.background = "transparent";
                        el.style.color = cssVar.textSecondary;
                    }
                }}
                aria-label="Changer le thème"
                title="Thème d'affichage"
            >
                <span style={{
                    color: open ? cssVar.amberGlow : cssVar.textMuted,
                    opacity: open ? 1 : 0.75,
                    display: "flex",
                }}>
                    {current.icon}
                </span>
                {isSidebar && (
                    <>
                        <span style={{ flex: 1, textAlign: "left" }}>Thème</span>
                        <span style={{
                            fontSize: typography.xs,
                            color: cssVar.amberGlow,
                            fontWeight: typography.semibold,
                            background: "rgba(245,158,11,0.1)",
                            padding: "0.1rem 0.35rem",
                            borderRadius: radius.sm,
                        }}>
                            {current.label}
                        </span>
                    </>
                )}
                {!isSidebar && (
                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                        {current.label}
                    </span>
                )}
                <ChevronDown 
                    size={10} 
                    style={{
                        color: cssVar.textMuted,
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        flexShrink: 0,
                    }}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: variant === "page" && dropRect ? "fixed" : "absolute",
                    top: variant === "page" && dropRect ? dropRect.top : (dropUp ? "auto" : "calc(100% + 6px)"),
                    bottom: variant === "page" ? "auto" : (dropUp ? "calc(100% + 6px)" : "auto"),
                    left: variant === "page" && dropRect ? dropRect.left : 0,
                    right: variant === "page" ? "auto" : (isSidebar ? 0 : "auto"),
                    minWidth: variant === "page" && dropRect ? dropRect.width : 160,
                    background: cssVar.bgCard,
                    border: `1px solid ${cssVar.borderAmber}`,
                    borderRadius: radius.xl,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    zIndex: 9999,
                    overflow: "hidden",
                    padding: "0.3rem",
                }}>
                    {OPTIONS.map((opt) => {
                        const active = opt.value === themeMode;
                        return (
                            <button
                                key={opt.value}
                                onClick={() => { setThemeMode(opt.value); setOpen(false); }}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.55rem",
                                    width: "100%",
                                    padding: "0.45rem 0.65rem",
                                    borderRadius: radius.lg,
                                    border: "none",
                                    background: active ? "rgba(245,158,11,0.10)" : "transparent",
                                    color: active ? cssVar.amberGlow : cssVar.textSecondary,
                                    fontWeight: active ? typography.semibold : typography.medium,
                                    fontSize: typography.base,
                                    cursor: "pointer",
                                    textAlign: "left",
                                    transition: "background 0.15s",
                                    borderLeft: `2px solid ${active ? cssVar.amberGlow : "transparent"}`,
                                }}
                                onMouseEnter={(e) => {
                                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = cssVar.bgSectionAlt;
                                }}
                                onMouseLeave={(e) => {
                                    if (!active) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                }}
                            >
                                <span style={{ color: active ? cssVar.amberGlow : cssVar.textMuted, display: "flex" }}>
                                    {opt.icon}
                                </span>
                                {opt.label}
                                {active && (
                                    <Check size={12} style={{ marginLeft: "auto", color: cssVar.amberGlow }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}