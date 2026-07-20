"use client";
// src/app/restaurant/[slug]/confirmation/[cle]/page.tsx
// Suivi commande client — polling toutes les 30s

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Clock, Truck, Package, BadgeCheck, Home, RefreshCw, ShoppingBag, MapPin, AlertCircle } from "lucide-react";
import { getSuiviCommande, type SuiviCommande } from "@/lib/api/public";

const STEPS_LIVRAISON = [
    { key: "en_attente",   label: "Commande reçue",          icon: Clock,        color: "#f59e0b" },
    { key: "prete",        label: "Préparation terminée",    icon: Package,      color: "#22c55e" },
    { key: "en_livraison", label: "En cours de livraison",   icon: Truck,        color: "#3b82f6" },
    { key: "servie",       label: "Livrée",                  icon: CheckCircle2, color: "#22c55e" },
    { key: "payee",        label: "Payée",                   icon: BadgeCheck,   color: "#a78bfa" },
];

const STEPS_EMPORTER = STEPS_LIVRAISON.filter((s) => s.key !== "en_livraison");

export default function ConfirmationPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string ?? "";
    const cle = params?.cle as string ?? "";

    const [commande, setCommande] = useState<SuiviCommande | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await getSuiviCommande(cle);
            if (res.success && res.data) {
                setCommande(res.data);
                setLastRefresh(new Date());
            }
        } catch { /* ignore — commande introuvable ou serveur indisponible */ }
        setLoading(false);
    }, [cle]);

    useEffect(() => {
        load();
        const interval = setInterval(load, 30_000);
        return () => clearInterval(interval);
    }, [load]);

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--text-muted)", gap: "0.75rem" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid rgba(245,158,11,0.2)", borderTopColor: "#f59e0b", animation: "spin .75s linear infinite" }} />
            Chargement…
            <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
    );

    if (!commande) return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
            <p style={{ color: "var(--text-muted)" }}>Commande introuvable.</p>
        </div>
    );

    const baseSteps = commande.type_commande === "livraison" ? STEPS_LIVRAISON : STEPS_EMPORTER;
    // Pas de plat en cuisine → on masque l'étape « Préparation terminée »
    const steps = commande.necessite_passage_cuisine === false
        ? baseSteps.filter((s) => s.key !== "prete")
        : baseSteps;
    const currentIndex = steps.findIndex((s) => s.key === commande.statut);
    const isDone = commande.statut === "payee";

    return (
        <>
            <style>{`@keyframes spin { to { transform:rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
            <div style={{ maxWidth: 520, margin: "0 auto", padding: "1.5rem 1rem 5rem" }}>

                {/* Header statut */}
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", margin: "0 auto 0.75rem", background: isDone ? "rgba(34,197,94,0.12)" : "var(--bg-section-alt)", border: `1px solid ${isDone ? "rgba(34,197,94,0.3)" : "var(--border-subtle)"}` }}>
                        {isDone
                            ? <CheckCircle2 size={28} style={{ color: "#22c55e" }} />
                            : commande.statut === "en_livraison"
                                ? <Truck size={28} style={{ color: "#f59e0b" }} />
                                : commande.type_commande === "emporter"
                                    ? <ShoppingBag size={28} style={{ color: "#f59e0b" }} />
                                    : <Clock size={28} style={{ color: "#f59e0b" }} />
                        }
                    </div>
                    <h1 style={{ margin: "0 0 0.25rem", fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        {commande.statut_label}
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        Commande #{commande.commande_id} — {commande.restaurant}
                    </p>
                    {lastRefresh && (
                        <button onClick={load} style={{ marginTop: "0.5rem", display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.625rem", borderRadius: "99px", border: "1px solid var(--border-subtle)", background: "none", color: "var(--text-muted)", fontSize: "0.72rem", cursor: "pointer" }}>
                            <RefreshCw size={10} />
                            Actualiser
                        </button>
                    )}
                </div>

                {/* Étapes progressives */}
                <div style={{ marginBottom: "2rem", padding: "1.25rem", borderRadius: "1rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                    {steps.map((step, idx) => {
                        const StepIcon = step.icon;
                        const done = idx <= currentIndex;
                        const active = idx === currentIndex;
                        return (
                            <div key={step.key} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", paddingBottom: idx < steps.length - 1 ? "1.25rem" : 0, position: "relative" }}>
                                {/* Ligne verticale */}
                                {idx < steps.length - 1 && (
                                    <div style={{ position: "absolute", left: 17, top: 36, bottom: 0, width: 2, background: done ? step.color : "var(--border-subtle)", transition: "background .3s" }} />
                                )}
                                {/* Icône */}
                                <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${done ? step.color : "var(--border-subtle)"}`, background: done ? `${step.color}18` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, animation: active && !isDone ? "pulse 2s infinite" : "none" }}>
                                    <StepIcon size={16} style={{ color: done ? step.color : "var(--text-muted)" }} />
                                </div>
                                {/* Label */}
                                <div style={{ paddingTop: "0.5rem" }}>
                                    <div style={{ fontWeight: active ? 700 : 500, color: done ? "var(--text-primary)" : "var(--text-muted)", fontSize: "0.88rem" }}>{step.label}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Récap commande */}
                <section style={{ marginBottom: "1.25rem" }}>
                    <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Détail</h2>
                    <div style={{ borderRadius: "0.875rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
                        {commande.items.map((item, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", borderBottom: i < commande.items.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                                <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{item.quantite}× {item.nom}</span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{Number(item.sous_total).toLocaleString("fr-FR")} GNF</span>
                            </div>
                        ))}
                        {commande.frais_livraison && Number(commande.frais_livraison) > 0 && (
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                <span>Frais de livraison</span>
                                <span>{Number(commande.frais_livraison).toLocaleString("fr-FR")} GNF</span>
                            </div>
                        )}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.875rem 1rem", borderTop: "1px solid var(--border-subtle)", fontWeight: 800, color: "#f59e0b" }}>
                            <span>Total</span>
                            <span>{Number(commande.montant_total).toLocaleString("fr-FR")} GNF</span>
                        </div>
                    </div>
                </section>

                {/* Adresse livraison */}
                {commande.adresse_livraison && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", padding: "0.875rem 1rem", borderRadius: "0.875rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", marginBottom: "1.25rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        <MapPin size={14} style={{ flexShrink: 0, marginTop: "0.1rem" }} />
                        {commande.adresse_livraison}
                    </div>
                )}

                {/* Retour menu */}
                <button onClick={() => router.push(`/restaurant/${slug}`)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem", borderRadius: "0.875rem", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" }}>
                    <Home size={15} />
                    Retour au menu
                </button>
            </div>
        </>
    );
}
