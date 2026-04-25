"use client";
// src/app/profil/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getMe } from "@/lib/api/auth";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/navigation";
import type { User, Role } from "@/types";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
function formatDateTime(iso: string | null) {
    if (!iso) return "Jamais";
    return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", flexShrink: 0, paddingTop: 1, minWidth: 90 }}>{label}</span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}>
                {value ?? <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontWeight: 400 }}>Non renseigné</span>}
            </span>
        </div>
    );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "0.875rem", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)" }}>
                <span style={{ color: "var(--icon-primary)" }}>{icon}</span>
                <h2 style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)" }}>{title}</h2>
            </div>
            <div style={{ padding: "0 1rem" }}>{children}</div>
        </div>
    );
}

const iconUser = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>;
const iconShield = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>;
const iconClock = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;

export default function ProfilPage() {
    const { user: ctxUser, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated) return;
        getMe()
            .then((res) => { if (res.success && res.data) setUser(res.data); })
            .catch(() => { if (ctxUser) setUser(ctxUser); })
            .finally(() => setFetching(false));
    }, [isAuthenticated, ctxUser]);

    if (isLoading || fetching) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    if (!user) return null;

    const role = user.role as Role;
    const roleLabel = ROLE_LABELS[role];
    const roleColor = ROLE_COLORS[role];
    const initials = user.nom_complet
        ? user.nom_complet.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : user.login.slice(0, 2).toUpperCase();

    return (
        <>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        .profil-root {
          min-height: 100vh;
          background: var(--bg-dark);
          padding: 1.25rem 1rem 3rem;
        }
        .profil-inner { max-width: 700px; margin: 0 auto; position: relative; z-index: 1; }

        /* Breadcrumb */
        .profil-bc { display: flex; align-items: center; gap: 0.35rem; margin-bottom: 1rem; }
        .profil-bc a { font-size: 0.75rem; color: var(--text-muted); text-decoration: none; }
        .profil-bc a:hover { color: var(--amber-glow); }
        .profil-bc span { font-size: 0.75rem; color: var(--text-secondary); }

        /* Hero */
        .profil-hero {
          background: var(--bg-card);
          border: 1px solid var(--border-amber);
          border-radius: 1rem;
          padding: 1.125rem 1.25rem;
          margin-bottom: 0.875rem;
          box-shadow: var(--shadow-card);
        }
        .profil-hero-top { display: flex; align-items: flex-start; gap: 0.875rem; }
        .profil-avatar {
          width: 50px; height: 50px; border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 1rem; color: #0c0a09;
          flex-shrink: 0;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.15);
        }
        .profil-name {
          font-weight: 700; font-size: 1rem;
          font-family: var(--font-playfair), serif;
          color: var(--text-primary); margin: 0 0 0.3rem;
        }
        .profil-badges { display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem; }
        .profil-status {
          display: inline-flex; align-items: center; gap: 0.25rem;
          padding: 0.15rem 0.5rem; border-radius: 9999px;
          font-size: 0.63rem; font-weight: 700;
        }
        .profil-pwd-warn {
          margin-top: 0.75rem; padding: 0.5rem 0.75rem;
          border-radius: 0.55rem;
          background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
          font-size: 0.75rem; color: #f59e0b;
          display: flex; align-items: flex-start; gap: 0.4rem; line-height: 1.4;
        }
        .profil-actions { margin-top: 0.875rem; display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .profil-btn-primary {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.45rem 0.875rem; border-radius: 0.55rem;
          background: var(--gradient-btn); color: #0c0a09;
          font-weight: 700; font-size: 0.78rem; text-decoration: none;
        }

        /* Grille cards */
        .profil-grid { display: grid; gap: 0.75rem; grid-template-columns: 1fr; }

        /* Note */
        .profil-note {
          margin-top: 0.875rem; padding: 0.75rem 0.875rem;
          border-radius: 0.75rem;
          background: var(--bg-section-alt); border: 1px solid var(--border-subtle);
          display: flex; align-items: flex-start; gap: 0.5rem;
        }
        .profil-note p { margin: 0; font-size: 0.72rem; color: var(--text-muted); line-height: 1.5; }
        .profil-note strong { font-size: 0.75rem; color: var(--text-secondary); }

        /* ── Tablette ≥ 640px ── */
        @media (min-width: 640px) {
          .profil-root { padding: 1.5rem 1.5rem 3rem; }
          .profil-hero { padding: 1.375rem 1.5rem; border-radius: 1.125rem; }
          .profil-avatar { width: 62px; height: 62px; font-size: 1.2rem; }
          .profil-name { font-size: 1.15rem; }
          .profil-grid { grid-template-columns: repeat(2, 1fr); gap: 0.875rem; }
          .profil-btn-primary { font-size: 0.82rem; padding: 0.5rem 1rem; }
          .profil-status { font-size: 0.68rem; }
        }

        /* ── Desktop ≥ 1024px ── */
        @media (min-width: 1024px) {
          .profil-root { padding: 2rem 2rem 3rem; }
          .profil-hero { padding: 1.625rem 1.75rem; border-radius: 1.25rem; margin-bottom: 1.125rem; }
          .profil-avatar { width: 72px; height: 72px; font-size: 1.4rem; box-shadow: 0 0 0 4px rgba(245,158,11,0.15); }
          .profil-name { font-size: 1.3rem; }
          .profil-grid { grid-template-columns: repeat(2, 1fr); gap: 1rem; }
          .profil-note { padding: 0.875rem 1.125rem; }
          .profil-note p { font-size: 0.78rem; }
        }
      `}</style>

            {/* Glow */}
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "40vh", background: "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(245,158,11,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

            <div className="profil-root">
                <div className="profil-inner">

                    {/* Breadcrumb */}
                    <nav className="profil-bc">
                        <Link href="/dashboard">Tableau de bord</Link>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 11, height: 11, color: "var(--text-muted)" }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                        <span>Mon profil</span>
                    </nav>

                    {/* Hero */}
                    <div className="profil-hero">
                        <div className="profil-hero-top">
                            <div className="profil-avatar">{initials}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h1 className="profil-name">{user.nom_complet || user.login}</h1>
                                <div className="profil-badges">
                                    {/* Badge rôle */}
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", fontSize: "0.65rem", fontWeight: 700, background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}` }}>
                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: roleColor.text }} />
                                        {roleLabel}
                                    </span>
                                    {/* Badge statut */}
                                    <span className="profil-status" style={{ background: user.actif ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: user.actif ? "#22c55e" : "#ef4444", border: `1px solid ${user.actif ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}` }}>
                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: user.actif ? "#22c55e" : "#ef4444" }} />
                                        {user.actif ? "Actif" : "Inactif"}
                                    </span>
                                    {user.restaurant_nom && (
                                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>📍 {user.restaurant_nom}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {user.must_change_password && (
                            <div className="profil-pwd-warn">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                                <span>
                                    Mot de passe temporaire à changer.{" "}
                                    <Link href="/auth/change-password" style={{ color: "#f59e0b", fontWeight: 700 }}>Changer →</Link>
                                </span>
                            </div>
                        )}

                        <div className="profil-actions">
                            <Link href="/auth/change-password" className="profil-btn-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
                                </svg>
                                Changer le mot de passe
                            </Link>
                        </div>
                    </div>

                    {/* Cards infos */}
                    <div className="profil-grid">

                        <Card title="Informations personnelles" icon={iconUser}>
                            <InfoRow label="Nom complet" value={user.nom_complet} />
                            <InfoRow label="Email" value={user.email} />
                            <InfoRow label="Téléphone" value={user.telephone} />
                            <InfoRow label="Login" value={
                                <span style={{ fontFamily: "monospace", fontSize: "0.78rem", background: "var(--bg-section-alt)", padding: "0.1rem 0.35rem", borderRadius: "0.25rem" }}>
                                    {user.login}
                                </span>
                            } />
                        </Card>

                        <Card title="Rôle et accès" icon={iconShield}>
                            <div style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--border-subtle)" }}>
                                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0 0 0.35rem" }}>Rôle attribué</p>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}` }}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: roleColor.text }} />
                                    {roleLabel}
                                </span>
                            </div>
                            <InfoRow label="Restaurant" value={user.restaurant_nom ?? (role === "Rsuper_admin" ? "Plateforme entière" : undefined)} />
                            <InfoRow label="Statut" value={<span style={{ color: user.actif ? "#22c55e" : "#ef4444", fontWeight: 600 }}>{user.actif ? "✓ Actif" : "✗ Inactif"}</span>} />
                            <InfoRow label="Mot de passe" value={
                                <span style={{ color: user.must_change_password ? "#f59e0b" : "var(--text-muted)", fontWeight: user.must_change_password ? 600 : 400 }}>
                                    {user.must_change_password ? "⚠ À changer" : "OK"}
                                </span>
                            } />
                        </Card>

                        <Card title="Activité" icon={iconClock}>
                            <InfoRow label="Membre depuis" value={formatDate(user.date_creation)} />
                            <InfoRow label="Dernière connexion" value={formatDateTime((user as User & { last_login?: string }).last_login ?? null)} />
                            <InfoRow label="ID" value={<span style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>#{user.id}</span>} />
                        </Card>
                    </div>

                    {/* Note */}
                    <div className="profil-note">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 15, height: 15, color: "var(--text-muted)", flexShrink: 0, marginTop: 1 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                        <div>
                            <strong>Informations en lecture seule</strong>
                            <p>Votre nom, email et téléphone ne peuvent être modifiés que par un administrateur. Pour toute demande, contactez votre responsable.</p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}