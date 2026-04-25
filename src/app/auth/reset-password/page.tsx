"use client";
// src/app/auth/reset-password/page.tsx

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { requestPasswordReset, confirmPasswordReset } from "@/lib/api/auth";
import {
    inputStyle,
    cardBase,
    alertError,
    alertSuccess,
    glowOverlay,
    authPageRoot,
    iconContainer,
    btnPrimary,
    btnPrimaryDisabled,
    spinnerBase,
    cssVar,
    typography,
    radius,
    spacing,
    palette,
} from "@/theme/theme";

// ── Formulaire de demande ──────────────────────────────────────

function RequestForm() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await requestPasswordReset(email);
            setDone(true);
        } catch {
            setError("Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div style={{ textAlign: "center" }}>
                <div style={alertSuccess}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={palette.green[500]} style={{ width: 28, height: 28 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </div>
                <h3 style={{ fontWeight: typography.bold, color: cssVar.textPrimary, marginBottom: spacing["2"] }}>Email envoyé !</h3>
                <p style={{ fontSize: typography.base, color: cssVar.textMuted, lineHeight: 1.6 }}>
                    Si un compte existe avec <strong style={{ color: cssVar.textSecondary }}>{email}</strong>,
                    vous recevrez un lien valable <strong>1 heure</strong>.
                </p>
                <Link href="/auth/login" style={{
                    display: "inline-block", marginTop: spacing["6"],
                    padding: `${spacing["2"]} ${spacing["6"]}`, borderRadius: radius.lg,
                    background: cssVar.gradientBtn, color: palette.btnText,
                    fontWeight: typography.bold, fontSize: typography.base, textDecoration: "none",
                }}>
                    Retour à la connexion
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing["4"] }}>
            <div>
                <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textSecondary, marginBottom: spacing["1"] }}>
                    Votre adresse email
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    required placeholder="votre@email.com" style={inputStyle} />
            </div>
            {error && <div style={alertError}>{error}</div>}
            <button type="submit" disabled={loading} style={loading ? btnPrimaryDisabled : btnPrimary}>
                {loading
                    ? <><div style={spinnerBase} />Envoi…</>
                    : "Envoyer le lien de réinitialisation"}
            </button>
        </form>
    );
}

// ── Formulaire de confirmation (avec token) ────────────────────

function ConfirmForm({ token }: { token: string }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
        if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
        setLoading(true);
        try {
            const res = await confirmPasswordReset({ token, password, password_confirm: confirm });
            if (res.success) setDone(true);
            else setError(res.message || "Lien invalide ou expiré.");
        } catch (err: unknown) {
            const e = err as { message?: string };
            setError(e?.message || "Lien invalide ou expiré.");
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <div style={{ textAlign: "center" }}>
                <div style={alertSuccess}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={palette.green[500]} style={{ width: 28, height: 28 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </div>
                <h3 style={{ fontWeight: typography.bold, color: cssVar.textPrimary, marginBottom: spacing["2"] }}>Mot de passe modifié !</h3>
                <p style={{ fontSize: typography.base, color: cssVar.textMuted }}>
                    Connectez-vous maintenant avec votre nouveau mot de passe.
                </p>
                <Link href="/auth/login" style={{
                    display: "inline-block", marginTop: spacing["6"],
                    padding: `${spacing["2"]} ${spacing["6"]}`, borderRadius: radius.lg,
                    background: cssVar.gradientBtn, color: palette.btnText,
                    fontWeight: typography.bold, fontSize: typography.base, textDecoration: "none",
                }}>
                    Se connecter
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing["4"] }}>
            {["Nouveau mot de passe", "Confirmer le mot de passe"].map((label, idx) => (
                <div key={label}>
                    <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textSecondary, marginBottom: spacing["1"] }}>
                        {label}
                    </label>
                    <div style={{ position: "relative" }}>
                        <input type={showPwd ? "text" : "password"}
                            value={idx === 0 ? password : confirm}
                            onChange={(e) => idx === 0 ? setPassword(e.target.value) : setConfirm(e.target.value)}
                            required minLength={8} placeholder="••••••••"
                            style={{ ...inputStyle, paddingRight: "2.75rem" }} />
                        {idx === 0 && (
                            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                                position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                                background: "none", border: "none", cursor: "pointer", color: cssVar.textMuted, padding: 0,
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d={showPwd
                                        ? "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                                        : "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                    } />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            ))}
            {error && <div style={alertError}>{error}</div>}
            <button type="submit" disabled={loading} style={loading ? btnPrimaryDisabled : btnPrimary}>
                {loading
                    ? <><div style={spinnerBase} />Enregistrement…</>
                    : "Définir le nouveau mot de passe"}
            </button>
        </form>
    );
}

// ── Wrapper Suspense ───────────────────────────────────────────

function ResetContent() {
    const params = useSearchParams();
    const token = params.get("token");

    return (
        <div style={authPageRoot}>
            <div style={glowOverlay} />
            <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: spacing["8"] }}>
                    <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: spacing["3"], textDecoration: "none" }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: radius.xl,
                            background: "linear-gradient(135deg, #f59e0b, #d97706)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: typography.extrabold, fontSize: typography.xl, color: palette.btnText,
                        }}>R</div>
                        <span style={{ fontSize: typography["3xl"], fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary }}>
                            Resto<span style={{ background: cssVar.gradientText, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</span>
                        </span>
                    </Link>
                </div>

                <div style={{ ...cardBase, padding: spacing["8"] }}>
                    <div style={{ ...iconContainer(48), borderRadius: radius.xl, marginBottom: spacing["4"] }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                        </svg>
                    </div>
                    <h2 style={{ fontWeight: typography.bold, fontSize: typography["2xl"], color: cssVar.textPrimary, marginBottom: spacing["1"] }}>
                        {token ? "Nouveau mot de passe" : "Mot de passe oublié"}
                    </h2>
                    <p style={{ fontSize: typography.sm, color: cssVar.textMuted, marginBottom: spacing["6"] }}>
                        {token
                            ? "Choisissez un nouveau mot de passe sécurisé (8 caractères minimum)."
                            : "Saisissez votre email pour recevoir un lien de réinitialisation."}
                    </p>
                    {token ? <ConfirmForm token={token} /> : <RequestForm />}
                </div>

                {!token && (
                    <p style={{ textAlign: "center", marginTop: spacing["6"], fontSize: typography.xs, color: cssVar.textMuted }}>
                        <Link href="/auth/login" style={{ color: cssVar.amberGlow, textDecoration: "none" }}>← Retour à la connexion</Link>
                    </p>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function ResetPasswordPage() {
    return <Suspense><ResetContent /></Suspense>;
}