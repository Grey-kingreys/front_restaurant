"use client";
// src/app/auth/login/page.tsx

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithLogin } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";

type LoginMode = "email" | "login";

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const [mode, setMode] = useState<LoginMode>("email");
    const [email, setEmail] = useState("");
    const [loginVal, setLoginVal] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            let res;
            if (mode === "email") {
                res = await loginWithEmail(email, password);
            } else {
                res = await loginWithLogin(loginVal, password);
            }

            if (res.success && res.data) {
                setUser(res.data.user);
                router.push("/dashboard");
            } else {
                setError(res.message || "Identifiants invalides.");
            }
        } catch (err: unknown) {
            const e = err as { message?: string; errors?: { non_field_errors?: string[] } };
            setError(
                e?.errors?.non_field_errors?.[0] ||
                e?.message ||
                "Une erreur est survenue. Veuillez réessayer."
            );
        } finally {
            setLoading(false);
        }
    }, [mode, email, loginVal, password, setUser, router]);

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--bg-dark)",
            padding: "1.5rem",
            position: "relative",
            overflow: "hidden",
        }}>
            {/* Ambiance */}
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245,158,11,0.08) 0%, transparent 70%)",
            }} />
            <div style={{
                position: "absolute", top: "30%", left: "10%",
                width: 300, height: 300, borderRadius: "50%",
                background: "rgba(245,158,11,0.04)", filter: "blur(80px)", pointerEvents: "none",
            }} />

            <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", textDecoration: "none" }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: "0.875rem",
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 800, fontSize: "1.1rem", color: "#0c0a09",
                            fontFamily: "var(--font-playfair), serif",
                        }}>R</div>
                        <span style={{
                            fontSize: "1.5rem", fontWeight: 700,
                            fontFamily: "var(--font-playfair), serif",
                            color: "var(--text-primary)",
                        }}>
                            Resto<span style={{
                                background: "var(--gradient-text)",
                                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                            }}>Pro</span>
                        </span>
                    </Link>
                    <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                        Bienvenue — connectez-vous à votre espace
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-amber)",
                    borderRadius: "1.25rem",
                    padding: "2rem",
                    boxShadow: "var(--shadow-card)",
                }}>
                    {/* Tabs mode connexion */}
                    <div style={{
                        display: "flex", borderRadius: "0.65rem", padding: "3px",
                        background: "var(--bg-section-alt)",
                        border: "1px solid var(--border-subtle)",
                        marginBottom: "1.5rem",
                    }}>
                        {(["email", "login"] as LoginMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(null); }}
                                style={{
                                    flex: 1, padding: "0.5rem", borderRadius: "0.5rem",
                                    border: "none", cursor: "pointer",
                                    fontSize: "0.85rem", fontWeight: 600,
                                    transition: "all 0.2s ease",
                                    background: mode === m ? "var(--gradient-btn)" : "transparent",
                                    color: mode === m ? "#0c0a09" : "var(--text-muted)",
                                }}
                            >
                                {m === "email" ? "Connexion Staff" : "Connexion Table"}
                            </button>
                        ))}
                    </div>

                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
                        {mode === "email"
                            ? "Pour les administrateurs, managers, serveurs, cuisiniers et comptables."
                            : "Pour les tables — via QR Code ou identifiants fournis par l'admin."}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {/* Email ou Login */}
                        {mode === "email" ? (
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                                    Adresse email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="votre@email.com"
                                    style={inputStyle}
                                />
                            </div>
                        ) : (
                            <div>
                                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                                    Identifiant de table
                                </label>
                                <input
                                    type="text"
                                    value={loginVal}
                                    onChange={(e) => setLoginVal(e.target.value)}
                                    required
                                    placeholder="lebaobab_table_01"
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        {/* Mot de passe */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                                Mot de passe
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    style={{ ...inputStyle, paddingRight: "2.75rem" }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: "absolute", right: "0.75rem", top: "50%",
                                        transform: "translateY(-50%)", background: "none",
                                        border: "none", cursor: "pointer", color: "var(--text-muted)",
                                        padding: 0,
                                    }}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Lien reset (staff seulement) */}
                        {mode === "email" && (
                            <div style={{ textAlign: "right", marginTop: "-0.5rem" }}>
                                <Link href="/auth/reset-password" style={{ fontSize: "0.78rem", color: "var(--amber-glow)", textDecoration: "none" }}>
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        )}

                        {/* Erreur */}
                        {error && (
                            <div style={{
                                padding: "0.65rem 0.875rem",
                                borderRadius: "0.6rem",
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.2)",
                                color: "#ef4444",
                                fontSize: "0.82rem",
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Bouton submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: "0.75rem",
                                borderRadius: "0.75rem",
                                border: "none",
                                background: loading ? "var(--border-subtle)" : "var(--gradient-btn)",
                                color: loading ? "var(--text-muted)" : "#0c0a09",
                                fontWeight: 700, fontSize: "0.95rem",
                                cursor: loading ? "not-allowed" : "pointer",
                                transition: "all 0.2s ease",
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: 16, height: 16, borderRadius: "50%",
                                        border: "2px solid var(--text-muted)",
                                        borderTopColor: "var(--amber-glow)",
                                        animation: "spin 0.7s linear infinite",
                                    }} />
                                    Connexion…
                                </>
                            ) : "Se connecter"}
                        </button>
                    </form>
                </div>

                {/* Back to home */}
                <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                    <Link href="/" style={{ color: "var(--amber-glow)", textDecoration: "none" }}>
                        ← Retour à l'accueil
                    </Link>
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.875rem",
    borderRadius: "0.65rem",
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-section-alt)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border-color 0.2s ease",
    boxSizing: "border-box",
};