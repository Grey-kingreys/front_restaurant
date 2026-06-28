"use client";
// src/components/layout/ImpersonationBanner.tsx

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ROLE_LABELS } from "@/lib/navigation";
import type { Role } from "@/types";

export const BANNER_H = "2.625rem"; // 42px

export default function ImpersonationBanner() {
    const { user, isImpersonating, stopImpersonation } = useAuth();
    const router = useRouter();

    if (!isImpersonating || !user) return null;

    const handleStop = () => {
        stopImpersonation();
        router.push("/equipe");
    };

    const roleLabel = ROLE_LABELS[user.role as Role] ?? user.role;

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0,
            height: BANNER_H,
            zIndex: 9999,
            background: "linear-gradient(90deg, #7c3aed, #6d28d9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
            padding: "0 1rem",
            boxShadow: "0 2px 8px rgba(109,40,217,0.4)",
        }}>
            <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>
                Simulation active
            </span>
            <span style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#fff",
                background: "rgba(255,255,255,0.15)",
                padding: "0.1rem 0.6rem",
                borderRadius: "9999px",
                border: "1px solid rgba(255,255,255,0.25)",
            }}>
                {user.nom_complet ?? user.login} · {roleLabel}
            </span>
            <button
                onClick={handleStop}
                style={{
                    height: "1.6rem",
                    padding: "0 0.65rem",
                    borderRadius: "9999px",
                    border: "1px solid rgba(255,255,255,0.35)",
                    background: "rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    letterSpacing: "0.01em",
                }}
            >
                ✕ Quitter
            </button>
        </div>
    );
}
