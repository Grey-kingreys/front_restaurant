"use client";
// src/app/commandes/nouvelle/page.tsx
// Prise de commande par le serveur : choisir une table + composer la commande.

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { listTables, type Table } from "@/lib/api/restaurant";
import { listPlats, type Plat, type Categorie } from "@/lib/api/menu";
import { creerCommandeServeur } from "@/lib/api/commandes";
import { cssVar, typography, radius, spacing as sp } from "@/theme/theme";

// Alias nommés vers l'échelle numérique de `spacing` (Tailwind-like).
const spacing = { xs: sp["1"], sm: sp["2"], md: sp["4"], lg: sp["5"], xl: sp["8"] };
import { ArrowLeft, Plus, Minus, Check, Loader2, ClipboardList, Utensils } from "lucide-react";

const CAT_ORDER: Categorie[] = ["ENTREE", "PLAT", "ACCOMPAGNEMENT", "DESSERT", "BOISSON"];
const CAT_LABELS: Record<string, string> = {
    ENTREE: "Entrées",
    PLAT: "Plats",
    ACCOMPAGNEMENT: "Accompagnements",
    DESSERT: "Desserts",
    BOISSON: "Boissons",
};

const fmt = (n: number) => n.toLocaleString("fr-FR");

export default function NouvelleCommandePage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [tables, setTables] = useState<Table[]>([]);
    const [plats, setPlats] = useState<Plat[]>([]);
    const [loading, setLoading] = useState(true);
    const [tableId, setTableId] = useState<number | null>(null);
    const [cart, setCart] = useState<Record<number, number>>({});
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Garde : réservé aux rôles qui gèrent les commandes (serveur/admin/manager)
    useEffect(() => {
        if (!isLoading && user && !hasPermission("manage_commandes")) {
            router.replace("/dashboard");
        }
    }, [isLoading, user, hasPermission, router]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [t, p] = await Promise.all([listTables(), listPlats({ disponible: true })]);
        if (t.success && t.data) setTables(t.data.tables);
        if (p.success && p.data) setPlats(p.data.plats);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isAuthenticated) fetchData();
    }, [isAuthenticated, fetchData]);

    const platsById = useMemo(() => {
        const m: Record<number, Plat> = {};
        plats.forEach((p) => (m[p.id] = p));
        return m;
    }, [plats]);

    const platsByCat = useMemo(() => {
        const groups: Record<string, Plat[]> = {};
        plats.forEach((p) => {
            (groups[p.categorie] ??= []).push(p);
        });
        return groups;
    }, [plats]);

    const setQty = (platId: number, qty: number) => {
        const q = Math.max(0, Math.min(50, qty));
        setCart((prev) => {
            const next = { ...prev };
            if (q === 0) delete next[platId];
            else next[platId] = q;
            return next;
        });
    };

    const { count, total } = useMemo(() => {
        let count = 0;
        let total = 0;
        for (const [id, q] of Object.entries(cart)) {
            const plat = platsById[Number(id)];
            if (!plat) continue;
            count += q;
            total += parseFloat(plat.prix_unitaire) * q;
        }
        return { count, total };
    }, [cart, platsById]);

    const canSubmit = tableId !== null && count > 0 && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit || tableId === null) return;
        setSubmitting(true);
        setError(null);
        const items = Object.entries(cart)
            .filter(([, q]) => q > 0)
            .map(([id, q]) => ({ plat_id: Number(id), quantite: q }));
        const res = await creerCommandeServeur({ table_id: tableId, items });
        if (res.success) {
            router.push("/commandes");
        } else {
            setSubmitting(false);
            setError(res.message || "La création de la commande a échoué.");
        }
    };

    if (isLoading || !hasPermission("manage_commandes")) return null;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: `${spacing.lg} ${spacing.md} 7rem` }}>
            {/* En-tête */}
            <Link
                href="/commandes"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", color: cssVar.textSecondary, fontSize: typography.sm, textDecoration: "none", marginBottom: spacing.sm }}
            >
                <ArrowLeft size={15} /> Commandes
            </Link>
            <h1 style={{ margin: `0 0 ${spacing.lg}`, fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary, fontSize: "1.9rem" }}>
                Nouvelle commande
            </h1>

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                    <Loader2 size={26} style={{ color: cssVar.textMuted, animation: "spin 0.8s linear infinite" }} />
                </div>
            ) : (
                <>
                    {/* 1. Choix de la table */}
                    <section style={{ marginBottom: spacing.xl }}>
                        <p style={{ fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cssVar.textMuted, margin: `0 0 ${spacing.sm}` }}>
                            1 · Table
                        </p>
                        {tables.length === 0 ? (
                            <p style={{ color: cssVar.textMuted, fontSize: typography.sm }}>Aucune table configurée.</p>
                        ) : (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                                {tables.map((t) => {
                                    const active = tableId === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setTableId(t.id)}
                                            style={{
                                                display: "inline-flex", alignItems: "center", gap: "0.4rem",
                                                padding: "0.5rem 0.9rem", borderRadius: radius.full,
                                                border: `1px solid ${active ? "var(--border-amber-hover)" : "var(--border-subtle)"}`,
                                                background: active ? "var(--bg-section-alt)" : "transparent",
                                                color: active ? cssVar.amberGlow : cssVar.textSecondary,
                                                fontWeight: active ? 700 : 500, fontSize: typography.sm, cursor: "pointer",
                                            }}
                                        >
                                            <Utensils size={13} /> Table {t.numero_table}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* 2. Choix des plats */}
                    <section>
                        <p style={{ fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cssVar.textMuted, margin: `0 0 ${spacing.sm}` }}>
                            2 · Plats
                        </p>
                        {CAT_ORDER.filter((c) => platsByCat[c]?.length).map((cat) => (
                            <div key={cat} style={{ marginBottom: spacing.lg }}>
                                <p style={{ fontSize: typography.sm, fontWeight: 700, color: cssVar.textPrimary, margin: `0 0 ${spacing.xs}` }}>
                                    {CAT_LABELS[cat] || cat}
                                </p>
                                <div style={{ display: "grid", gap: "0.5rem" }}>
                                    {platsByCat[cat].map((p) => {
                                        const qty = cart[p.id] || 0;
                                        return (
                                            <div
                                                key={p.id}
                                                style={{
                                                    display: "flex", alignItems: "center", gap: spacing.sm,
                                                    padding: "0.7rem 0.9rem", borderRadius: radius.lg,
                                                    border: `1px solid ${qty > 0 ? "var(--border-amber-hover)" : "var(--border-subtle)"}`,
                                                    background: cssVar.bgCard,
                                                }}
                                            >
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <p style={{ margin: 0, fontWeight: 600, color: cssVar.textPrimary, fontSize: typography.sm }}>{p.nom}</p>
                                                    <p style={{ margin: "0.1rem 0 0", color: cssVar.textMuted, fontSize: typography.xs }}>
                                                        {fmt(parseFloat(p.prix_unitaire))} GNF
                                                    </p>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <button
                                                        onClick={() => setQty(p.id, qty - 1)}
                                                        disabled={qty === 0}
                                                        aria-label="Retirer"
                                                        style={{ width: 30, height: 30, borderRadius: radius.md, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textSecondary, cursor: qty === 0 ? "not-allowed" : "pointer", opacity: qty === 0 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span style={{ minWidth: 18, textAlign: "center", fontWeight: 700, color: cssVar.textPrimary, fontSize: typography.sm }}>{qty}</span>
                                                    <button
                                                        onClick={() => setQty(p.id, qty + 1)}
                                                        aria-label="Ajouter"
                                                        style={{ width: 30, height: 30, borderRadius: radius.md, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.amberGlow, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </section>
                </>
            )}

            {/* Récapitulatif + validation (barre collante) */}
            {!loading && (
                <div
                    style={{
                        position: "sticky", bottom: spacing.md, marginTop: spacing.lg,
                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing.md,
                        padding: `${spacing.sm} ${spacing.md}`, borderRadius: radius.xl,
                        background: cssVar.bgCard, border: "1px solid var(--border-subtle)",
                        boxShadow: "var(--shadow-card-hover)",
                    }}
                >
                    <div>
                        <p style={{ margin: 0, fontWeight: 700, color: cssVar.textPrimary }}>{fmt(total)} GNF</p>
                        <p style={{ margin: 0, color: cssVar.textMuted, fontSize: typography.xs }}>
                            {count === 0 ? "Aucun article" : `${count} article${count > 1 ? "s" : ""}`}
                            {tableId === null ? " · sélectionnez une table" : ""}
                        </p>
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.7rem 1.4rem", borderRadius: radius.lg, border: "none",
                            background: canSubmit ? "var(--gradient-btn)" : "var(--bg-section-alt)",
                            color: canSubmit ? "#1c1917" : cssVar.textMuted,
                            fontWeight: 700, fontSize: typography.sm,
                            cursor: canSubmit ? "pointer" : "not-allowed", whiteSpace: "nowrap",
                        }}
                    >
                        {submitting ? <Loader2 size={15} style={{ animation: "spin 0.8s linear infinite" }} /> : <ClipboardList size={15} />}
                        {submitting ? "Envoi…" : "Valider la commande"}
                    </button>
                </div>
            )}

            {error && (
                <p style={{ marginTop: spacing.sm, textAlign: "center", color: "#dc2626", fontSize: typography.sm }}>{error}</p>
            )}
        </div>
    );
}
