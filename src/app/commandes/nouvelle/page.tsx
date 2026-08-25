"use client";
// src/app/commandes/nouvelle/page.tsx
// Prise de commande par le staff : sur table, en livraison ou à emporter.
// Même expérience de composition que le menu client (recherche + catégories +
// cartes) pour rester utilisable avec un grand menu (100+ plats).

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { listTables, type Table } from "@/lib/api/restaurant";
import { listPlats, type Plat, type Categorie } from "@/lib/api/menu";
import { creerCommandeServeur } from "@/lib/api/commandes";
import { cssVar, typography, radius, spacing as sp } from "@/theme/theme";
import {
    ArrowLeft, Plus, Minus, Trash2, Check, Loader2, ClipboardList,
    Utensils, Bike, ShoppingBag, Search, Phone, MapPin, User as UserIcon,
} from "lucide-react";
import { apiErrorMessage } from "@/lib/apiErrors";

// Alias nommés vers l'échelle numérique de `spacing` (Tailwind-like).
const spacing = { xs: sp["1"], sm: sp["2"], md: sp["4"], lg: sp["5"], xl: sp["8"] };

type TypeCommande = "sur_table" | "livraison" | "emporter";

const TYPES: { value: TypeCommande; label: string; hint: string; icon: typeof Utensils }[] = [
    { value: "sur_table", label: "Sur table", hint: "Service en salle", icon: Utensils },
    { value: "livraison", label: "Livraison", hint: "Téléphone + adresse", icon: Bike },
    { value: "emporter", label: "À emporter", hint: "Retrait au comptoir", icon: ShoppingBag },
];

const CATEGORIES: { value: Categorie | ""; label: string }[] = [
    { value: "", label: "Tous" },
    { value: "ENTREE", label: "Entrées" },
    { value: "PLAT", label: "Plats" },
    { value: "ACCOMPAGNEMENT", label: "Accompagnements" },
    { value: "DESSERT", label: "Desserts" },
    { value: "BOISSON", label: "Boissons" },
];

const fmt = (n: number) => n.toLocaleString("fr-FR");

const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "0.6rem 0.75rem 0.6rem 2.1rem",
    borderRadius: radius.lg, border: "1px solid var(--border-subtle)",
    background: cssVar.bgCard, color: cssVar.textPrimary,
    fontSize: typography.sm, outline: "none",
};

export default function NouvelleCommandePage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [tables, setTables] = useState<Table[]>([]);
    const [plats, setPlats] = useState<Plat[]>([]);
    const [loading, setLoading] = useState(true);

    const [type, setType] = useState<TypeCommande>("sur_table");
    const [tableId, setTableId] = useState<number | null>(null);
    const [clientNom, setClientNom] = useState("");
    const [clientTel, setClientTel] = useState("");
    const [clientAdresse, setClientAdresse] = useState("");

    const [search, setSearch] = useState("");
    const [categorie, setCategorie] = useState<Categorie | "">("");
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
        const [t, p] = await Promise.all([
            listTables(),
            listPlats({ disponible: true }),
        ]);
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

    const platsFiltres = useMemo(() => {
        const q = search.trim().toLowerCase();
        return plats.filter((p) => {
            if (categorie && p.categorie !== categorie) return false;
            if (q && !p.nom.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q)) return false;
            return true;
        });
    }, [plats, categorie, search]);

    const setQty = (platId: number, qty: number) => {
        const q = Math.max(0, Math.min(50, qty));
        setCart((prev) => {
            const next = { ...prev };
            if (q === 0) delete next[platId];
            else next[platId] = q;
            return next;
        });
    };

    const { count, sousTotal } = useMemo(() => {
        let count = 0;
        let sousTotal = 0;
        for (const [id, q] of Object.entries(cart)) {
            const plat = platsById[Number(id)];
            if (!plat) continue;
            count += q;
            sousTotal += parseFloat(plat.prix_unitaire) * q;
        }
        return { count, sousTotal };
    }, [cart, platsById]);

    // Les frais de livraison ne sont pas facturés : ils dépendent de la distance
    // et se règlent directement avec le livreur.
    const total = sousTotal;

    const manque = useMemo(() => {
        if (count === 0) return "ajoutez des plats";
        if (type === "sur_table" && tableId === null) return "sélectionnez une table";
        if (type === "livraison" && !clientTel.trim()) return "téléphone du client requis";
        if (type === "livraison" && !clientAdresse.trim()) return "adresse de livraison requise";
        return null;
    }, [count, type, tableId, clientTel, clientAdresse]);

    const canSubmit = manque === null && !submitting;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        setError(null);
        const items = Object.entries(cart)
            .filter(([, q]) => q > 0)
            .map(([id, q]) => ({ plat_id: Number(id), quantite: q }));
        const res = await creerCommandeServeur({
            type_commande: type,
            ...(type === "sur_table"
                ? { table_id: tableId! }
                : {
                    client_nom: clientNom.trim() || undefined,
                    client_telephone: clientTel.trim() || undefined,
                    ...(type === "livraison" ? { client_adresse_livraison: clientAdresse.trim() } : {}),
                }),
            items,
        });
        if (res.success) {
            router.push(type === "livraison" ? "/livraisons" : "/commandes");
        } else {
            setSubmitting(false);
            setError(apiErrorMessage(res, "La création de la commande a échoué."));
        }
    };

    if (isLoading || !hasPermission("manage_commandes")) return null;

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: `${spacing.lg} ${spacing.md} 8rem` }}>
            <style>{`
                @keyframes spin { to { transform:rotate(360deg); } }
                .nc-plat-card { transition: border-color .15s, transform .12s; }
                .nc-plat-card:hover { transform: translateY(-1px); }
                .nc-type-btn { transition: all .15s; cursor: pointer; }
                .nc-cat-pill { transition: all .15s; cursor: pointer; }
                .nc-qty-btn { transition: transform .12s; }
                .nc-qty-btn:hover:not(:disabled) { transform: scale(1.08); }
            `}</style>

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
                    {/* 1. Type de commande */}
                    <section style={{ marginBottom: spacing.lg }}>
                        <p style={{ fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cssVar.textMuted, margin: `0 0 ${spacing.sm}` }}>
                            1 · Type de commande
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: "0.6rem", maxWidth: 620 }}>
                            {TYPES.map((t) => {
                                const active = type === t.value;
                                const Icon = t.icon;
                                return (
                                    <button
                                        key={t.value}
                                        onClick={() => { setType(t.value); setError(null); }}
                                        className="nc-type-btn"
                                        aria-pressed={active}
                                        style={{
                                            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.3rem",
                                            padding: "0.8rem 0.9rem", borderRadius: radius.xl, textAlign: "left",
                                            border: `1px solid ${active ? "var(--border-amber-hover)" : "var(--border-subtle)"}`,
                                            background: active ? "var(--bg-section-alt)" : cssVar.bgCard,
                                            color: active ? cssVar.amberGlow : cssVar.textSecondary,
                                        }}
                                    >
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontWeight: 700, fontSize: typography.sm }}>
                                            <Icon size={16} /> {t.label}
                                            {active && <Check size={13} />}
                                        </span>
                                        <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>{t.hint}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* 2. Destination : table OU coordonnées client */}
                    <section style={{ marginBottom: spacing.xl }}>
                        <p style={{ fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cssVar.textMuted, margin: `0 0 ${spacing.sm}` }}>
                            {type === "sur_table" ? "2 · Table" : "2 · Client"}
                        </p>

                        {type === "sur_table" && (
                            tables.length === 0 ? (
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
                            )
                        )}

                        {type !== "sur_table" && (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "0.6rem", maxWidth: 720 }}>
                                <div style={{ position: "relative" }}>
                                    <UserIcon size={14} style={{ position: "absolute", left: "0.7rem", top: "0.75rem", color: cssVar.textMuted, pointerEvents: "none" }} />
                                    <input
                                        value={clientNom}
                                        onChange={(e) => setClientNom(e.target.value)}
                                        placeholder="Nom du client (optionnel)"
                                        style={inputStyle}
                                    />
                                </div>
                                <div style={{ position: "relative" }}>
                                    <Phone size={14} style={{ position: "absolute", left: "0.7rem", top: "0.75rem", color: cssVar.textMuted, pointerEvents: "none" }} />
                                    <input
                                        value={clientTel}
                                        onChange={(e) => setClientTel(e.target.value)}
                                        type="tel"
                                        placeholder={type === "livraison" ? "Téléphone du destinataire *" : "Téléphone (optionnel)"}
                                        style={inputStyle}
                                    />
                                </div>
                                {type === "livraison" && (
                                    <div style={{ position: "relative", gridColumn: "1 / -1" }}>
                                        <MapPin size={14} style={{ position: "absolute", left: "0.7rem", top: "0.75rem", color: cssVar.textMuted, pointerEvents: "none" }} />
                                        <textarea
                                            value={clientAdresse}
                                            onChange={(e) => setClientAdresse(e.target.value)}
                                            rows={2}
                                            placeholder="Adresse de livraison * — quartier, rue, repère… (texte libre)"
                                            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* 3. Plats — recherche + catégories + cartes */}
                    <section>
                        <p style={{ fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cssVar.textMuted, margin: `0 0 ${spacing.sm}` }}>
                            3 · Plats
                        </p>

                        <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--bg-dark)", padding: `${spacing.xs} 0 ${spacing.sm}`, display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                            <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                                <Search size={14} style={{ position: "absolute", left: "0.7rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none" }} />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Rechercher un plat…"
                                    style={inputStyle}
                                />
                            </div>
                            {CATEGORIES.map((c) => {
                                const active = categorie === c.value;
                                return (
                                    <button
                                        key={c.value || "tous"}
                                        onClick={() => setCategorie(c.value)}
                                        className="nc-cat-pill"
                                        style={{
                                            padding: "0.45rem 0.875rem", borderRadius: radius.full,
                                            border: `1px solid ${active ? "var(--border-amber-hover)" : "var(--border-subtle)"}`,
                                            background: active ? "var(--bg-section-alt)" : "transparent",
                                            color: active ? cssVar.amberGlow : cssVar.textMuted,
                                            fontSize: typography.xs, fontWeight: 600, whiteSpace: "nowrap",
                                        }}
                                    >
                                        {c.label}
                                    </button>
                                );
                            })}
                        </div>

                        {platsFiltres.length === 0 ? (
                            <p style={{ textAlign: "center", padding: "2.5rem", color: cssVar.textMuted, fontSize: typography.sm }}>
                                Aucun plat ne correspond à la recherche.
                            </p>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(215px,1fr))", gap: "0.75rem" }}>
                                {platsFiltres.map((p) => {
                                    const qty = cart[p.id] || 0;
                                    return (
                                        <div
                                            key={p.id}
                                            className="nc-plat-card"
                                            style={{
                                                borderRadius: radius.xl, overflow: "hidden",
                                                border: `1px solid ${qty > 0 ? "var(--border-amber-hover)" : "var(--border-subtle)"}`,
                                                background: cssVar.bgCard,
                                            }}
                                        >
                                            <div style={{ height: 110, background: "var(--bg-section-alt)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                                                {p.image_url ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={p.image_url} alt={p.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                ) : (
                                                    <Utensils size={28} style={{ opacity: 0.12, color: cssVar.textMuted }} />
                                                )}
                                                {qty > 0 && (
                                                    <span style={{ position: "absolute", top: "0.45rem", right: "0.45rem", minWidth: 22, height: 22, padding: "0 6px", borderRadius: radius.full, background: "var(--gradient-btn)", color: "#1c1917", fontWeight: 800, fontSize: typography.xs, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        {qty}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ padding: "0.65rem 0.75rem 0.75rem" }}>
                                                <p style={{ margin: 0, fontWeight: 600, color: cssVar.textPrimary, fontSize: typography.sm, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={p.nom}>
                                                    {p.nom}
                                                </p>
                                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.45rem", gap: "0.4rem" }}>
                                                    <span style={{ color: cssVar.amberGlow, fontWeight: 700, fontSize: typography.xs }}>
                                                        {fmt(parseFloat(p.prix_unitaire))} GNF
                                                    </span>
                                                    {qty === 0 ? (
                                                        <button
                                                            onClick={() => setQty(p.id, 1)}
                                                            className="nc-qty-btn"
                                                            aria-label={`Ajouter ${p.nom}`}
                                                            style={{ width: 30, height: 30, borderRadius: radius.full, border: "none", background: "var(--gradient-btn)", color: "#1c1917", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                                                        >
                                                            <Plus size={15} />
                                                        </button>
                                                    ) : (
                                                        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                                            <button
                                                                onClick={() => setQty(p.id, qty - 1)}
                                                                className="nc-qty-btn"
                                                                aria-label="Retirer"
                                                                style={{ width: 28, height: 28, borderRadius: radius.full, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                            >
                                                                {qty === 1 ? <Trash2 size={12} /> : <Minus size={13} />}
                                                            </button>
                                                            <span style={{ minWidth: 18, textAlign: "center", fontWeight: 700, color: cssVar.textPrimary, fontSize: typography.sm }}>{qty}</span>
                                                            <button
                                                                onClick={() => setQty(p.id, qty + 1)}
                                                                className="nc-qty-btn"
                                                                aria-label="Ajouter"
                                                                style={{ width: 28, height: 28, borderRadius: radius.full, border: "none", background: "var(--gradient-btn)", color: "#1c1917", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                                                            >
                                                                <Plus size={13} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                            {count > 0 && type === "livraison" ? " · livraison à convenir avec le livreur" : ""}
                            {manque && count > 0 ? ` · ${manque}` : ""}
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
