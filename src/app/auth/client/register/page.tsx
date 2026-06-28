"use client";
// src/app/auth/client/register/page.tsx

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ChefHat } from "lucide-react";
import { registerClient } from "@/lib/api/public";
import { setTokens, saveUser } from "@/lib/api/client";

export default function ClientRegisterPage() {
    const router = useRouter();
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
                saveUser(res.data.user);
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

    const inp = (name: string, placeholder: string, type = "text") => (
        <div>
            <input name={name} type={type} value={(form as never)[name]} onChange={set(name)} placeholder={placeholder} required
                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: `1px solid ${errors[name] ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }} />
            {errors[name] && <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>{errors[name]}</p>}
        </div>
    );

    return (
        <>
            <style>{`input::placeholder{color:rgba(255,255,255,0.25)} input:focus{border-color:rgba(245,158,11,0.4)!important}`}</style>
            <div style={{ minHeight: "100vh", background: "#0c0a09", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                <div style={{ width: "100%", maxWidth: 420 }}>
                    {/* Logo */}
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <div style={{ width: 48, height: 48, borderRadius: "0.75rem", background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", color: "#f59e0b" }}>
                            <ChefHat size={24} />
                        </div>
                        <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.375rem", fontWeight: 900, color: "#fff" }}>Créer un compte</h1>
                        <p style={{ margin: 0, fontSize: "0.83rem", color: "rgba(255,255,255,0.4)" }}>Commandez en quelques clics</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                        {errors.global && (
                            <div style={{ padding: "0.75rem 1rem", borderRadius: "0.75rem", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: "0.82rem" }}>{errors.global}</div>
                        )}

                        {inp("nom_complet", "Nom complet")}
                        {inp("email", "Email", "email")}
                        {inp("telephone", "Téléphone (optionnel)", "tel")}

                        <div style={{ position: "relative" }}>
                            <input type={showPwd ? "text" : "password"} value={form.password} onChange={set("password")} placeholder="Mot de passe (min. 8 car.)" required
                                style={{ width: "100%", padding: "0.75rem 2.5rem 0.75rem 1rem", borderRadius: "0.75rem", border: `1px solid ${errors.password ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }} />
                            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 0, display: "flex" }}>
                                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            {errors.password && <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>{errors.password}</p>}
                        </div>

                        <div>
                            <input type={showPwd ? "text" : "password"} value={form.password_confirm} onChange={set("password_confirm")} placeholder="Confirmer le mot de passe" required
                                style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.75rem", border: `1px solid ${errors.password_confirm ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.1)"}`, background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }} />
                            {errors.password_confirm && <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>{errors.password_confirm}</p>}
                        </div>

                        <button type="submit" disabled={loading} style={{ padding: "0.875rem", borderRadius: "0.875rem", border: "none", background: loading ? "rgba(245,158,11,0.5)" : "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0c0a09", fontWeight: 800, fontSize: "0.95rem", cursor: loading ? "not-allowed" : "pointer", marginTop: "0.25rem" }}>
                            {loading ? "Création…" : "Créer mon compte"}
                        </button>

                        <p style={{ textAlign: "center", margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                            Déjà un compte ?{" "}
                            <button type="button" onClick={() => router.push(`/auth/client/login?next=${encodeURIComponent(nextUrl)}`)} style={{ background: "none", border: "none", color: "#f59e0b", cursor: "pointer", fontWeight: 600, fontSize: "0.8rem", padding: 0 }}>
                                Se connecter
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </>
    );
}
