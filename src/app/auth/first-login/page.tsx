"use client";
// src/app/auth/first-login/page.tsx
// Première connexion Admin — activation du compte via token d'onboarding

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOnboardingToken, activateOnboarding, type OnboardingInfo } from "@/lib/api/company";
import BrandLogo from "@/components/ui/Logo";
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
import { apiErrorMessage } from "@/lib/apiErrors";

// ── États de la page ───────────────────────────────────────────────────────

type PageState = "loading" | "valid" | "expired" | "invalid" | "done";

// ── Icônes ─────────────────────────────────────────────────────────────────

const IconKey = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
    </svg>
);

const IconWarning = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 24, height: 24 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

const IconCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={palette.green[500]} style={{ width: 28, height: 28 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

const IconEye = ({ open }: { open: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 18, height: 18 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d={open
            ? "M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
            : "M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        } />
    </svg>
);

// Défini au niveau module : sinon recréé à chaque render (frappe clavier) →
// BrandLogo se remonte → clignotement du logo (retour incubateur #6).
const Logo = () => (
    <div style={{ textAlign: "center", marginBottom: spacing["8"] }}>
        <BrandLogo href="/" size={44} priority />
    </div>
);

// ── Contenu principal ──────────────────────────────────────────────────────

function FirstLoginContent() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get("token") ?? "";

    const [state, setState] = useState<PageState>("loading");
    const [info, setInfo] = useState<OnboardingInfo | null>(null);
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Vérifier le token au chargement
    useEffect(() => {
        if (!token) { setState("invalid"); return; }
        verifyOnboardingToken(token)
            .then((res) => {
                if (res.success && res.data) {
                    setInfo(res.data);
                    setState("valid");
                } else {
                    setState("expired");
                }
            })
            .catch((err: unknown) => {
                const e = err as { status?: number };
                setState(e?.status === 410 ? "expired" : "invalid");
            });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (password !== confirm) { setError("Les mots de passe ne correspondent pas."); return; }
        if (password.length < 8) { setError("Le mot de passe doit contenir au moins 8 caractères."); return; }
        setSubmitting(true);
        try {
            const res = await activateOnboarding(token, { password, password_confirm: confirm });
            if (res.success) {
                setState("done");
            } else {
                setError(apiErrorMessage(res, "Une erreur est survenue."));
            }
        } catch (err: unknown) {
            const e = err as { message?: string; errors?: Record<string, string[]> };
            const firstErr = e?.errors ? Object.values(e.errors)[0]?.[0] : null;
            setError(firstErr || e?.message || "Une erreur est survenue.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Chargement ──────────────────────────────────────────────────────────
    if (state === "loading") {
        return (
            <div style={{ ...authPageRoot }}>
                <div style={glowOverlay} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: spacing["4"], position: "relative", zIndex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--border-subtle)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                    <p style={{ color: cssVar.textMuted, fontSize: typography.sm }}>Vérification du lien…</p>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── Token invalide ou expiré ────────────────────────────────────────────
    if (state === "invalid" || state === "expired") {
        return (
            <div style={{ ...authPageRoot, padding: "1.5rem" }}>
                <div style={glowOverlay} />
                <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
                    <Logo />
                    <div style={{ ...cardBase, padding: spacing["8"], textAlign: "center" }}>
                        <div style={{ ...iconContainer(48), borderRadius: radius.xl, marginBottom: spacing["4"], background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                            <IconWarning />
                        </div>
                        <h2 style={{ fontWeight: typography.bold, fontSize: typography["2xl"], color: cssVar.textPrimary, marginBottom: spacing["2"] }}>
                            {state === "expired" ? "Lien expiré" : "Lien invalide"}
                        </h2>
                        <p style={{ fontSize: typography.sm, color: cssVar.textMuted, lineHeight: 1.6, marginBottom: spacing["6"] }}>
                            {state === "expired"
                                ? "Ce lien d'activation a expiré (valable 48h) ou a déjà été utilisé. Contactez votre Super Administrateur pour en obtenir un nouveau."
                                : "Ce lien d'activation est invalide. Vérifiez l'URL ou contactez votre Super Administrateur."}
                        </p>
                        <Link href="/auth/login" style={{
                            display: "inline-block", padding: `${spacing["2"]} ${spacing["6"]}`,
                            borderRadius: radius.lg, background: cssVar.gradientBtn,
                            color: palette.btnText, fontWeight: typography.bold,
                            fontSize: typography.base, textDecoration: "none",
                        }}>
                            Aller à la connexion
                        </Link>
                    </div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── Succès ──────────────────────────────────────────────────────────────
    if (state === "done") {
        return (
            <div style={{ ...authPageRoot, padding: "1.5rem" }}>
                <div style={glowOverlay} />
                <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
                    <Logo />
                    <div style={{ ...cardBase, padding: spacing["8"], textAlign: "center" }}>
                        <div style={alertSuccess}>
                            <IconCheck />
                        </div>
                        <h2 style={{ fontWeight: typography.bold, fontSize: typography["2xl"], color: cssVar.textPrimary, marginBottom: spacing["2"] }}>
                            Compte activé !
                        </h2>
                        <p style={{ fontSize: typography.base, color: cssVar.textMuted, lineHeight: 1.6, marginBottom: spacing["6"] }}>
                            Votre compte administrateur pour <strong style={{ color: cssVar.textPrimary }}>{info?.restaurant}</strong> est prêt.
                            Connectez-vous avec votre login <strong style={{ color: cssVar.textPrimary }}>{info?.login}</strong> et votre nouveau mot de passe.
                        </p>
                        <button
                            onClick={() => router.push("/auth/login")}
                            style={{ ...btnPrimary, width: "100%" }}
                        >
                            Se connecter
                        </button>
                    </div>
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── Formulaire d'activation ─────────────────────────────────────────────
    return (
        <div style={{ ...authPageRoot, padding: "1.5rem" }}>
            <div style={glowOverlay} />

            <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
                <Logo />

                <div style={{ ...cardBase, padding: "clamp(1.25rem, 5vw, 2rem)" }}>
                    {/* En-tête */}
                    <div style={{ display: "flex", alignItems: "center", gap: spacing["3"], marginBottom: spacing["6"] }}>
                        <div style={{ ...iconContainer(44), borderRadius: radius.xl, flexShrink: 0, background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}` }}>
                            <IconKey />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontWeight: typography.bold, fontSize: typography.xl, color: cssVar.textPrimary }}>
                                Première connexion
                            </h2>
                            <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted, marginTop: 2 }}>
                                Définissez votre mot de passe pour activer votre compte
                            </p>
                        </div>
                    </div>

                    {/* Infos restaurant */}
                    {info && (
                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing["3"],
                            padding: spacing["4"], borderRadius: radius.lg,
                            background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`,
                            marginBottom: spacing["6"],
                        }}>
                            <div>
                                <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Restaurant</p>
                                <p style={{ margin: "2px 0 0", fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textPrimary }}>{info.restaurant}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>Votre login</p>
                                <p style={{ margin: "2px 0 0", fontSize: typography.sm, fontWeight: typography.semibold, color: "var(--amber-glow)", fontFamily: "monospace" }}>{info.login}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing["4"] }}>
                        {/* Mot de passe */}
                        <div>
                            <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textSecondary, marginBottom: spacing["1"] }}>
                                Nouveau mot de passe
                            </label>
                            <div style={{ position: "relative" }}>
                                <input
                                    type={showPwd ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required minLength={8}
                                    placeholder="8 caractères minimum"
                                    style={{ ...inputStyle, paddingRight: "2.75rem" }}
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                                    position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)",
                                    background: "none", border: "none", cursor: "pointer", color: cssVar.textMuted, padding: 0,
                                }}>
                                    <IconEye open={showPwd} />
                                </button>
                            </div>
                        </div>

                        {/* Confirmation */}
                        <div>
                            <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textSecondary, marginBottom: spacing["1"] }}>
                                Confirmer le mot de passe
                            </label>
                            <input
                                type={showPwd ? "text" : "password"}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required minLength={8}
                                placeholder="••••••••"
                                style={inputStyle}
                            />
                        </div>

                        {error && <div style={alertError}>{error}</div>}

                        <button type="submit" disabled={submitting} style={submitting ? btnPrimaryDisabled : btnPrimary}>
                            {submitting
                                ? <><div style={spinnerBase} />Activation…</>
                                : "Activer mon compte"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: spacing["5"], fontSize: typography.xs, color: cssVar.textMuted, lineHeight: 1.5 }}>
                        Ce lien est à usage unique et valable 48h.
                    </p>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function FirstLoginPage() {
    return <Suspense><FirstLoginContent /></Suspense>;
}
