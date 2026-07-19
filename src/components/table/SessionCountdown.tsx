"use client";
// src/components/table/SessionCountdown.tsx
// Modal de compte à rebours affiché après paiement ou expiration de session table.

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, Clock, LogOut } from "lucide-react";
import { palette, radius, typography, spacing } from "@/theme/theme";

interface SessionCountdownProps {
    reason: "all_paid" | "expired";
    onLogout: () => void;
}

const COUNTDOWN_SECONDS = 60;

export function SessionCountdown({ reason, onLogout }: SessionCountdownProps) {
    const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);

    useEffect(() => {
        if (seconds <= 0) { onLogout(); return; }
        const t = setTimeout(() => setSeconds((s) => s - 1), 1_000);
        return () => clearTimeout(t);
    }, [seconds, onLogout]);

    const progress = (seconds / COUNTDOWN_SECONDS) * 100;
    const isPaid = reason === "all_paid";

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem",
        }}>
            <div style={{
                background: "#1c1917", borderRadius: radius.xl,
                border: `1px solid ${isPaid ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.25)"}`,
                padding: `${spacing["8"]} ${spacing["6"]}`,
                maxWidth: 360, width: "100%", textAlign: "center",
            }}>
                {/* Icône */}
                <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: isPaid ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                    border: `1px solid ${isPaid ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.25rem",
                    color: isPaid ? "#22c55e" : "#f59e0b",
                }}>
                    {isPaid ? <CheckCircle size={26} /> : <Clock size={26} />}
                </div>

                <h2 style={{ margin: "0 0 0.5rem", fontSize: "1.125rem", fontWeight: 800, color: "#fff" }}>
                    {isPaid ? "Commande payée !" : "Session expirée"}
                </h2>

                <p style={{ margin: "0 0 1.5rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
                    {isPaid
                        ? "Merci pour votre commande. Vous serez déconnecté dans :"
                        : "Votre session a expiré. Vous serez déconnecté dans :"}
                </p>

                {/* Compte à rebours */}
                <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 1.5rem" }}>
                    <svg width={80} height={80} style={{ transform: "rotate(-90deg)" }}>
                        <circle cx={40} cy={40} r={34} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={6} />
                        <circle
                            cx={40} cy={40} r={34} fill="none"
                            stroke={isPaid ? "#22c55e" : "#f59e0b"}
                            strokeWidth={6}
                            strokeDasharray={`${2 * Math.PI * 34}`}
                            strokeDashoffset={`${2 * Math.PI * 34 * (1 - progress / 100)}`}
                            strokeLinecap="round"
                            style={{ transition: "stroke-dashoffset 1s linear" }}
                        />
                    </svg>
                    <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.5rem", fontWeight: 800, color: "#fff",
                    }}>
                        {seconds}
                    </div>
                </div>

                {/* Bouton logout immédiat */}
                <button
                    onClick={onLogout}
                    style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                        width: "100%", padding: "0.7rem 1.25rem",
                        borderRadius: radius.lg, border: "none",
                        background: isPaid ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                        color: isPaid ? "#22c55e" : "#f59e0b",
                        fontSize: typography.sm, fontWeight: 700, cursor: "pointer",
                    }}
                >
                    <LogOut size={15} />
                    Se déconnecter maintenant
                </button>
            </div>
        </div>
    );
}
