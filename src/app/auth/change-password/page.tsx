"use client";
// src/app/auth/change-password/page.tsx

import { useState } from "react";
import Link from "next/link";
import { changePassword } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.875rem",
    borderRadius: "0.65rem",
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-section-alt)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
    boxSizing: "border-box",
};

export default function ChangePasswordPage() {
    const { user } = useAuth();
    const [oldPwd, setOldPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isFirstLogin = user?.must_change_password;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (newPwd !== confirmPwd) { setError("Les nouveaux mots de passe ne correspondent pas."); return; }
        if (newPwd.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
        setLoading(true);
        try {
            const res = await changePassword({ old_password: oldPwd, new_password: newPwd, new_password_confirm: confirmPwd });
            if (res.success) setSuccess(true);
            else setError(res.message || "Erreur lors du changement de mot de passe.");
        } catch (err: unknown) {
            const e = err as { errors?: Record<string, string[]>; message?: string };
            const firstErr = e?.errors ? Object.values(e.errors).flat()[0] : e?.message;
            setError(firstErr || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                background: "var(--bg-dark)", padding: "1.5rem",
            }}>
                <div style={{
                    background: "var(--bg-card)", border: "1px solid var(--border-amber)",
                    borderRadius: "1.25rem", padding: "2.5rem", maxWidth: 400, width: "100%",
                    textAlign: "center", boxShadow: "var(--shadow-card)",
                }}>
                    <div style={{
                        width: 60, height: 60, borderRadius: "50%",
                        background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 1.25rem",
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#22c55e" style={{ width: 30, height: 30 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                    </div>
                    <h2 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Mot de passe modifié</h2>
                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                        Votre mot de passe a été mis à jour avec succès.
                    </p>
                    <Link href="#" style={{
                        display: "inline-block", padding: "0.6rem 1.5rem",
                        borderRadius: "0.65rem", background: "var(--gradient-btn)",
                        color: "#0c0a09", fontWeight: 700, fontSize: "0.875rem", textDecoration: "none",
                    }}>
                        Retour au tableau de bord
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-dark)", padding: "1.5rem", position: "relative", overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)",
            }} />

            <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
                <div style={{
                    background: "var(--bg-card)", border: "1px solid var(--border-amber)",
                    borderRadius: "1.25rem", padding: "2rem", boxShadow: "var(--shadow-card)",
                }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: "0.75rem",
                            background: "var(--icon-bg)", border: "1px solid var(--icon-border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--icon-primary)", flexShrink: 0,
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 22, height: 22 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                            </svg>
                        </div>
                        <div>
                            <h2 style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)", marginBottom: "0.1rem" }}>
                                {isFirstLogin ? "Créez votre mot de passe" : "Changer le mot de passe"}
                            </h2>
                            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                {isFirstLogin
                                    ? "Première connexion — définissez un mot de passe personnel."
                                    : "Sécurisez votre compte avec un nouveau mot de passe."}
                            </p>
                        </div>
                    </div>

                    {isFirstLogin && (
                        <div style={{
                            padding: "0.65rem 0.875rem", borderRadius: "0.65rem",
                            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
                            fontSize: "0.8rem", color: "#f59e0b", marginBottom: "1.25rem",
                        }}>
                            ⚠️ Vous devez changer votre mot de passe temporaire avant de continuer.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {/* Ancien mot de passe */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                                Mot de passe actuel
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPwd ? "text" : "password"}
                                    value={oldPwd}
                                    onChange={(e) => setOldPwd(e.target.value)}
                                    required placeholder="••••••••"
                                    style={{ ...inputStyle, paddingRight: "2.75rem" }}
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                                    position: "absolute", right: "0.75rem", top: "50%",
                                    transform: "translateY(-50%)", background: "none",
                                    border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0,
                                }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Nouveau mot de passe */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                                Nouveau mot de passe
                            </label>
                            <input
                                type={showPwd ? "text" : "password"}
                                value={newPwd}
                                onChange={(e) => setNewPwd(e.target.value)}
                                required minLength={8}
                                placeholder="8 caractères minimum"
                                style={inputStyle}
                            />
                            {/* Indicateur de force */}
                            {newPwd.length > 0 && (
                                <div style={{ display: "flex", gap: "3px", marginTop: "0.4rem" }}>
                                    {[1, 2, 3, 4].map((level) => {
                                        const strength = Math.min(
                                            newPwd.length >= 8 ? 1 : 0,
                                            newPwd.length >= 12 ? 1 : 0,
                                            /[A-Z]/.test(newPwd) && /[0-9]/.test(newPwd) ? 1 : 0,
                                            /[^a-zA-Z0-9]/.test(newPwd) ? 1 : 0,
                                        ) * 4;
                                        const active = level <= (newPwd.length >= 8 ? (newPwd.length >= 12 ? 3 : 2) : 1);
                                        return (
                                            <div key={level} style={{
                                                flex: 1, height: 3, borderRadius: 2,
                                                background: active
                                                    ? level <= 1 ? "#ef4444" : level <= 2 ? "#f97316" : level <= 3 ? "#eab308" : "#22c55e"
                                                    : "var(--border-subtle)",
                                                transition: "background 0.2s",
                                            }} />
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Confirmation */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                                Confirmer le nouveau mot de passe
                            </label>
                            <input
                                type={showPwd ? "text" : "password"}
                                value={confirmPwd}
                                onChange={(e) => setConfirmPwd(e.target.value)}
                                required placeholder="••••••••"
                                style={{
                                    ...inputStyle,
                                    borderColor: confirmPwd && confirmPwd !== newPwd ? "rgba(239,68,68,0.5)" : undefined,
                                }}
                            />
                            {confirmPwd && confirmPwd !== newPwd && (
                                <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.25rem" }}>
                                    Les mots de passe ne correspondent pas
                                </p>
                            )}
                        </div>

                        {error && (
                            <div style={{
                                padding: "0.65rem 0.875rem", borderRadius: "0.6rem",
                                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                                color: "#ef4444", fontSize: "0.82rem",
                            }}>{error}</div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            padding: "0.75rem", borderRadius: "0.75rem", border: "none",
                            background: loading ? "var(--border-subtle)" : "var(--gradient-btn)",
                            color: loading ? "var(--text-muted)" : "#0c0a09",
                            fontWeight: 700, fontSize: "0.95rem",
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                        }}>
                            {loading
                                ? <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--text-muted)", borderTopColor: "var(--amber-glow)", animation: "spin 0.7s linear infinite" }} />Enregistrement…</>
                                : "Mettre à jour le mot de passe"}
                        </button>
                    </form>
                </div>

                {!isFirstLogin && (
                    <p style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        <Link href="#" style={{ color: "var(--amber-glow)", textDecoration: "none" }}>
                            ← Retour au tableau de bord
                        </Link>
                    </p>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}