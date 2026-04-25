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
    clearTokens,
    saveUser,
} from "@/lib/api/client";
import { getMe, logout as apiLogout } from "@/lib/api/auth";
import type { User } from "@/types";

interface AuthContextValue {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const setUser = useCallback((u: User | null) => {
        setUserState(u);
        if (u) saveUser(u);
    }, []);

    const logout = useCallback(async () => {
        const refresh = getRefreshToken();
        if (refresh) {
            try {
                await apiLogout(refresh);
            } catch {
                // ignorer — on clear quand même
            }
        }
        clearTokens();
        setUserState(null);
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const res = await getMe();
            if (res.success && res.data) {
                setUser(res.data);
            }
        } catch {
            clearTokens();
            setUserState(null);
        }
    }, [setUser]);

    // Initialisation — lire l'utilisateur stocké et vérifier la session
    useEffect(() => {
        const init = async () => {
            const stored = getStoredUser<User>();
            if (stored) {
                setUserState(stored);
                // Vérifier que la session est encore valide
                try {
                    const res = await getMe();
                    if (res.success && res.data) {
                        setUser(res.data);
                    } else {
                        clearTokens();
                        setUserState(null);
                    }
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
            setUserState(null);
        };
        window.addEventListener("auth:logout", handler);
        return () => window.removeEventListener("auth:logout", handler);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                setUser,
                logout,
                refreshUser,
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