"use client";
// src/app/caisse/remises/page.tsx
// Remises serveurs — liste des remises physiques à valider

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { listRemises, validerRemise } from "@/lib/api/paiements";
import type { RemiseServeur } from "@/lib/api/paiements";
import {
    cssVar, typography, radius, spacing,
    cardBase, cardSection, btnPrimary, btnOutline,
    inputStyle, alertAmber, alertError, sectionHead, sectionHeadTitle,
} from "@/theme/theme";

// ── Helpers ────────────────────────────────────────────────────────────────

const gnf = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "—";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return isNaN(n) ? "—" : n.toLocaleString("fr-FR") + " GNF";
};

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });

// ── Badge statut remise ────────────────────────────────────────────────────

const STATUT_CFG = {
    validee:               { label: "Validée",     bg: "rgba(34,197,94,.10)",  text: "#22c55e", border: "rgba(34,197,94,.25)" },
    en_attente_validation: { label: "En attente",  bg: "rgba(245,158,11,.10)", text: "#f59e0b", border: "rgba(245,158,11,.25)" },
    en_attente_remise:     { label: "Non remise",  bg: "rgba(148,163,184,.10)", text: "#94a3b8", border: "rgba(148,163,184,.25)" },
} as const;

function StatutBadge({ statut }: { statut: keyof typeof STATUT_CFG }) {
    const cfg = STATUT_CFG[statut] ?? STATUT_CFG.en_attente_remise;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "0.15rem 0.5rem", borderRadius: radius.full, fontSize: typography.xs, fontWeight: typography.semibold, background: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.text }} />
            {cfg.label}
        </span>
    );
}

// ── Modal Valider ──────────────────────────────────────────────────────────

function ModalValider({
    remise,
    onClose,
    onDone,
}: { remise: RemiseServeur; onClose: () => void; onDone: () => void }) {
    const [montantPhysique, setMontantPhysique] = useState("");
    const [motifEcart, setMotifEcart] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const virtuel = parseFloat(remise.montant_virtuel);
    const physique = parseFloat(montantPhysique);
    const ecart = !isNaN(physique) ? physique - virtuel : null;
    const showMotifEcart = ecart !== null && ecart !== 0;

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        setErr("");
        if (isNaN(physique) || physique < 0) { setErr("Montant physique invalide."); return; }
        if (showMotifEcart && motifEcart.trim().length < 5) { setErr("Motif d'écart requis (min 5 caractères)."); return; }
        setLoading(true);
        try {
            const payload: { montant_physique: number; motif_ecart?: string } = { montant_physique: physique };
            if (showMotifEcart) payload.motif_ecart = motifEcart.trim();
            const res = await validerRemise(remise.id, payload);
            if (res.success) { onDone(); }
            else setErr(res.message || "Erreur lors de la validation.");
        } catch {
            setErr("Erreur lors de la validation.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <div style={{ ...cardBase, padding: "1.5rem", width: "100%", maxWidth: 460 }}>
                <h3 style={{ margin: "0 0 0.25rem", fontSize: typography.lg, fontWeight: typography.bold, color: cssVar.textPrimary }}>
                    Valider la remise
                </h3>
                <p style={{ margin: "0 0 1rem", fontSize: typography.sm, color: cssVar.textSecondary }}>
                    Serveur : <strong>{remise.serveur_login ?? "—"}</strong> · Commande #{remise.commande_id} · Montant virtuel : <strong style={{ color: cssVar.textPrimary }}>{gnf(remise.montant_virtuel)}</strong>
                </p>
                {err && <div style={{ ...alertError, marginBottom: "0.75rem" }}>{err}</div>}
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <div>
                        <label style={labelStyle}>Montant physique reçu (GNF)</label>
                        <input type="number" min="0" value={montantPhysique} onChange={e => setMontantPhysique(e.target.value)} style={inputStyle} placeholder={`ex. ${Math.round(virtuel)}`} />
                    </div>
                    {ecart !== null && (
                        <div style={{ ...alertAmber, display: "flex", justifyContent: "space-between" }}>
                            <span>Écart</span>
                            <strong style={{ color: ecart === 0 ? "#22c55e" : "#f59e0b" }}>
                                {ecart >= 0 ? "+" : ""}{gnf(ecart)}
                            </strong>
                        </div>
                    )}
                    {showMotifEcart && (
                        <div>
                            <label style={labelStyle}>Motif de l&apos;écart <span style={{ color: "#ef4444" }}>*</span></label>
                            <input type="text" value={motifEcart} onChange={e => setMotifEcart(e.target.value)} style={inputStyle} placeholder="ex. Monnaie rendue par le serveur" />
                        </div>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", marginTop: "0.25rem" }}>
                        <button type="button" onClick={onClose} style={{ ...btnOutline, padding: "0.5rem 1rem" }}>Annuler</button>
                        <button type="submit" disabled={loading} style={{ ...btnPrimary, padding: "0.5rem 1.25rem", fontSize: typography.sm }}>
                            {loading ? "…" : "Valider"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: "0.35rem",
    fontSize: typography.xs,
    fontWeight: typography.semibold,
    color: cssVar.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
};

// ── Ligne de remise ────────────────────────────────────────────────────────

function RemiseRow({ r, onValider }: { r: RemiseServeur; onValider: (r: RemiseServeur) => void }) {
    const canValider = !r.valide;
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: `1px solid ${cssVar.borderSubtle}`, gap: "0.75rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", flex: 1, minWidth: 160 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: typography.sm, fontWeight: typography.medium, color: cssVar.textPrimary }}>
                        {r.serveur_login ?? `Serveur #${r.serveur}`}
                    </span>
                    <StatutBadge statut={r.statut} />
                </div>
                <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                    Commande #{r.commande_id} · {fmtDate(r.created_at)}
                </span>
                {r.validee_par_login && (
                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                        Validée par {r.validee_par_login}
                    </span>
                )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.2rem", flexShrink: 0 }}>
                <span style={{ fontSize: typography.sm, fontWeight: typography.bold, color: cssVar.textPrimary }}>
                    {gnf(r.montant_virtuel)}
                </span>
                {r.montant_physique && (
                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                        Physique : {gnf(r.montant_physique)}
                    </span>
                )}
            </div>
            {canValider && (
                <button onClick={() => onValider(r)} style={{ ...btnOutline, padding: "0.35rem 0.875rem", flexShrink: 0 }}>
                    Valider
                </button>
            )}
        </div>
    );
}

// ── Page principale ────────────────────────────────────────────────────────

type Filter = "en_attente" | "toutes";

export default function RemisesPage() {
    const { user, isLoading: authLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [remises, setRemises] = useState<RemiseServeur[]>([]);
    const [filter, setFilter] = useState<Filter>("en_attente");
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [selectedRemise, setSelectedRemise] = useState<RemiseServeur | null>(null);

    const fetchRemises = useCallback(async (f: Filter) => {
        setLoading(true);
        setErr("");
        try {
            const params = f === "en_attente" ? { valide: false } : undefined;
            const res = await listRemises(params);
            if (res.success && res.data) setRemises(res.data.remises);
            else setErr(res.message || "Impossible de charger les remises.");
        } catch {
            setErr("Erreur lors du chargement des remises.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authLoading) {
            if (!user || !hasPermission("manage_caisse_comptable")) {
                router.replace("/dashboard");
                return;
            }
            fetchRemises(filter);
        }
    }, [authLoading, user, router, fetchRemises, filter]);

    function handleFilterChange(f: Filter) {
        setFilter(f);
    }

    function handleValiderDone() {
        setSelectedRemise(null);
        fetchRemises(filter);
    }

    if (authLoading || loading) {
        return (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${cssVar.borderSubtle}`, borderTopColor: cssVar.amberGlow, animation: "spin 0.7s linear infinite" }} />
            </div>
        );
    }

    const enAttente = remises.filter(r => !r.valide);

    return (
        <div style={{ padding: `${spacing["6"]} ${spacing["6"]}`, maxWidth: 880, margin: "0 auto" }}>
            {/* En-tête */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: spacing["5"], gap: "1rem", flexWrap: "wrap" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: typography["2xl"], fontWeight: typography.bold, color: cssVar.textPrimary }}>
                        Remises serveurs
                    </h1>
                    <p style={{ margin: "0.25rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                        Validez les remises physiques des serveurs
                    </p>
                </div>
                {enAttente.length > 0 && filter === "en_attente" && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "0.35rem 0.75rem", borderRadius: radius.full, fontSize: typography.sm, fontWeight: typography.bold, background: "rgba(245,158,11,.12)", color: "#f59e0b", border: "1px solid rgba(245,158,11,.25)" }}>
                        {enAttente.length} en attente
                    </span>
                )}
            </div>

            {err && <div style={{ ...alertError, marginBottom: spacing["4"] }}>{err}</div>}

            {/* Filtres */}
            <div style={{ display: "flex", gap: spacing["2"], marginBottom: spacing["4"] }}>
                {(["en_attente", "toutes"] as Filter[]).map(f => (
                    <button
                        key={f}
                        onClick={() => handleFilterChange(f)}
                        style={{
                            padding: "0.45rem 1rem",
                            borderRadius: radius.lg,
                            border: `1px solid ${filter === f ? cssVar.borderAmberHover : cssVar.borderSubtle}`,
                            background: filter === f ? "rgba(245,158,11,.08)" : "transparent",
                            color: filter === f ? cssVar.amberGlow : cssVar.textSecondary,
                            fontWeight: filter === f ? typography.semibold : typography.normal,
                            fontSize: typography.sm,
                            cursor: "pointer",
                        }}
                    >
                        {f === "en_attente" ? "En attente" : "Toutes"}
                    </button>
                ))}
            </div>

            {/* Liste */}
            <div style={cardSection}>
                <div style={sectionHead}>
                    <p style={sectionHeadTitle}>{filter === "en_attente" ? "Remises à valider" : "Toutes les remises"}</p>
                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                        {remises.length} remise{remises.length !== 1 ? "s" : ""}
                    </span>
                </div>
                {remises.length === 0 ? (
                    <p style={{ margin: 0, padding: "2rem 1rem", textAlign: "center", fontSize: typography.sm, color: cssVar.textMuted }}>
                        {filter === "en_attente" ? "Aucune remise en attente." : "Aucune remise enregistrée."}
                    </p>
                ) : (
                    remises.map(r => (
                        <RemiseRow key={r.id} r={r} onValider={setSelectedRemise} />
                    ))
                )}
            </div>

            {/* Modal */}
            {selectedRemise && (
                <ModalValider
                    remise={selectedRemise}
                    onClose={() => setSelectedRemise(null)}
                    onDone={handleValiderDone}
                />
            )}
        </div>
    );
}
