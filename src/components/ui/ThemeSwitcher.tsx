"use client";
// src/components/ui/ThemeSwitcher.tsx
// Dropdown compact : Clair / Sombre / Système
// Utilisé dans la Sidebar (pages privées) et la Navbar (landing)

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import type { ThemeMode } from "@/theme/theme";
import { cssVar, radius, typography } from "@/theme/theme";

const OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
    {
        value: "light",
        label: "Clair",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
            </svg>
        ),
    },
    {
        value: "dark",
        label: "Sombre",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
            </svg>
        ),
    },
    {
        value: "system",
        label: "Système",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                strokeWidth={1.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25A2.25 2.25 0 0 1 5.25 3h13.5A2.25 2.25 0 0 1 21 5.25Z" />
            </svg>
        ),
    },
];

interface ThemeSwitcherProps {
    /** "sidebar" → label visible + fond neutre ; "navbar" → compact icon-only trigger */
    variant?: "sidebar" | "navbar";
}

export default function ThemeSwitcher({ variant = "sidebar" }: ThemeSwitcherProps) {
    const { themeMode, setThemeMode } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

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

    const isSidebar = variant === "sidebar";

    return (
        <div ref={ref} style={{ position: "relative" }}>
            {/* Trigger */}
            <button
                onClick={() => setOpen((v) => !v)}
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
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                    strokeWidth={2} stroke="currentColor"
                    style={{
                        width: 10, height: 10,
                        color: cssVar.textMuted,
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                        flexShrink: 0,
                    }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div style={{
                    position: "absolute",
                    bottom: isSidebar ? "calc(100% + 6px)" : "auto",
                    top: isSidebar ? "auto" : "calc(100% + 6px)",
                    left: 0,
                    right: isSidebar ? 0 : "auto",
                    minWidth: 160,
                    background: cssVar.bgCard,
                    border: `1px solid ${cssVar.borderAmber}`,
                    borderRadius: radius.xl,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    zIndex: 100,
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
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        strokeWidth={2.5} stroke="currentColor"
                                        style={{ width: 12, height: 12, marginLeft: "auto", color: cssVar.amberGlow }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}