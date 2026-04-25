"use client";
// src/app/auth/login/page.tsx

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithEmail, loginWithLogin } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import {
    inputStyle,
    cardBase,
    alertError,
    glowOverlay,
    authPageRoot,
    cssVar,
    typography,
    radius,
    spacing,
    palette,
    btnPrimary,
    btnPrimaryDisabled,
    spinnerBase,
} from "@/theme/theme";

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
            if (mode === "email") res = await loginWithEmail(email, password);
            else res = await loginWithLogin(loginVal, password);

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
        <div style={authPageRoot}>
            <div style={glowOverlay} />
            <div style={{
                position: "absolute", top: "30%", left: "10%",
                width: 300, height: 300, borderRadius: "50%",
                background: "rgba(245,158,11,0.04)", filter: "blur(80px)", pointerEvents: "none",
            }} />

            <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: spacing["8"] }}>
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: spacing["3"], textDecoration: "none" }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: radius.xl,
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: typography.extrabold, fontSize: typography.xl, color: palette.btnText,
                            fontFamily: typography.fontSerif,
                        }}>R</div>
                        <span style={{ fontSize: typography["3xl"], fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary }}>
                            Resto<span style={{ background: cssVar.gradientText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</span>
                        </span>
                    </Link>
                    <p style={{ marginTop: spacing["2"], fontSize: typography.md, color: cssVar.textMuted }}>
                        Bienvenue — connectez-vous à votre espace
                    </p>
                </div>

                {/* Card */}
                <div style={{ ...cardBase, padding: spacing["8"] }}>

                    {/* Tabs */}
                    <div style={{
                        display: "flex", borderRadius: radius.lg, padding: "3px",
                        background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`,
                        marginBottom: spacing["6"],
                    }}>
                        {(["email", "login"] as LoginMode[]).map((m) => (
                            <button key={m} onClick={() => { setMode(m); setError(null); }} style={{
                                flex: 1, padding: spacing["2"], borderRadius: radius.md,
                                border: "none", cursor: "pointer",
                                fontSize: typography.base, fontWeight: typography.semibold,
                                transition: "all 0.2s ease",
                                background: mode === m ? cssVar.gradientBtn : "transparent",
                                color: mode === m ? palette.btnText : cssVar.textMuted,
                            }}>
                                {m === "email" ? "Connexion Staff" : "Connexion Table"}
                            </button>
                        ))}
                    </div>

                    <p style={{ fontSize: typography.xs, color: cssVar.textMuted, marginBottom: spacing["5"] }}>
                        {mode === "email"
                            ? "Pour les administrateurs, managers, serveurs, cuisiniers et comptables."
                            : "Pour les tables — via QR Code ou identifiants fournis par l'admin."}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing["4"] }}>
                        {/* Identifiant */}
                        {mode === "email" ? (
                            <div>
                                <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textSecondary, marginBottom: spacing["1"] }}>
                                    Adresse email
                                </label>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    required placeholder="votre@email.com" style={inputStyle} />
                            </div>
                        ) : (
                            <div>
                                <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textSecondary, marginBottom: spacing["1"] }}>
                                    Identifiant de table
                                </label>
                                <input type="text" value={loginVal} onChange={(e) => setLoginVal(e.target.value)}
                                    required placeholder="lebaobab_table_01" style={inputStyle} />
                            </div>
                        )}

                        {/* Mot de passe */}
                        <div>
                            <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textSecondary, marginBottom: spacing["1"] }}>
                                Mot de passe
                            </label>
                            <div style={{ position: "relative" }}>
                                <input type={showPassword ? "text" : "password"} value={password}
                                    onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••"
                                    style={{ ...inputStyle, paddingRight: "2.75rem" }} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                                    position: "absolute", right: "0.75rem", top: "50%",
                                    transform: "translateY(-50%)", background: "none",
                                    border: "none", cursor: "pointer", color: cssVar.textMuted, padding: 0,
                                }}>
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

                        {mode === "email" && (
                            <div style={{ textAlign: "right", marginTop: `-${spacing["2"]}` }}>
                                <Link href="/auth/reset-password" style={{ fontSize: typography.xs, color: cssVar.amberGlow, textDecoration: "none" }}>
                                    Mot de passe oublié ?
                                </Link>
                            </div>
                        )}

                        {error && <div style={alertError}>{error}</div>}

                        <button type="submit" disabled={loading}
                            style={loading ? btnPrimaryDisabled : btnPrimary}>
                            {loading ? (
                                <><div style={spinnerBase} />Connexion…</>
                            ) : "Se connecter"}
                        </button>
                    </form>
                </div>

                <p style={{ textAlign: "center", marginTop: spacing["6"], fontSize: typography.xs, color: cssVar.textMuted }}>
                    <Link href="/" style={{ color: cssVar.amberGlow, textDecoration: "none" }}>
                        ← Retour à l'accueil
                    </Link>
                </p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}