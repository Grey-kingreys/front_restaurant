"use client";
// src/app/dashboard/page.tsx

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardStats } from "@/lib/api/dashboard";
import { addToPanier } from "@/lib/api/commandes";
import type {
    DashboardData, AdminData, ServeurData, CuisineData,
    ComptableData, LivreurData, TableData, SuperadminData,
} from "@/lib/api/dashboard";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/navigation";
import { cssVar, typography, radius, roleBadge, avatarBase, btnOutline } from "@/theme/theme";
import StatCard from "@/components/dashboard/StatCard";
import type { Role } from "@/types";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Legend,
} from "recharts";
import {
    TrendingUp, Users, Utensils, CreditCard, Clock, ChefHat,
    AlertTriangle, ShoppingCart, Wallet, CheckCircle, MapPin,
    Truck, Package, Plus, Check,
} from "lucide-react";
import { apiErrorMessage } from "@/lib/apiErrors";

// ── Helpers ────────────────────────────────────────────────────────────────

const gnf = (v: number | string | null | undefined) => {
    const n = typeof v === "string" ? parseFloat(v) : (v ?? 0);
    return isNaN(n as number) ? "0 GNF" : (n as number).toLocaleString("fr-FR") + " GNF";
};

const CHART_COLORS = ["#f59e0b", "#3b82f6", "#a855f7", "#22c55e", "#f97316", "#ef4444"];

const withFill = <T extends object>(arr: T[]) =>
    arr.map((item, i) => ({ ...item, fill: CHART_COLORS[i % CHART_COLORS.length] }));

// ── Composants utilitaires ─────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.xl, overflow: "hidden" }}>
            <div style={{ padding: "0.875rem 1.25rem", borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
                <p style={{ margin: 0, fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted }}>
                    {title}
                </p>
            </div>
            {children}
        </div>
    );
}

function Loader() {
    return (
        <div style={{ padding: "2rem", display: "flex", justifyContent: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: `3px solid ${cssVar.borderSubtle}`, borderTopColor: cssVar.amberGlow, animation: "spin .7s linear infinite" }} />
        </div>
    );
}

// ── Dashboard Admin / Manager ──────────────────────────────────────────────

function AdminDashboard({ d }: { d: AdminData }) {
    const k = d.kpis;
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* KPIs */}
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                <StatCard title="Revenus du jour"    value={gnf(k.revenus_jour)}    icon={TrendingUp}  color={cssVar.amberGlow} />
                <StatCard title="Commandes du jour"  value={k.commandes_jour}        icon={Utensils}    color="#3b82f6" />
                <StatCard title="Tables occupées"    value={`${k.tables_occupees}/${k.tables_total}`} icon={CreditCard} color="#22c55e" />
                <StatCard title="Solde générale"     value={gnf(k.solde_generale)}   icon={Wallet}      color="#a855f7" />
            </div>

            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
                {/* Revenus 7 jours */}
                <SectionCard title="Revenus 7 derniers jours">
                    <div style={{ padding: "1rem", height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d.revenus_7j}>
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: cssVar.textMuted }} />
                                <YAxis tick={{ fontSize: 10, fill: cssVar.textMuted }} width={55} tickFormatter={(v: unknown) => (Number(v ?? 0) / 1000).toFixed(0) + "k"} />
                                <Tooltip formatter={(v: unknown) => [gnf(Number(v ?? 0)), "Revenus"]} contentStyle={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="revenus" fill={cssVar.amberGlow} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Statuts live */}
                <SectionCard title="Statuts commandes (live)">
                    <div style={{ padding: "1rem", height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={withFill(d.statuts_live)} dataKey="total" nameKey="label" cx="50%" cy="50%" innerRadius={45} outerRadius={70} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Tooltip formatter={(v: unknown) => [Number(v ?? 0), "commandes"]} contentStyle={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Par catégorie */}
                <SectionCard title="Ventes par catégorie">
                    <div style={{ padding: "1rem", height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={withFill(d.par_categorie)} dataKey="total" nameKey="label" cx="50%" cy="50%" innerRadius={45} outerRadius={70} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Tooltip formatter={(v: unknown) => [Number(v ?? 0), "plats"]} contentStyle={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                {/* Par heure */}
                <SectionCard title="Activité par heure">
                    <div style={{ padding: "1rem", height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d.par_heure}>
                                <XAxis dataKey="h" tick={{ fontSize: 10, fill: cssVar.textMuted }} />
                                <YAxis tick={{ fontSize: 10, fill: cssVar.textMuted }} width={25} allowDecimals={false} />
                                <Tooltip formatter={(v: unknown) => [Number(v ?? 0), "commandes"]} contentStyle={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="n" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* Dernières commandes */}
            {d.dernieres_commandes?.length > 0 && (
                <SectionCard title="Dernières commandes">
                    {d.dernieres_commandes.slice(0, 5).map(c => (
                        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", borderBottom: `1px solid ${cssVar.borderSubtle}`, fontSize: typography.sm }}>
                            <span style={{ color: cssVar.textMuted }}>#{c.id} · {c.table}</span>
                            <span style={{ color: cssVar.textPrimary, fontWeight: typography.semibold }}>{gnf(c.montant)}</span>
                            <span style={{ color: cssVar.textMuted, fontSize: typography.xs }}>{c.heure}</span>
                        </div>
                    ))}
                </SectionCard>
            )}
        </div>
    );
}

// ── Dashboard Serveur ──────────────────────────────────────────────────────

function ServeurDashboard({ d }: { d: ServeurData }) {
    const STATUT_COLORS: Record<string, string> = {
        en_attente: "#f59e0b", prete: "#3b82f6", servie: "#a855f7", payee: "#22c55e",
    };
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                <StatCard title="Tables actives"    value={d.nb_tables_actives}   icon={Utensils}    color="#3b82f6" />
                <StatCard title="Commandes prêtes"  value={d.nb_commandes_pretes} icon={CheckCircle} color="#22c55e" />
                <StatCard title="Traitées (7j)"     value={d.commandes_traitees_7j} icon={TrendingUp} color={cssVar.amberGlow} />
                <StatCard title="Remises du jour"   value={gnf(d.remises_jour)}   icon={CreditCard}  color="#a855f7" />
            </div>

            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                <SectionCard title="Activité par heure">
                    <div style={{ padding: "1rem", height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d.par_heure}>
                                <XAxis dataKey="h" tick={{ fontSize: 10, fill: cssVar.textMuted }} />
                                <YAxis tick={{ fontSize: 10, fill: cssVar.textMuted }} width={25} allowDecimals={false} />
                                <Tooltip formatter={(v: unknown) => [Number(v ?? 0), "commandes"]} contentStyle={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="n" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="Commandes prêtes à servir">
                    {d.commandes_pretes.length === 0 ? (
                        <p style={{ padding: "1.5rem", textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, margin: 0 }}>Aucune commande prête.</p>
                    ) : d.commandes_pretes.map(c => (
                        <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
                            <div>
                                <p style={{ margin: 0, fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textPrimary }}>#{c.id} · {c.table}</p>
                                <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted }}>{c.heure}</p>
                            </div>
                            <span style={{ fontSize: typography.sm, fontWeight: typography.bold, color: cssVar.amberGlow }}>{gnf(c.montant)}</span>
                        </div>
                    ))}
                </SectionCard>
            </div>

            {/* Tables actives */}
            {d.tables_actives.length > 0 && (
                <SectionCard title="Tables actives">
                    <div style={{ display: "grid", gap: "0.75rem", padding: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
                        {d.tables_actives.map(t => {
                            const c = STATUT_COLORS[t.statut] ?? cssVar.textMuted;
                            return (
                                <div key={t.id} style={{ padding: "0.75rem", borderRadius: radius.lg, border: `1px solid ${c}40`, background: `${c}08`, textAlign: "center" }}>
                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: typography.bold, color: cssVar.textPrimary }}>{t.table}</p>
                                    <p style={{ margin: "0.2rem 0 0", fontSize: typography.xs, color: c, fontWeight: typography.semibold, textTransform: "capitalize" }}>{t.statut.replace("_", " ")}</p>
                                    <p style={{ margin: "0.1rem 0 0", fontSize: typography.xs, color: cssVar.textMuted }}>{gnf(t.montant)}</p>
                                </div>
                            );
                        })}
                    </div>
                </SectionCard>
            )}
        </div>
    );
}

// ── Dashboard Cuisine ──────────────────────────────────────────────────────

function CuisineDashboard({ d }: { d: CuisineData }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                <StatCard title="En attente"    value={d.nb_en_attente}    icon={Clock}         color="#ef4444" />
                <StatCard title="Prêtes"        value={d.nb_pretes}        icon={CheckCircle}   color="#22c55e" />
                <StatCard title="Attente max"   value={`${d.oldest_wait_mins} min`} icon={AlertTriangle} color="#f59e0b" />
                <StatCard title="Total 7j"      value={d.total_plats_7j ?? 0} icon={ChefHat}   color="#3b82f6" />
            </div>

            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
                <SectionCard title="Activité par heure">
                    <div style={{ padding: "1rem", height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d.par_heure}>
                                <XAxis dataKey="h" tick={{ fontSize: 10, fill: cssVar.textMuted }} />
                                <YAxis tick={{ fontSize: 10, fill: cssVar.textMuted }} width={25} allowDecimals={false} />
                                <Tooltip formatter={(v: unknown) => [Number(v ?? 0), "plats"]} contentStyle={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="n" fill="#f97316" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="Par catégorie">
                    <div style={{ padding: "1rem", height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={withFill(d.par_categorie)} dataKey="total" nameKey="label" cx="50%" cy="50%" innerRadius={40} outerRadius={65} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Tooltip formatter={(v: unknown) => [Number(v ?? 0), "plats"]} contentStyle={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>
            </div>

            {/* File des commandes */}
            <SectionCard title="File des commandes">
                {d.file_commandes.length === 0 ? (
                    <p style={{ padding: "1.5rem", textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, margin: 0 }}>Aucune commande en cours.</p>
                ) : d.file_commandes.map(c => (
                    <div key={c.id} style={{ padding: "0.875rem 1.25rem", borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                            <span style={{ fontSize: typography.sm, fontWeight: typography.bold, color: cssVar.textPrimary }}>#{c.id} · {c.table}</span>
                            <span style={{ fontSize: typography.xs, color: (c.attente_mins ?? 0) > 30 ? "#ef4444" : "#f59e0b", fontWeight: typography.semibold }}>{c.attente_mins ?? 0} min</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            {c.items.map((it, i) => (
                                <span key={i} style={{ fontSize: typography.xs, padding: "0.1rem 0.4rem", borderRadius: radius.full, background: cssVar.bgSectionAlt, color: cssVar.textSecondary }}>
                                    {it.quantite}× {it.plat}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </SectionCard>
        </div>
    );
}

// ── Dashboard Comptable ────────────────────────────────────────────────────

function ComptableDashboard({ d }: { d: ComptableData }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                <StatCard title="Solde caisse"       value={d.caisse.is_open ? gnf(d.caisse.solde) : "Fermée"}   icon={Wallet}      color={d.caisse.is_open ? "#22c55e" : "#ef4444"} />
                <StatCard title="Remises en attente" value={d.remises_en_attente}  icon={Clock}       color="#f59e0b" />
                <StatCard title="Dépenses du jour"   value={gnf(d.depenses_jour)}  icon={CreditCard}  color="#ef4444" />
                <StatCard title="Revenus du jour"    value={gnf(d.revenus_jour)}   icon={TrendingUp}  color="#22c55e" />
                <StatCard title="Solde générale"     value={gnf(d.solde_generale)} icon={Wallet}      color="#a855f7" />
            </div>

            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                <SectionCard title="Revenus vs Dépenses (7j)">
                    <div style={{ padding: "1rem", height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d.balance_7j}>
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: cssVar.textMuted }} />
                                <YAxis tick={{ fontSize: 10, fill: cssVar.textMuted }} width={55} tickFormatter={(v: unknown) => (Number(v ?? 0) / 1000).toFixed(0) + "k"} />
                                <Tooltip formatter={(v: unknown) => [gnf(Number(v ?? 0)), ""]} contentStyle={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="revenus"  name="Revenus"  fill="#22c55e" radius={[3, 3, 0, 0]} />
                                <Bar dataKey="depenses" name="Dépenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="Dernières remises">
                    {d.dernieres_remises.length === 0 ? (
                        <p style={{ padding: "1.5rem", textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, margin: 0 }}>Aucune remise.</p>
                    ) : d.dernieres_remises.map(r => (
                        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 1.25rem", borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
                            <div>
                                <p style={{ margin: 0, fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textPrimary }}>{r.serveur}</p>
                                <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted }}>{r.table} · {r.date}</p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ margin: 0, fontSize: typography.sm, fontWeight: typography.bold, color: cssVar.amberGlow }}>{gnf(r.montant)}</p>
                                <span style={{ fontSize: typography.xs, color: r.valide ? "#22c55e" : "#f59e0b" }}>{r.valide ? "Validée" : "En attente"}</span>
                            </div>
                        </div>
                    ))}
                </SectionCard>
            </div>
        </div>
    );
}

// ── Dashboard Table ────────────────────────────────────────────────────────

const STATUT_STEPS = ["en_attente", "prete", "servie", "payee"];
const STATUT_LABELS: Record<string, string> = { en_attente: "En attente", prete: "Prête", servie: "Servie", payee: "Payée" };

function TableDashboard({ d }: { d: TableData }) {
    const c = d.commande_active;
    const stepIdx = c ? STATUT_STEPS.indexOf(c.statut) : -1;
    const [addingId, setAddingId] = useState<number | null>(null);
    const [addedId, setAddedId]   = useState<number | null>(null);
    const [toast, setToast]       = useState<string | null>(null);

    const addSuggestion = async (s: { id: number; nom: string }) => {
        setAddingId(s.id);
        try {
            const res = await addToPanier(s.id, 1);
            if (res.success) {
                setAddedId(s.id);
                setToast(`${s.nom} ajouté au panier`);
                setTimeout(() => setAddedId((cur) => (cur === s.id ? null : cur)), 1500);
                setTimeout(() => setToast(null), 2500);
            } else {
                setToast(apiErrorMessage(res, "Impossible d'ajouter au panier."));
                setTimeout(() => setToast(null), 3000);
            }
        } catch {
            setToast("Erreur réseau.");
            setTimeout(() => setToast(null), 3000);
        }
        setAddingId(null);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {toast && (
                <div style={{ position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", zIndex: 200, padding: "0.7rem 1.25rem", borderRadius: radius.xl, background: "rgba(34,197,94,0.96)", color: "#fff", fontWeight: 700, fontSize: typography.sm, display: "flex", alignItems: "center", gap: "0.45rem", boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
                    <Check size={16} /> {toast}
                </div>
            )}
            {/* Commande active */}
            {c ? (
                <SectionCard title="Ma commande en cours">
                    <div style={{ padding: "1.25rem" }}>
                        {/* Barre progression */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                            {STATUT_STEPS.map((s, i) => (
                                <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i <= stepIdx ? cssVar.amberGlow : cssVar.bgSectionAlt, border: `2px solid ${i <= stepIdx ? cssVar.amberGlow : cssVar.borderSubtle}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: typography.xs, fontWeight: typography.bold, color: i <= stepIdx ? "#0c0a09" : cssVar.textMuted }}>
                                        {i <= stepIdx ? "✓" : i + 1}
                                    </div>
                                    <span style={{ fontSize: "0.65rem", color: i <= stepIdx ? cssVar.amberGlow : cssVar.textMuted, marginTop: "0.3rem", textAlign: "center" }}>{STATUT_LABELS[s]}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: "0.75rem", padding: "0.875rem", background: cssVar.bgSectionAlt, borderRadius: radius.lg }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                                <span style={{ fontSize: typography.sm, color: cssVar.textMuted }}>Commande #{c.id}</span>
                                <span style={{ fontSize: typography.sm, fontWeight: typography.bold, color: cssVar.amberGlow }}>{gnf(c.montant)}</span>
                            </div>
                            {c.items.map((it, i) => (
                                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: typography.xs, color: cssVar.textSecondary, padding: "0.15rem 0" }}>
                                    <span>{it.quantite}× {it.plat}</span>
                                    {it.prix && <span>{gnf(it.prix)}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </SectionCard>
            ) : (
                <div style={{ padding: "2rem", textAlign: "center", background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.xl }}>
                    <ShoppingCart size={32} style={{ color: cssVar.textMuted, margin: "0 auto 0.75rem" }} />
                    <p style={{ margin: 0, color: cssVar.textMuted, fontSize: typography.sm }}>Pas de commande en cours.</p>
                    <Link href="/menu" style={{ display: "inline-block", marginTop: "0.75rem", padding: "0.5rem 1.25rem", background: cssVar.amberGlow, color: "#0c0a09", borderRadius: radius.lg, fontSize: typography.sm, fontWeight: typography.bold, textDecoration: "none" }}>
                        Voir le menu
                    </Link>
                </div>
            )}

            {/* Suggestions */}
            {d.suggestions.length > 0 && (
                <SectionCard title="Suggestions">
                    <div style={{ display: "grid", gap: "0.75rem", padding: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                        {d.suggestions.map((s) => {
                            const busy = addingId === s.id;
                            const added = addedId === s.id;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => addSuggestion(s)}
                                    disabled={busy}
                                    title={`Ajouter ${s.nom} au panier`}
                                    style={{ textAlign: "left", cursor: busy ? "wait" : "pointer", padding: "0.75rem", background: added ? "rgba(34,197,94,0.1)" : cssVar.bgSectionAlt, borderRadius: radius.lg, border: `1px solid ${added ? "rgba(34,197,94,0.4)" : cssVar.borderSubtle}`, transition: "all .15s" }}
                                >
                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textPrimary }}>{s.nom}</p>
                                    <p style={{ margin: "0.2rem 0 0", fontSize: typography.xs, color: cssVar.amberGlow, fontWeight: typography.bold }}>{gnf(s.prix)}</p>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.3rem" }}>
                                        <span style={{ fontSize: "0.65rem", color: cssVar.textMuted }}>{s.commandes} commande{s.commandes > 1 ? "s" : ""}</span>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", fontSize: "0.65rem", fontWeight: typography.bold, color: added ? "#22c55e" : cssVar.amberGlow }}>
                                            {busy ? "…" : added ? <><Check size={11} /> Ajouté</> : <><Plus size={11} /> Panier</>}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </SectionCard>
            )}
        </div>
    );
}

// ── Dashboard Super Admin ──────────────────────────────────────────────────

function SuperAdminDashboard({ d }: { d: SuperadminData }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}>
                <StatCard title="Restaurants"        value={d.total_restaurants}      icon={TrendingUp} color={cssVar.amberGlow} />
                <StatCard title="Utilisateurs"       value={d.total_users}            icon={Users}      color="#3b82f6" />
                <StatCard title="CA global du jour"  value={gnf(d.revenus_global_jour)} icon={CreditCard} color="#22c55e" />
                <StatCard title="Commandes globales" value={d.commandes_global_jour}   icon={Utensils}   color="#a855f7" />
            </div>

            <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
                <SectionCard title="CA global (7 derniers jours)">
                    <div style={{ padding: "1rem", height: 220 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={d.revenus_7j}>
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: cssVar.textMuted }} />
                                <YAxis tick={{ fontSize: 10, fill: cssVar.textMuted }} width={55} tickFormatter={(v: unknown) => (Number(v ?? 0) / 1000).toFixed(0) + "k"} />
                                <Tooltip formatter={(v: unknown) => [gnf(Number(v ?? 0)), "CA"]} contentStyle={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="revenus" fill={cssVar.amberGlow} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </SectionCard>

                <SectionCard title="Par restaurant">
                    {d.stats_restaurants.map((r, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.875rem 1.25rem", borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
                            <span style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textPrimary }}>{r.nom}</span>
                            <div style={{ textAlign: "right" }}>
                                <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.amberGlow, fontWeight: typography.bold }}>{gnf(r.revenus_jour)}</p>
                                <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted }}>{r.commandes_actives} commande{r.commandes_actives !== 1 ? "s" : ""} actives</p>
                            </div>
                        </div>
                    ))}
                </SectionCard>
            </div>
        </div>
    );
}

// ── Dashboard Livreur ──────────────────────────────────────────────────────

function LivreurDashboard({ d }: { d: LivreurData }) {
    const k = d.kpis;
    return (
        <div style={{ display: "grid", gap: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.875rem" }}>
                <StatCard title="À expédier"      value={k.a_expedier}   icon={Package}     color={cssVar.amberGlow} />
                <StatCard title="En cours"        value={k.en_cours}     icon={Truck}       color="#8b5cf6" />
                <StatCard title="Livrées du jour" value={k.livrees_jour} icon={CheckCircle} color="#22c55e" />
            </div>
            <SectionCard title="Livraisons en cours">
                {d.livraisons.length === 0 ? (
                    <p style={{ padding: "1.25rem", margin: 0, color: cssVar.textMuted, fontSize: typography.sm }}>Aucune livraison active pour le moment.</p>
                ) : (
                    d.livraisons.map((l) => (
                        <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "0.75rem 1.25rem", borderTop: `1px solid ${cssVar.borderSubtle}` }}>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ margin: 0, fontWeight: 600, color: cssVar.textPrimary, fontSize: typography.sm }}>{l.client || "—"}</p>
                                <p style={{ margin: "2px 0 0", color: cssVar.textMuted, fontSize: typography.xs, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.adresse || "Adresse non précisée"}</p>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                <p style={{ margin: 0, fontWeight: 700, color: cssVar.amberGlow, fontSize: typography.sm }}>{gnf(l.montant)}</p>
                                <p style={{ margin: "2px 0 0", color: cssVar.textMuted, fontSize: typography.xs }}>{l.heure}</p>
                            </div>
                        </div>
                    ))
                )}
                <div style={{ padding: "0.875rem 1.25rem", borderTop: `1px solid ${cssVar.borderSubtle}` }}>
                    <Link href="/livraisons" style={btnOutline}>Ouvrir mes livraisons</Link>
                </div>
            </SectionCard>
        </div>
    );
}

// ── Page principale ────────────────────────────────────────────────────────

const WELCOME: Record<Role, string> = {
    Rsuper_admin:    "Vue globale de la plateforme resfly.",
    Radmin:          "Gérez votre équipe, votre menu et vos finances.",
    Rmanager:        "Supervisez les opérations et les performances.",
    Rserveur:        "Consultez vos tables et validez les paiements.",
    Rchef_cuisinier: "Gérez le menu et la file des commandes.",
    Rcuisinier:      "Consultez la file et marquez les plats comme prêts.",
    Rcomptable:      "Gérez votre caisse et suivez les dépenses.",
    Rlivreur:        "Consultez vos livraisons et faites-les avancer.",
    Rtable:          "Consultez le menu et suivez votre commande.",
    Rclient:         "Parcourez les restaurants et passez vos commandes.",
};

export default function DashboardPage() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState("");

    useEffect(() => {
        setDate(new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
    }, []);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setData(await getDashboardStats());
        } catch { /* silencieux */ } finally { setLoading(false); }
    }, []);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) router.replace("/auth/login");
        if (!authLoading && user?.role === "Rclient") { router.replace("/client"); return; }
        if (!authLoading && user?.must_change_password) router.replace("/auth/change-password");
        if (!authLoading && isAuthenticated && user?.role !== "Rclient") load();
    }, [authLoading, isAuthenticated, user, router, load]);

    if (authLoading || !user || user.role === "Rclient") return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: cssVar.bgDark }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${cssVar.borderSubtle}`, borderTopColor: cssVar.amberGlow, animation: "spin .75s linear infinite" }} />
        </div>
    );

    const role = user.role as Role;
    const rc = ROLE_COLORS[role];
    const initials = (user.nom_complet ?? user.login).slice(0, 2).toUpperCase();
    const firstName = user.nom_complet?.split(" ")[0] || user.login;

    return (
        <>
            <style>{`
            @keyframes spin{to{transform:rotate(360deg)}}
            @keyframes pulse{0%,100%{opacity:.6}50%{opacity:.3}}
            @media(prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;animation-iteration-count:1!important}}
        `}</style>

            <div style={{ minHeight: "100vh", background: cssVar.bgDark }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem", position: "relative", zIndex: 1 }}>

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
                        <div style={avatarBase(52)}>{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <h1 style={{ margin: 0, fontSize: typography["2xl"], fontWeight: typography.bold, color: cssVar.textPrimary }}>
                                Bonjour, {firstName} !
                            </h1>
                            <p style={{ margin: "0.2rem 0 0.5rem", fontSize: typography.sm, color: cssVar.textMuted }}>{WELCOME[role]}</p>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                <span style={roleBadge(rc.text)}>
                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: rc.text, display: "inline-block" }} />
                                    {ROLE_LABELS[role]}
                                </span>
                                {user.restaurant_nom && (
                                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted, display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                                        <MapPin size={11} /> {user.restaurant_nom}
                                    </span>
                                )}
                                <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>{date}</span>
                            </div>
                        </div>
                        <Link href="/profil" style={btnOutline}>Mon profil</Link>
                    </div>

                    {/* Contenu par rôle */}
                    {loading ? <Loader /> : !data ? (
                        <p style={{ color: cssVar.textMuted, fontSize: typography.sm }}>Impossible de charger les données.</p>
                    ) : (
                        <>
                            {data.type === "admin"      && <AdminDashboard      d={data} />}
                            {data.type === "serveur"    && <ServeurDashboard    d={data} />}
                            {data.type === "cuisine"    && <CuisineDashboard    d={data} />}
                            {data.type === "comptable"  && <ComptableDashboard  d={data} />}
                            {data.type === "livreur"    && <LivreurDashboard    d={data} />}
                            {data.type === "table"      && <TableDashboard      d={data} />}
                            {data.type === "superadmin" && <SuperAdminDashboard d={data} />}
                        </>
                    )}

                    <p style={{ textAlign: "center", marginTop: "2rem", fontSize: typography.xs, color: cssVar.textMuted }}>
                        resfly · {date}
                    </p>
                </div>
            </div>
        </>
    );
}
