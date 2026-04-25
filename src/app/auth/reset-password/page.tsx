"use client";
// src/app/auth/reset-password/page.tsx

import { useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { requestPasswordReset, confirmPasswordReset } from "@/lib/api/auth";

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

// ── Formulaire de demande ──────────────────────────────────────────────────

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
                <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)",
                    border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1rem",
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#22c55e" style={{ width: 28, height: 28 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </div>
                <h3 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Email envoyé !</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                    Si un compte existe avec <strong style={{ color: "var(--text-secondary)" }}>{email}</strong>,
                    vous recevrez un lien de réinitialisation valable <strong>1 heure</strong>.
                </p>
                <Link href="/auth/login" style={{
                    display: "inline-block", marginTop: "1.5rem",
                    padding: "0.6rem 1.5rem", borderRadius: "0.65rem",
                    background: "var(--gradient-btn)", color: "#0c0a09",
                    fontWeight: 700, fontSize: "0.875rem", textDecoration: "none",
                }}>
                    Retour à la connexion
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                    Votre adresse email
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
                {loading ? (
                    <><div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--text-muted)", borderTopColor: "var(--amber-glow)", animation: "spin 0.7s linear infinite" }} />Envoi…</>
                ) : "Envoyer le lien de réinitialisation"}
            </button>
        </form>
    );
}

// ── Formulaire de confirmation (avec token) ────────────────────────────────

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
                <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1rem",
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#22c55e" style={{ width: 28, height: 28 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                </div>
                <h3 style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>Mot de passe modifié !</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <Link href="/auth/login" style={{
                    display: "inline-block", marginTop: "1.5rem",
                    padding: "0.6rem 1.5rem", borderRadius: "0.65rem",
                    background: "var(--gradient-btn)", color: "#0c0a09",
                    fontWeight: 700, fontSize: "0.875rem", textDecoration: "none",
                }}>
                    Se connecter
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {["Nouveau mot de passe", "Confirmer le mot de passe"].map((label, idx) => (
                <div key={label}>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem" }}>
                        {label}
                    </label>
                    <div style={{ position: "relative" }}>
                        <input
                            type={showPwd ? "text" : "password"}
                            value={idx === 0 ? password : confirm}
                            onChange={(e) => idx === 0 ? setPassword(e.target.value) : setConfirm(e.target.value)}
                            required minLength={8}
                            placeholder="••••••••"
                            style={{ ...inputStyle, paddingRight: "2.75rem" }}
                        />
                        {idx === 0 && (
                            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                                position: "absolute", right: "0.75rem", top: "50%",
                                transform: "translateY(-50%)", background: "none",
                                border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 0,
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
                    : "Définir le nouveau mot de passe"}
            </button>
        </form>
    );
}

// ── Wrapper avec Suspense pour useSearchParams ─────────────────────────────

function ResetContent() {
    const params = useSearchParams();
    const token = params.get("token");

    return (
        <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-dark)", padding: "1.5rem", position: "relative", overflow: "hidden",
        }}>
            <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)",
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
                        <span style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}>
                            Resto<span style={{ background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</span>
                        </span>
                    </Link>
                </div>

                <div style={{
                    background: "var(--bg-card)", border: "1px solid var(--border-amber)",
                    borderRadius: "1.25rem", padding: "2rem", boxShadow: "var(--shadow-card)",
                }}>
                    {/* Icône clé */}
                    <div style={{
                        width: 48, height: 48, borderRadius: "0.875rem",
                        background: "var(--icon-bg)", border: "1px solid var(--icon-border)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        marginBottom: "1rem", color: "var(--icon-primary)",
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                        </svg>
                    </div>

                    <h2 style={{ fontWeight: 700, fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "0.35rem" }}>
                        {token ? "Nouveau mot de passe" : "Mot de passe oublié"}
                    </h2>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                        {token
                            ? "Choisissez un nouveau mot de passe sécurisé (8 caractères minimum)."
                            : "Saisissez votre email pour recevoir un lien de réinitialisation."}
                    </p>

                    {token ? <ConfirmForm token={token} /> : <RequestForm />}
                </div>

                {!token && (
                    <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        <Link href="/auth/login" style={{ color: "var(--amber-glow)", textDecoration: "none" }}>
                            ← Retour à la connexion
                        </Link>
                    </p>
                )}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetContent />
        </Suspense>
    );
}