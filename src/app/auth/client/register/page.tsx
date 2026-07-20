"use client";
// src/app/auth/client/register/page.tsx

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { registerClient } from "@/lib/api/public";
import { setTokens } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/Logo";
import type { User } from "@/types";
import {
    inputStyle,
    cardBase,
    alertError,
    glowOverlay,
    authPageRoot,
    cssVar,
    typography,
    spacing,
    btnPrimary,
    btnPrimaryDisabled,
    spinnerBase,
} from "@/theme/theme";

export default function ClientRegisterPage() {
    const router = useRouter();
    const { setUser } = useAuth();
    const searchParams = useSearchParams();
    const nextUrl = searchParams?.get("next") ?? "/client";

    const [form, setForm] = useState({ nom_complet: "", email: "", telephone: "", password: "", password_confirm: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const res = await registerClient(form);
            if (res.success && res.data) {
                setTokens(res.data.access, res.data.refresh);
                setUser(res.data.user as User);
                router.push(nextUrl);
            } else {
                const errs: Record<string, string> = {};
                if (res.errors) {
                    for (const [k, v] of Object.entries(res.errors as Record<string, string[]>)) {
                        errs[k] = Array.isArray(v) ? v[0] : String(v);
                    }
                }
                if (!Object.keys(errs).length) errs.global = res.message || "Erreur lors de l'inscription.";
                setErrors(errs);
            }
        } catch {
            setErrors({ global: "Impossible de contacter le serveur. Réessayez." });
        }
        setLoading(false);
    };

    const labelStyle: React.CSSProperties = {
        display: "block", fontSize: typography.sm, fontWeight: typography.semibold,
        color: cssVar.textSecondary, marginBottom: spacing["1"],
    };
    const errText: React.CSSProperties = { margin: `${spacing["1"]} 0 0`, fontSize: typography.xs, color: "#ef4444" };
    const errBorder = (name: string) => (errors[name] ? { borderColor: "rgba(239,68,68,0.5)" } : {});

    const field = (name: string, label: string, type = "text", placeholder = "", optional = false) => (
        <div>
            <label style={labelStyle}>{label}</label>
            <input
                name={name} type={type} value={(form as never)[name]} onChange={set(name)}
                placeholder={placeholder} required={!optional}
                style={{ ...inputStyle, ...errBorder(name) }}
            />
            {errors[name] && <p style={errText}>{errors[name]}</p>}
        </div>
    );

    const eyeButton = (
        <button type="button" onClick={() => setShowPwd((v) => !v)}
            aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            style={{
                position: "absolute", right: "0.75rem", top: 0, bottom: 0,
                display: "flex", alignItems: "center",
                background: "none", border: "none", cursor: "pointer", color: cssVar.textMuted, padding: 0,
            }}>
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
    );

    return (
        <div style={{ ...authPageRoot, padding: "1.5rem" }}>
            <div style={glowOverlay} />

            <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: spacing["8"] }}>
                    <Logo href="/" size={44} />
                    <p style={{ marginTop: spacing["2"], fontSize: typography.md, color: cssVar.textMuted }}>
                        Créez votre compte — commandez en quelques clics
                    </p>
                </div>

                {/* Card */}
                <div style={{ ...cardBase, padding: "clamp(1.25rem, 5vw, 2rem)" }}>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing["4"] }}>
                        {errors.global && <div style={alertError}>{errors.global}</div>}

                        {field("nom_complet", "Nom complet", "text", "Prénom Nom")}
                        {field("email", "Adresse email", "email", "votre@email.com")}
                        {field("telephone", "Téléphone (optionnel)", "tel", "+224 6xx xxx xxx", true)}

                        {/* Mot de passe */}
                        <div>
                            <label style={labelStyle}>Mot de passe</label>
                            <div style={{ position: "relative" }}>
                                <input type={showPwd ? "text" : "password"} value={form.password} onChange={set("password")}
                                    required placeholder="Min. 8 caractères" minLength={8}
                                    style={{ ...inputStyle, display: "block", paddingRight: "2.75rem", ...errBorder("password") }} />
                                {eyeButton}
                            </div>
                            {errors.password && <p style={errText}>{errors.password}</p>}
                        </div>

                        {/* Confirmer */}
                        <div>
                            <label style={labelStyle}>Confirmer le mot de passe</label>
                            <div style={{ position: "relative" }}>
                                <input type={showPwd ? "text" : "password"} value={form.password_confirm} onChange={set("password_confirm")}
                                    required placeholder="Répétez le mot de passe" minLength={8}
                                    style={{ ...inputStyle, display: "block", paddingRight: "2.75rem", ...errBorder("password_confirm") }} />
                                {eyeButton}
                            </div>
                            {errors.password_confirm && <p style={errText}>{errors.password_confirm}</p>}
                        </div>

                        <button type="submit" disabled={loading}
                            style={{ ...(loading ? btnPrimaryDisabled : btnPrimary), width: "100%", minHeight: "48px", fontSize: "1rem", marginTop: spacing["1"] }}>
                            {loading ? (<><div style={spinnerBase} />Création…</>) : "Créer mon compte"}
                        </button>
                    </form>

                    <p style={{ textAlign: "center", marginTop: spacing["5"], fontSize: typography.sm, color: cssVar.textMuted }}>
                        Déjà un compte ?{" "}
                        <Link href={`/auth/client/login?next=${encodeURIComponent(nextUrl)}`}
                            style={{ color: cssVar.amberGlow, textDecoration: "none", fontWeight: typography.semibold }}>
                            Se connecter
                        </Link>
                    </p>
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
