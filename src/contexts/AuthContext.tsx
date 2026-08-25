"use client";
// src/contexts/AuthContext.tsx

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    ReactNode,
} from "react";
import {
    getStoredUser,
    getRefreshToken,
    getAccessToken,
    clearTokens,
    saveUser,
    setTokens,
    saveAdminSession,
    getAdminSession,
    clearAdminSession,
} from "@/lib/api/client";
import { getMe, logout as apiLogout, impersonateUser } from "@/lib/api/auth";
import type { User } from "@/types";

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    isImpersonating: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    impersonate: (userId: number) => Promise<void>;
    stopImpersonation: () => void;
    /** Vérifie si l'utilisateur connecté possède le code de permission donné */
    hasPermission: (code: string) => boolean;
    /** Vérifie si l'utilisateur possède au moins l'un des codes fournis */
    hasAnyPermission: (...codes: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isImpersonating, setIsImpersonating] = useState(false);

    const setUser = useCallback((u: User | null) => {
        setUserState(u);
        if (u) saveUser(u);
    }, []);

    const logout = useCallback(async () => {
        // Si simulation active, simplement arrêter la simulation
        if (getAdminSession()) {
            const session = getAdminSession()!;
            setTokens(session.access, session.refresh);
            setUser(session.user as User);
            clearAdminSession();
            setIsImpersonating(false);
            return;
        }
        const refresh = getRefreshToken();
        if (refresh) {
            try { await apiLogout(refresh); } catch { /* ignorer */ }
        }
        clearTokens();
        setUserState(null);
    }, [setUser]);

    const refreshUser = useCallback(async () => {
        try {
            const res = await getMe();
            if (res.success && res.data) setUser(res.data);
        } catch {
            clearTokens();
            setUserState(null);
        }
    }, [setUser]);

    const impersonate = useCallback(async (userId: number) => {
        const currentAccess = getAccessToken();
        const currentRefresh = getRefreshToken();
        const currentUser = getStoredUser<User>();
        if (!currentAccess || !currentRefresh || !currentUser) return;

        const res = await impersonateUser(userId);
        if (!res.success || !res.data) throw new Error(res.message || "Simulation impossible");

        saveAdminSession(currentAccess, currentRefresh, currentUser);
        setTokens(res.data.access, res.data.refresh);
        setUser(res.data.user);
        setIsImpersonating(true);
    }, [setUser]);

    const stopImpersonation = useCallback(() => {
        const session = getAdminSession();
        if (!session) return;
        setTokens(session.access, session.refresh);
        setUser(session.user as User);
        clearAdminSession();
        setIsImpersonating(false);
    }, [setUser]);

    const hasPermission = useCallback((code: string): boolean => {
        if (!user) return false;
        // Rsuper_admin et Rtable n'ont pas de role_config mais ont un accès structurel
        if (user.role === "Rsuper_admin") return true;
        return (user.permissions ?? []).includes(code);
    }, [user]);

    const hasAnyPermission = useCallback((...codes: string[]): boolean => {
        return codes.some(c => hasPermission(c));
    }, [hasPermission]);

    // Initialisation - lire l'utilisateur stocké et vérifier la session
    useEffect(() => {
        const init = async () => {
            // Détecter si une simulation est en cours (survive au refresh de page)
            const adminSession = getAdminSession();
            if (adminSession) setIsImpersonating(true);

            const stored = getStoredUser<User>();
            if (stored) {
                setUserState(stored);
                try {
                    const res = await getMe();
                    if (res.success && res.data) setUser(res.data);
                    else { clearTokens(); setUserState(null); }
                } catch {
                    clearTokens();
                    setUserState(null);
                }
            }
            setIsLoading(false);
        };
        init();
    }, [setUser]);

    // Écouter l'event de déconnexion forcée (refresh token expiré)
    useEffect(() => {
        const handler = () => {
            if (getAdminSession()) {
                // Refresh de la cible expiré → revenir à l'admin
                stopImpersonation();
            } else {
                setUserState(null);
            }
        };
        window.addEventListener("auth:logout", handler);
        return () => window.removeEventListener("auth:logout", handler);
    }, [stopImpersonation]);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                isImpersonating,
                setUser,
                logout,
                refreshUser,
                impersonate,
                stopImpersonation,
                hasPermission,
                hasAnyPermission,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
    return ctx;
}
