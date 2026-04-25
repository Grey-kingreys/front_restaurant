"use client";
// src/contexts/ThemeContext.tsx
// ─────────────────────────────────────────────────────────────
// Gestion globale du thème : light | dark | system
// Persistance dans localStorage, écoute du changement système.
// ─────────────────────────────────────────────────────────────

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import type { ThemeMode } from "@/theme/theme";

interface ThemeContextValue {
    /** Préférence choisie par l'utilisateur */
    themeMode: ThemeMode;
    /** Thème effectivement appliqué (jamais "system") */
    isDark: boolean;
    setThemeMode: (mode: ThemeMode) => void;
}

const STORAGE_KEY = "rp_theme";

const ThemeContext = createContext<ThemeContextValue | null>(null);

// ── Helpers ───────────────────────────────────────────────────

function getSystemDark(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function resolveIsDark(mode: ThemeMode): boolean {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return getSystemDark();
}

// ── Provider ──────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
    const [isDark, setIsDark] = useState(false);

    // Initialisation depuis localStorage (côté client uniquement)
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        const initial: ThemeMode =
            stored && ["light", "dark", "system"].includes(stored)
                ? stored
                : "system";
        setThemeModeState(initial);
        setIsDark(resolveIsDark(initial));
    }, []);

    // Appliquer la classe `dark` sur <html> et synchroniser
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.setAttribute("data-theme", "dark");
        } else {
            root.setAttribute("data-theme", "light");
        }
    }, [isDark]);

    // Écouter le changement de préférence système (seulement si mode=system)
    useEffect(() => {
        if (themeMode !== "system") return;
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, [themeMode]);

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        setIsDark(resolveIsDark(mode));
        localStorage.setItem(STORAGE_KEY, mode);
    }, []);

    return (
        <ThemeContext.Provider value={{ themeMode, isDark, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

// ── Hook ─────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error("useTheme doit être utilisé dans ThemeProvider");
    return ctx;
}