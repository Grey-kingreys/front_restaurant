"use client";
// src/app/profil/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getMe } from "@/lib/api/auth";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/navigation";
import type { User, Role } from "@/types";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import {
    cssVar, typography, radius, spacing, palette,
    roleBadge, statusBadge, statusDot, avatarBase,
    iconContainer, cardSection, sectionHead, sectionHeadTitle,
} from "@/theme/theme";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
function formatDateTime(iso: string | null) {
    if (!iso) return "Jamais";
    return new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing["3"], padding: `${spacing["3"]} 0`, borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
            <span style={{ fontSize: typography.xs, color: cssVar.textMuted, flexShrink: 0, paddingTop: 1, minWidth: 90 }}>{label}</span>
            <span style={{ fontSize: typography.sm, color: cssVar.textPrimary, fontWeight: typography.medium, textAlign: "right", wordBreak: "break-all" }}>
                {value ?? <span style={{ color: cssVar.textMuted, fontStyle: "italic", fontWeight: typography.normal }}>Non renseigné</span>}
            </span>
        </div>
    );
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div style={cardSection}>
            <div style={sectionHead}>
                <span style={{ color: cssVar.iconPrimary }}>{icon}</span>
                <h2 style={sectionHeadTitle}>{title}</h2>
            </div>
            <div style={{ padding: `0 ${spacing["4"]}` }}>{children}</div>
        </div>
    );
}

const iconUser = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>;
const iconShield = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" /></svg>;
const iconClock = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const iconPalette = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" /></svg>;

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
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: cssVar.bgDark }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", border: `3px solid ${cssVar.borderAmber}`, borderTopColor: cssVar.amberGlow, animation: "spin .75s linear infinite" }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }
    if (!user) return null;

    const role = user.role as Role;
    const rc = ROLE_COLORS[role];
    const initials = user.nom_complet
        ? user.nom_complet.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
        : user.login.slice(0, 2).toUpperCase();

    return (
        <>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .profil-root  { min-height:100vh; background:var(--bg-dark); padding:1.25rem 1rem 3rem; }
        .profil-inner { max-width:700px; margin:0 auto; position:relative; z-index:1; }
        .profil-bc    { display:flex; align-items:center; gap:0.35rem; margin-bottom:1rem; }
        .profil-bc a  { font-size:0.75rem; color:var(--text-muted); text-decoration:none; }
        .profil-bc a:hover { color:var(--amber-glow); }
        .profil-grid  { display:grid; gap:0.75rem; grid-template-columns:1fr; }
        @media(min-width:640px)  { .profil-root{padding:1.5rem 1.5rem 3rem;} .profil-grid{grid-template-columns:repeat(2,1fr);gap:0.875rem;} }
        @media(min-width:1024px) { .profil-root{padding:2rem 2rem 3rem;} .profil-grid{grid-template-columns:repeat(2,1fr);gap:1rem;} }
      `}</style>

            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "40vh", background: "radial-gradient(ellipse 70% 40% at 50% -5%, rgba(245,158,11,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

            <div className="profil-root">
                <div className="profil-inner">

                    {/* Breadcrumb */}
                    <nav className="profil-bc">
                        <Link href="/dashboard">Tableau de bord</Link>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 11, height: 11, color: cssVar.textMuted }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                        <span style={{ fontSize: typography.sm, color: cssVar.textSecondary }}>Mon profil</span>
                    </nav>

                    {/* Hero card */}
                    <div style={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderAmber}`, borderRadius: radius["2xl"], padding: `${spacing["5"]} ${spacing["5"]}`, marginBottom: spacing["4"], boxShadow: cssVar.shadowCard }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: spacing["3"] }}>
                            <div style={{ ...avatarBase(50), boxShadow: "0 0 0 3px rgba(245,158,11,0.15)" }}>{initials}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h1 style={{ fontWeight: typography.bold, fontSize: typography.lg, fontFamily: typography.fontSerif, color: cssVar.textPrimary, margin: `0 0 ${spacing["1"]}` }}>
                                    {user.nom_complet || user.login}
                                </h1>
                                <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: spacing["2"] }}>
                                    <span style={roleBadge(rc.bg, rc.text, rc.border)}>
                                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: rc.text }} />
                                        {ROLE_LABELS[role]}
                                    </span>
                                    <span style={statusBadge(user.actif)}>
                                        <span style={statusDot(user.actif)} />
                                        {user.actif ? "Actif" : "Inactif"}
                                    </span>
                                    {user.restaurant_nom && (
                                        <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>📍 {user.restaurant_nom}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {user.must_change_password && (
                            <div style={{ marginTop: spacing["3"], padding: `${spacing["2"]} ${spacing["3"]}`, borderRadius: radius.lg, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", fontSize: typography.sm, color: palette.amber[500], display: "flex", alignItems: "flex-start", gap: spacing["2"], lineHeight: 1.4 }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                                <span>
                                    Mot de passe temporaire à changer.{" "}
                                    <Link href="/auth/change-password" style={{ color: palette.amber[500], fontWeight: typography.bold }}>Changer →</Link>
                                </span>
                            </div>
                        )}

                        <div style={{ marginTop: spacing["3"], display: "flex", gap: spacing["2"], flexWrap: "wrap" }}>
                            <Link href="/auth/change-password" style={{
                                display: "inline-flex", alignItems: "center", gap: spacing["2"],
                                padding: `${spacing["2"]} ${spacing["4"]}`, borderRadius: radius.lg,
                                background: cssVar.gradientBtn, color: palette.btnText,
                                fontWeight: typography.bold, fontSize: typography.sm, textDecoration: "none",
                            }}>
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
                                <span style={{ fontFamily: "monospace", fontSize: typography.xs, background: cssVar.bgSectionAlt, padding: "0.1rem 0.35rem", borderRadius: radius.sm }}>
                                    {user.login}
                                </span>
                            } />
                        </Card>

                        <Card title="Rôle et accès" icon={iconShield}>
                            <div style={{ padding: `${spacing["3"]} 0`, borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
                                <p style={{ fontSize: typography.xs, color: cssVar.textMuted, margin: `0 0 ${spacing["1"]}` }}>Rôle attribué</p>
                                <span style={roleBadge(rc.bg, rc.text, rc.border)}>
                                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: rc.text }} />
                                    {ROLE_LABELS[role]}
                                </span>
                            </div>
                            <InfoRow label="Restaurant" value={user.restaurant_nom ?? (role === "Rsuper_admin" ? "Plateforme entière" : undefined)} />
                            <InfoRow label="Statut" value={<span style={{ color: user.actif ? palette.green[500] : palette.red[500], fontWeight: typography.semibold }}>{user.actif ? "✓ Actif" : "✗ Inactif"}</span>} />
                            <InfoRow label="Mot de passe" value={
                                <span style={{ color: user.must_change_password ? palette.amber[500] : cssVar.textMuted, fontWeight: user.must_change_password ? typography.semibold : typography.normal }}>
                                    {user.must_change_password ? "⚠ À changer" : "OK"}
                                </span>
                            } />
                        </Card>

                        <Card title="Activité" icon={iconClock}>
                            <InfoRow label="Membre depuis" value={formatDate(user.date_creation)} />
                            <InfoRow label="Dernière connexion" value={formatDateTime((user as User & { last_login?: string }).last_login ?? null)} />
                            <InfoRow label="ID" value={<span style={{ fontFamily: "monospace", fontSize: typography.sm }}>#{user.id}</span>} />
                        </Card>

                        {/* Card Apparence — ThemeSwitcher */}
                        <Card title="Apparence" icon={iconPalette}>
                            <div style={{ padding: `${spacing["4"]} 0 ${spacing["3"]}` }}>
                                <p style={{ fontSize: typography.xs, color: cssVar.textMuted, margin: `0 0 ${spacing["3"]}`, lineHeight: 1.5 }}>
                                    Choisissez le thème d'affichage de l'interface. Le mode Système suit automatiquement la préférence de votre appareil.
                                </p>
                                <div style={{ ...iconContainer(0), width: "auto", height: "auto", background: "none", border: "none", display: "block" }}>
                                    <ThemeSwitcher variant="sidebar" />
                                </div>
                            </div>
                        </Card>

                    </div>

                    {/* Note */}
                    <div style={{ marginTop: spacing["4"], padding: `${spacing["3"]} ${spacing["4"]}`, borderRadius: radius.xl, background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`, display: "flex", alignItems: "flex-start", gap: spacing["2"] }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 15, height: 15, color: cssVar.textMuted, flexShrink: 0, marginTop: 1 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                        <div>
                            <strong style={{ fontSize: typography.sm, color: cssVar.textSecondary }}>Informations en lecture seule</strong>
                            <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted, lineHeight: 1.5 }}>Votre nom, email et téléphone ne peuvent être modifiés que par un administrateur. Pour toute demande, contactez votre responsable.</p>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}