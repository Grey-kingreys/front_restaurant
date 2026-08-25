"use client";
// src/app/client/commandes/page.tsx — Historique des commandes (Rclient)

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Truck, ShoppingBag, ClipboardList, AlertCircle, ChevronRight, X } from "lucide-react";
import { getMesCommandes, annulerCommandeClient, type MaCommande } from "@/lib/api/public";
import { apiErrorMessage } from "@/lib/apiErrors";

const STATUT_COLOR: Record<string, string> = {
    en_attente: "#f59e0b", prete: "#3b82f6", en_livraison: "#8b5cf6",
    servie: "#22c55e", payee: "#22c55e", annulee: "#6b7280",
};

const FILTRES: { value: string; label: string }[] = [
    { value: "", label: "Toutes" },
    { value: "en_cours", label: "En cours" },
    { value: "payee", label: "Terminées" },
];

const EN_COURS = new Set(["en_attente", "prete", "en_livraison", "servie"]);

function formatGNF(v: string | number) {
    return Number(v).toLocaleString("fr-FR") + " GNF";
}
function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
}

export default function ClientCommandesPage() {
    const router = useRouter();
    const [commandes, setCommandes] = useState<MaCommande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtre, setFiltre] = useState("");

    // Annulation client (tant que la commande est « en attente »)
    const [annulId, setAnnulId] = useState<number | null>(null);
    const [motif, setMotif] = useState("");
    const [busy, setBusy] = useState(false);
    const [flash, setFlash] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    const confirmerAnnulation = async (id: number) => {
        setBusy(true); setFlash(null);
        try {
            const res = await annulerCommandeClient(id, motif);
            if (res.success) {
                setAnnulId(null); setMotif("");
                setFlash({ type: "ok", text: "Commande annulée." });
                await load();
            } else {
                setFlash({ type: "err", text: apiErrorMessage(res, "Annulation impossible.") });
            }
        } catch {
            setFlash({ type: "err", text: "Serveur indisponible." });
        }
        setBusy(false);
    };

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await getMesCommandes();
            if (res.success && res.data) setCommandes(res.data.commandes);
            else setError("Impossible de charger vos commandes.");
        } catch {
            setError("Serveur indisponible. Réessayez.");
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = commandes.filter((c) => {
        if (filtre === "en_cours") return EN_COURS.has(c.statut);
        if (filtre === "payee") return c.statut === "payee";
        return true;
    });

    return (
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "clamp(1rem, 4vw, 2rem)" }}>
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ margin: "0 0 0.25rem", fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 900, color: "var(--text-primary)" }}>Mes commandes</h1>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>Suivez et retrouvez l'historique de vos commandes.</p>
            </div>

            {/* Filtres */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                {FILTRES.map((f) => (
                    <button key={f.value} onClick={() => setFiltre(f.value)}
                        style={{ padding: "0.45rem 0.95rem", borderRadius: "var(--radius-full)", cursor: "pointer", border: `1px solid ${filtre === f.value ? "#f59e0b" : "var(--border-subtle)"}`, background: filtre === f.value ? "var(--bg-section-alt)" : "transparent", color: filtre === f.value ? "#f59e0b" : "var(--text-muted)", fontSize: "0.82rem", fontWeight: 600 }}>
                        {f.label}
                    </button>
                ))}
            </div>

            {flash && (
                <p style={{ margin: "0 0 1rem", fontSize: "0.82rem", color: flash.type === "ok" ? "#22c55e" : "#ef4444" }}>{flash.text}</p>
            )}

            {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", color: "var(--text-muted)", gap: "0.75rem" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                    Chargement…
                    <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
                </div>
            ) : error ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "3rem", color: "var(--text-muted)" }}>
                    <AlertCircle size={30} style={{ opacity: 0.4 }} />
                    <p style={{ margin: 0 }}>{error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ background: "var(--bg-card)", border: "1px dashed var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    <ClipboardList size={32} style={{ opacity: 0.4, marginBottom: "0.75rem" }} />
                    <p style={{ margin: "0 0 1rem", fontSize: "0.95rem" }}>Aucune commande {filtre === "en_cours" ? "en cours" : filtre === "payee" ? "terminée" : ""}.</p>
                    <Link href="/client/restaurants" style={{ display: "inline-block", padding: "0.6rem 1.2rem", borderRadius: "var(--radius-lg)", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0c0a09", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}>
                        Parcourir les restaurants
                    </Link>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {filtered.map((c) => {
                        const color = STATUT_COLOR[c.statut] ?? "#f59e0b";
                        const confirming = annulId === c.commande_id;
                        return (
                            <div key={c.commande_id} style={{ display: "flex", flexDirection: "column" }}>
                                <button onClick={() => router.push(`/restaurant/${c.restaurant_slug}/confirmation/${c.cle_suivi}`)}
                                    style={{ textAlign: "left", cursor: "pointer", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: c.annulable ? "var(--radius-xl) var(--radius-xl) 0 0" : "var(--radius-xl)", borderBottom: c.annulable ? "none" : "1px solid var(--border-subtle)", padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ width: 42, height: 42, borderRadius: "var(--radius-lg)", flexShrink: 0, background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color }}>
                                        {c.type_commande === "livraison" ? <Truck size={20} /> : <ShoppingBag size={20} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                            <span style={{ fontWeight: 800, color: "var(--text-primary)", fontSize: "0.95rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.restaurant}</span>
                                            <span style={{ fontWeight: 800, color: "#f59e0b", fontSize: "0.92rem", flexShrink: 0 }}>{formatGNF(c.montant_total)}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginTop: "0.35rem" }}>
                                            <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                                                {c.nb_items} article{c.nb_items > 1 ? "s" : ""} · {formatDate(c.date_commande)}
                                            </span>
                                            <span style={{ padding: "2px 9px", borderRadius: "var(--radius-full)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", color, fontSize: "0.68rem", fontWeight: 700, flexShrink: 0 }}>{c.statut_label}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                                </button>

                                {/* Annulation — uniquement tant que la commande est « en attente » */}
                                {c.annulable && (
                                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderTop: "1px dashed var(--border-subtle)", borderRadius: "0 0 var(--radius-xl) var(--radius-xl)", padding: confirming ? "0.9rem 1.1rem" : "0.5rem 1.1rem" }}>
                                        {confirming ? (
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                                                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontWeight: 600 }}>Annuler cette commande ?</span>
                                                <textarea value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif (facultatif)" rows={2}
                                                    style={{ width: "100%", boxSizing: "border-box", padding: "0.5rem 0.7rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: "var(--text-primary)", fontSize: "0.82rem", resize: "vertical", fontFamily: "inherit", outline: "none" }} />
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    <button onClick={() => confirmerAnnulation(c.commande_id)} disabled={busy}
                                                        style={{ padding: "0.45rem 0.9rem", borderRadius: "var(--radius-lg)", border: "none", background: "#ef4444", color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: busy ? "wait" : "pointer" }}>
                                                        {busy ? "Annulation…" : "Confirmer l'annulation"}
                                                    </button>
                                                    <button onClick={() => { setAnnulId(null); setMotif(""); }} disabled={busy}
                                                        style={{ padding: "0.45rem 0.9rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-muted)", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                                                        Retour
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setAnnulId(c.commande_id); setMotif(""); setFlash(null); }}
                                                style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.25rem 0", background: "none", border: "none", color: "#ef4444", fontWeight: 600, fontSize: "0.8rem", cursor: "pointer" }}>
                                                <X size={13} /> Annuler la commande
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
