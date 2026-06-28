"use client";
// src/app/reservations/page.tsx — Gestion des réservations (staff)

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    listReservations, confirmerReservation, refuserReservation,
    reaffecterReservation, terminerReservation, noShowReservation,
    bloquerClientReservation, debloquerClientReservation, listTables,
    type ReservationStaff, type Table,
} from "@/lib/api/restaurant";
import { cssVar, typography, radius, spacing } from "@/theme/theme";
import { CalendarDays, Users, Clock, Armchair, Check, X, Phone, Mail, AlertCircle, AlertTriangle, Ban, ShieldCheck, Repeat, CheckCheck, UserX } from "lucide-react";

const STATUT_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    en_attente: { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    confirmee:  { label: "Confirmée",  color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)" },
    refusee:    { label: "Refusée",    color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)" },
    annulee:    { label: "Annulée",    color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.25)" },
    terminee:   { label: "Terminée",   color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)" },
    no_show:    { label: "Absent",     color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)" },
};

const TABS: { value: string; label: string }[] = [
    { value: "", label: "Toutes" },
    { value: "en_attente", label: "En attente" },
    { value: "confirmee", label: "Confirmées" },
    { value: "terminee", label: "Terminées" },
    { value: "no_show", label: "Absents" },
    { value: "refusee", label: "Refusées" },
    { value: "annulee", label: "Annulées" },
];

function formatDateFr(iso: string) {
    try { return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }); }
    catch { return iso; }
}

export default function ReservationsStaffPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [resas, setResas] = useState<ReservationStaff[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtre, setFiltre] = useState("");
    const [actionId, setActionId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reaffectId, setReaffectId] = useState<number | null>(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await listReservations(filtre || undefined);
            if (res.success && res.data) setResas(res.data.reservations);
            else setError(res.message || "Impossible de charger les réservations.");
        } catch {
            setError("Serveur indisponible.");
        }
        setLoading(false);
    }, [filtre]);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) { router.replace("/auth/login"); return; }
        if (!isLoading && user?.role === "Rclient") { router.replace("/client"); return; }
        if (!isLoading && isAuthenticated) {
            load();
            listTables().then((r) => { if (r.success && r.data) setTables(r.data.tables); }).catch(() => {});
        }
    }, [isLoading, isAuthenticated, user, router, load]);

    const run = async (id: number, fn: () => Promise<{ success: boolean; message?: string }>) => {
        setActionId(id);
        try {
            const res = await fn();
            if (res.success) { setReaffectId(null); load(); }
            else window.alert(res.message || "Action impossible.");
        } catch { window.alert("Serveur indisponible."); }
        setActionId(null);
    };

    const handleReaffecter = async (id: number, tableId: number) => {
        if (!tableId) return;
        run(id, () => reaffecterReservation(id, tableId));
    };

    const btn = (bg: string, color: string, border = "none"): React.CSSProperties => ({
        display: "flex", alignItems: "center", gap: "0.3rem", padding: "0.5rem 0.8rem",
        borderRadius: "0.6rem", border, background: bg, color, fontWeight: 700, fontSize: "0.78rem", cursor: "pointer",
    });

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-dark)" }} className="rp-page-pad">
            <style>{`@keyframes spin{to{transform:rotate(360deg)}} .rp-page-pad{padding:clamp(1rem,4vw,2rem)}`}</style>
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ marginBottom: spacing["5"] }}>
                    <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary }}>Réservations</h1>
                    <p style={{ margin: "4px 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>Gérez les réservations : confirmation, table attribuée, présence, absences.</p>
                </div>

                {/* Filtres */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: spacing["5"] }}>
                    {TABS.map((t) => (
                        <button key={t.value} onClick={() => setFiltre(t.value)}
                            style={{ padding: "0.45rem 0.95rem", borderRadius: "99px", cursor: "pointer", border: `1px solid ${filtre === t.value ? cssVar.amberGlow : cssVar.borderSubtle}`, background: filtre === t.value ? "rgba(245,158,11,0.12)" : "transparent", color: filtre === t.value ? cssVar.amberGlow : cssVar.textMuted, fontSize: typography.sm, fontWeight: 600 }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", color: cssVar.textMuted, gap: "0.75rem" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                        Chargement…
                    </div>
                ) : error ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "3rem", color: cssVar.textMuted }}>
                        <AlertCircle size={30} style={{ opacity: 0.4 }} />
                        <p style={{ margin: 0 }}>{error}</p>
                    </div>
                ) : resas.length === 0 ? (
                    <div style={{ background: cssVar.bgCard, border: `1px dashed ${cssVar.borderSubtle}`, borderRadius: radius.xl, padding: "3rem", textAlign: "center", color: cssVar.textMuted }}>
                        <CalendarDays size={32} style={{ opacity: 0.4, marginBottom: "0.75rem" }} />
                        <p style={{ margin: 0 }}>Aucune réservation{filtre ? " dans cette catégorie" : ""}.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {resas.map((r) => {
                            const sc = STATUT_CONFIG[r.statut] ?? STATUT_CONFIG.annulee;
                            const busy = actionId === r.id;
                            const actif = r.statut === "en_attente" || r.statut === "confirmee";
                            return (
                                <div key={r.id} style={{ background: cssVar.bgCard, border: `1px solid ${r.client_a_risque ? "rgba(239,68,68,0.4)" : cssVar.borderSubtle}`, borderRadius: radius.xl, padding: "1rem 1.25rem", display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                                    <div style={{ width: 44, height: 44, borderRadius: "0.7rem", flexShrink: 0, background: sc.bg, border: `1px solid ${sc.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: sc.color }}>
                                        <Armchair size={20} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 220 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                                            <span style={{ fontWeight: 800, color: cssVar.textPrimary, fontSize: typography.base }}>
                                                {r.table_numero ? `Table ${r.table_numero}` : "Table non attribuée"}
                                            </span>
                                            <span style={{ padding: "2px 9px", borderRadius: "99px", background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color, fontSize: "0.7rem", fontWeight: 700 }}>{r.statut_label}</span>
                                            {r.client_bloque && (
                                                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "2px 9px", borderRadius: "99px", background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: "0.68rem", fontWeight: 700 }}>
                                                    <Ban size={11} />Bloqué
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: cssVar.textSecondary, marginTop: "0.3rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><CalendarDays size={12} />{formatDateFr(r.date_reservation)}</span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Clock size={12} />{r.heure}–{r.heure_fin}</span>
                                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}><Users size={12} />{r.nombre_personnes} pers.</span>
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: cssVar.textMuted, marginTop: "0.35rem" }}>
                                            <b style={{ color: cssVar.textSecondary }}>{r.client_nom}</b>
                                            {r.client_telephone && <span style={{ marginLeft: "0.6rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Phone size={11} />{r.client_telephone}</span>}
                                            {r.client_email && <span style={{ marginLeft: "0.6rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}><Mail size={11} />{r.client_email}</span>}
                                        </div>
                                        {r.client_a_risque && (
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.4rem", fontSize: "0.76rem", fontWeight: 700, color: "#ef4444" }}>
                                                <AlertTriangle size={13} />Client à risque — {r.no_show_count} absence(s) enregistrée(s).
                                            </div>
                                        )}
                                        {r.note && <p style={{ margin: "0.4rem 0 0", fontSize: "0.78rem", color: cssVar.textMuted, fontStyle: "italic" }}>« {r.note} »</p>}

                                        {/* Réaffectation de table */}
                                        {actif && reaffectId === r.id && (
                                            <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                                                <select defaultValue="" disabled={busy} onChange={(e) => handleReaffecter(r.id, Number(e.target.value))}
                                                    style={{ padding: "0.4rem 0.6rem", borderRadius: "0.5rem", border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgDark, color: cssVar.textPrimary, fontSize: "0.78rem" }}>
                                                    <option value="" disabled>Choisir une table…</option>
                                                    {tables.filter((t) => t.nombre_places >= r.nombre_personnes).map((t) => (
                                                        <option key={t.id} value={t.id}>Table {t.numero_table} ({t.nombre_places} pl.)</option>
                                                    ))}
                                                </select>
                                                <button onClick={() => setReaffectId(null)} style={btn("transparent", cssVar.textMuted, `1px solid ${cssVar.borderSubtle}`)}>Annuler</button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flexShrink: 0, opacity: busy ? 0.6 : 1, pointerEvents: busy ? "none" : "auto" }}>
                                        {r.statut === "en_attente" && (
                                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                                <button onClick={() => run(r.id, () => confirmerReservation(r.id))} style={btn("#22c55e", "#06240f")}><Check size={14} />Confirmer</button>
                                                <button onClick={() => run(r.id, () => refuserReservation(r.id))} style={btn("rgba(239,68,68,0.08)", "#ef4444", "1px solid rgba(239,68,68,0.4)")}><X size={14} />Refuser</button>
                                            </div>
                                        )}
                                        {actif && (
                                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                                                <button onClick={() => setReaffectId(reaffectId === r.id ? null : r.id)} style={btn("var(--bg-section-alt)", cssVar.textPrimary, `1px solid ${cssVar.borderSubtle}`)}><Repeat size={13} />Réaffecter</button>
                                                <button onClick={() => run(r.id, () => terminerReservation(r.id))} style={btn("rgba(59,130,246,0.1)", "#3b82f6", "1px solid rgba(59,130,246,0.3)")}><CheckCheck size={13} />Présent</button>
                                                <button onClick={() => run(r.id, () => noShowReservation(r.id))} style={btn("rgba(239,68,68,0.08)", "#ef4444", "1px solid rgba(239,68,68,0.3)")}><UserX size={13} />Absent</button>
                                            </div>
                                        )}
                                        {(r.client_a_risque || r.client_bloque) && (
                                            <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                                {r.client_bloque ? (
                                                    <button onClick={() => run(r.id, () => debloquerClientReservation(r.id))} style={btn("rgba(34,197,94,0.1)", "#22c55e", "1px solid rgba(34,197,94,0.3)")}><ShieldCheck size={13} />Débloquer le client</button>
                                                ) : (
                                                    <button onClick={() => { if (window.confirm("Bloquer ce client pour les réservations de votre restaurant ?")) run(r.id, () => bloquerClientReservation(r.id)); }} style={btn("transparent", "#ef4444", "1px solid rgba(239,68,68,0.3)")}><Ban size={13} />Bloquer le client</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
