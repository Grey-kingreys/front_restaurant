"use client";
// src/app/client/reservations/page.tsx — Réserver une table + mes réservations (Rclient)

import { useEffect, useState, useCallback } from "react";
import { CalendarDays, Users, Clock, Armchair, Check, X, AlertCircle, Store, Info } from "lucide-react";
import {
    listRestaurantsPublics, checkDisponibilite, reserver, getMesReservations, annulerReservation,
    type RestaurantPublic, type DisponibiliteCheck, type MaReservation,
} from "@/lib/api/public";

const STATUT_COLOR: Record<string, string> = {
    en_attente: "#f59e0b", confirmee: "#22c55e", refusee: "#ef4444",
    annulee: "#9ca3af", terminee: "#3b82f6", no_show: "#ef4444",
};

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatDateFr(iso: string) {
    try { return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "long" }); }
    catch { return iso; }
}

export default function ReservationsPage() {
    const [restos, setRestos] = useState<RestaurantPublic[]>([]);
    const [slug, setSlug] = useState("");
    const [date, setDate] = useState(todayStr());
    const [heure, setHeure] = useState("19:00");
    const [personnes, setPersonnes] = useState(2);
    const [note, setNote] = useState("");

    const [dispo, setDispo] = useState<DisponibiliteCheck | null>(null);
    const [checking, setChecking] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formMsg, setFormMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    const [reservations, setReservations] = useState<MaReservation[]>([]);
    const [loadingResas, setLoadingResas] = useState(true);

    const loadResas = useCallback(async () => {
        setLoadingResas(true);
        try {
            const res = await getMesReservations();
            if (res.success && res.data) setReservations(res.data.reservations);
        } catch { /* ignore */ }
        setLoadingResas(false);
    }, []);

    useEffect(() => {
        listRestaurantsPublics().then((res) => {
            if (res.success && res.data) {
                setRestos(res.data.restaurants);
                if (res.data.restaurants[0]) setSlug(res.data.restaurants[0].slug);
            }
        }).catch(() => {});
        loadResas();
    }, [loadResas]);

    // Réinitialise la vérification dès qu'un critère change
    const resetDispo = () => { setDispo(null); setFormMsg(null); };

    const verifier = useCallback(async () => {
        if (!slug) return;
        setChecking(true); setDispo(null); setFormMsg(null);
        try {
            const res = await checkDisponibilite(slug, { date, heure, personnes });
            if (res.success && res.data) setDispo(res.data);
            else setFormMsg({ type: "err", text: res.message || "Vérification impossible." });
        } catch {
            setFormMsg({ type: "err", text: "Serveur indisponible." });
        }
        setChecking(false);
    }, [slug, date, heure, personnes]);

    const handleReserver = async () => {
        setSubmitting(true); setFormMsg(null);
        try {
            const res = await reserver(slug, { date, heure, nombre_personnes: personnes, note });
            if (res.success) {
                setFormMsg({ type: "ok", text: res.message || "Réservation enregistrée." });
                setDispo(null); setNote("");
                loadResas();
            } else {
                const e = res.errors ? Object.values(res.errors as Record<string, string[]>).flat()[0] : null;
                setFormMsg({ type: "err", text: e || res.message || "Réservation impossible." });
            }
        } catch {
            setFormMsg({ type: "err", text: "Serveur indisponible. Réessayez." });
        }
        setSubmitting(false);
    };

    const handleAnnuler = async (id: number) => {
        if (!window.confirm("Annuler cette réservation ?")) return;
        const res = await annulerReservation(id);
        if (res.success) loadResas();
        else window.alert(res.message || "Annulation impossible.");
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "0.6rem 0.75rem", borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-subtle)", background: "var(--bg-card)",
        color: "var(--text-primary)", fontSize: "0.9rem", boxSizing: "border-box", outline: "none",
    };
    const labelStyle: React.CSSProperties = { display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.78rem", fontWeight: 600, color: "var(--text-muted)", marginBottom: "0.3rem" };

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "clamp(1rem, 4vw, 2rem)" }}>
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ margin: "0 0 0.25rem", fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 900, color: "var(--text-primary)" }}>Réserver une table</h1>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>Indiquez le créneau et le nombre de personnes — une table vous est attribuée automatiquement.</p>
            </div>

            {/* Formulaire de réservation */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "1.25rem", marginBottom: "2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0.875rem", marginBottom: "1rem" }}>
                    <div>
                        <label style={labelStyle}><Store size={13} />Restaurant</label>
                        <select value={slug} onChange={(e) => { setSlug(e.target.value); resetDispo(); }} style={inputStyle}>
                            {restos.map((r) => <option key={r.slug} value={r.slug}>{r.nom}</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}><CalendarDays size={13} />Date</label>
                        <input type="date" value={date} min={todayStr()} onChange={(e) => { setDate(e.target.value); resetDispo(); }} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}><Clock size={13} />Heure</label>
                        <input type="time" value={heure} onChange={(e) => { setHeure(e.target.value); resetDispo(); }} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}><Users size={13} />Personnes</label>
                        <input type="number" min={1} max={50} value={personnes} onChange={(e) => { setPersonnes(Math.max(1, Number(e.target.value) || 1)); resetDispo(); }} style={inputStyle} />
                    </div>
                </div>

                <div>
                    <label style={labelStyle}>Note (optionnel)</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Demande spéciale, occasion…"
                        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
                </div>

                <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginTop: "1rem" }}>
                    <button onClick={verifier} disabled={!slug || checking}
                        style={{ padding: "0.65rem 1.1rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: "var(--text-primary)", fontWeight: 700, fontSize: "0.88rem", cursor: slug ? "pointer" : "not-allowed" }}>
                        {checking ? "Vérification…" : "Vérifier la disponibilité"}
                    </button>
                    <button onClick={handleReserver} disabled={!slug || submitting}
                        style={{ flex: 1, minWidth: 180, padding: "0.65rem 1.25rem", borderRadius: "var(--radius-lg)", border: "none", background: (!slug || submitting) ? "rgba(245,158,11,0.5)" : "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0c0a09", fontWeight: 800, fontSize: "0.9rem", cursor: (!slug || submitting) ? "not-allowed" : "pointer" }}>
                        {submitting ? "Envoi…" : "Réserver"}
                    </button>
                </div>

                {/* Résultat de la vérification */}
                {dispo && (
                    <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 0.9rem", borderRadius: "var(--radius-lg)", fontSize: "0.82rem", background: dispo.disponible ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${dispo.disponible ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, color: dispo.disponible ? "#22c55e" : "#ef4444" }}>
                        {dispo.disponible ? <Check size={15} /> : <AlertCircle size={15} />}
                        <span>{dispo.message}{dispo.disponible && ` — durée prévue ${dispo.duree_minutes} min (jusqu'à ${dispo.heure_fin}).`}</span>
                    </div>
                )}

                {formMsg && (
                    <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 0.9rem", borderRadius: "var(--radius-lg)", fontSize: "0.82rem", background: formMsg.type === "ok" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${formMsg.type === "ok" ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, color: formMsg.type === "ok" ? "#22c55e" : "#ef4444" }}>
                        {formMsg.type === "ok" ? <Check size={15} /> : <AlertCircle size={15} />}
                        {formMsg.text}
                    </div>
                )}

                <p style={{ display: "flex", alignItems: "center", gap: "0.4rem", margin: "0.9rem 0 0", fontSize: "0.74rem", color: "var(--text-muted)" }}>
                    <Info size={12} /> Votre table vous sera indiquée à l'arrivée. La durée dépend du nombre de personnes.
                </p>
            </div>

            {/* Mes réservations */}
            <h2 style={{ margin: "0 0 0.875rem", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>Mes réservations</h2>
            {loadingResas ? (
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Chargement…</p>
            ) : reservations.length === 0 ? (
                <div style={{ background: "var(--bg-card)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <CalendarDays size={28} style={{ opacity: 0.4, marginBottom: "0.5rem" }} />
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>Aucune réservation pour l'instant.</p>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.7rem" }}>
                    {reservations.map((r) => {
                        const color = STATUT_COLOR[r.statut] ?? "#9ca3af";
                        return (
                            <div key={r.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{ width: 42, height: 42, borderRadius: "var(--radius-lg)", flexShrink: 0, background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color }}>
                                    <Armchair size={20} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "0.95rem" }}>{r.restaurant}</div>
                                    <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                                        {formatDateFr(r.date_reservation)} · {r.heure}–{r.heure_fin} · {r.nombre_personnes} pers.
                                    </div>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", flexShrink: 0 }}>
                                    <span style={{ padding: "2px 9px", borderRadius: "var(--radius-full)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", color, fontSize: "0.68rem", fontWeight: 700 }}>{r.statut_label}</span>
                                    {r.annulable && (
                                        <button onClick={() => handleAnnuler(r.id)} style={{ display: "flex", alignItems: "center", gap: "0.2rem", padding: "0.25rem 0.6rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "none", color: "var(--text-muted)", fontSize: "0.72rem", cursor: "pointer" }}>
                                            <X size={11} />Annuler
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
