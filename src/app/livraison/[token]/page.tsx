"use client";
// src/app/livraison/[token]/page.tsx
// Vue publique d'une livraison pour un livreur externe (sans compte), via token.
// Il voit l'adresse + la position + les articles et fait avancer la commande.

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
    getLivraisonPublique,
    actionLivraisonPublique,
    type LivraisonPublique,
    type LivraisonAction,
} from "@/lib/api/public";
import {
    Truck, MapPin, Phone, Package, CheckCircle2, Banknote, Store, AlertCircle,
} from "lucide-react";

const STATUT_LABEL: Record<string, { label: string; color: string }> = {
    en_attente:   { label: "À récupérer",  color: "#f59e0b" },
    prete:        { label: "Prête",         color: "#3b82f6" },
    en_livraison: { label: "En cours",      color: "#8b5cf6" },
    servie:       { label: "Livrée",        color: "#22c55e" },
    payee:        { label: "Payée",         color: "#22c55e" },
};

export default function LivraisonPubliquePage() {
    const params = useParams();
    const token = (params?.token as string) ?? "";

    const [data, setData]       = useState<LivraisonPublique | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [busy, setBusy]       = useState(false);
    const [toast, setToast]     = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = useCallback(async () => {
        const res = await getLivraisonPublique(token);
        if (res.success && res.data) setData(res.data);
        else setNotFound(true);
        setLoading(false);
    }, [token]);

    useEffect(() => { load(); }, [load]);

    const doAction = async (action: LivraisonAction, okMsg: string) => {
        setBusy(true);
        try {
            const res = await actionLivraisonPublique(token, action);
            if (res.success && res.data) { setData(res.data); showToast(okMsg); }
            else showToast(res.message || "Action impossible.", "error");
        } catch { showToast("Erreur réseau.", "error"); }
        setBusy(false);
    };

    if (loading) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)", color: "var(--text-muted)", gap: "0.75rem" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid rgba(139,92,246,0.2)", borderTopColor: "#8b5cf6", animation: "spin .75s linear infinite" }} />
            Chargement…
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    if (notFound || !data) return (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)", gap: "0.75rem", padding: "1.5rem", textAlign: "center" }}>
            <AlertCircle size={34} style={{ color: "#ef4444" }} />
            <p style={{ margin: 0, color: "var(--text-primary)", fontWeight: 700 }}>Lien de livraison invalide</p>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.85rem" }}>Ce lien a peut-être été régénéré ou la commande n&apos;existe plus.</p>
        </div>
    );

    const st = STATUT_LABEL[data.statut] ?? { label: data.statut, color: "#9ca3af" };
    const a = data.actions;
    const hasCoords = data.latitude && data.longitude;
    const done = data.statut === "payee" || (data.statut === "servie" && !data.paiement_autorise);

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
                .liv-act { width:100%; display:flex; align-items:center; justify-content:center; gap:0.5rem; padding:0.95rem; border-radius:0.9rem; font-size:0.95rem; font-weight:700; cursor:pointer; transition:all .15s; }
                .liv-act:disabled { opacity:0.55; cursor:not-allowed; }
            `}</style>

            {toast && (
                <div style={{ position: "fixed", bottom: "1.25rem", left: "50%", transform: "translateX(-50%)", zIndex: 200, padding: "0.75rem 1.25rem", borderRadius: "var(--radius-xl)", background: toast.type === "success" ? "rgba(34,197,94,0.96)" : "rgba(239,68,68,0.96)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", animation: "toastIn 0.3s ease" }}>
                    {toast.msg}
                </div>
            )}

            <div style={{ minHeight: "100vh", background: "var(--bg-dark)" }}>
                <div style={{ maxWidth: 480, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>

                    {/* En-tête */}
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.3)", marginBottom: "0.6rem" }}>
                            <Truck size={26} style={{ color: "#8b5cf6" }} />
                        </div>
                        <h1 style={{ margin: "0 0 0.2rem", fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>Livraison #{data.commande_id}</h1>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.7rem", borderRadius: "var(--radius-full)", fontSize: "0.72rem", fontWeight: 700, color: st.color, background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)" }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: st.color }} />
                            {st.label}
                        </span>
                    </div>

                    {/* Carte destination */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "1.1rem 1.25rem", marginBottom: "1rem" }}>
                        <p style={{ margin: "0 0 0.75rem", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)" }}>Destination</p>
                        <p style={{ margin: "0 0 0.5rem", fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)" }}>{data.client_nom ?? "Client"}</p>
                        {data.adresse_livraison && (
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "0.6rem" }}>
                                <MapPin size={16} style={{ flexShrink: 0, marginTop: "0.1rem", color: "#8b5cf6" }} />
                                {data.adresse_livraison}
                            </div>
                        )}
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {data.client_telephone && (
                                <a href={`tel:${data.client_telephone}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.85rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}>
                                    <Phone size={15} /> Appeler
                                </a>
                            )}
                            {hasCoords && (
                                <a href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`} target="_blank" rel="noopener noreferrer"
                                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.85rem", borderRadius: "var(--radius-lg)", border: "1px solid rgba(139,92,246,0.35)", background: "rgba(139,92,246,0.08)", color: "#8b5cf6", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600 }}>
                                    <MapPin size={15} /> Itinéraire
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Restaurant */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "0.85rem 1.25rem", marginBottom: "1rem", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
                        <Store size={16} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                        <span style={{ flex: 1 }}>{data.restaurant}</span>
                        {data.restaurant_telephone && (
                            <a href={`tel:${data.restaurant_telephone}`} style={{ color: "#8b5cf6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", fontWeight: 600 }}>
                                <Phone size={13} /> Resto
                            </a>
                        )}
                    </div>

                    {/* Articles + total */}
                    <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", overflow: "hidden", marginBottom: "1.5rem" }}>
                        {data.items.map((it, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "0.7rem 1.25rem", borderBottom: "1px solid var(--border-subtle)", fontSize: "0.88rem" }}>
                                <span style={{ color: "var(--text-secondary)" }}>{it.quantite}× {it.nom}</span>
                                <span style={{ color: "var(--text-muted)" }}>{Number(it.sous_total).toLocaleString("fr-FR")} GNF</span>
                            </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", padding: "0.85rem 1.25rem", fontWeight: 800, color: "#8b5cf6" }}>
                            <span>Total à encaisser</span>
                            <span>{Number(data.montant_total).toLocaleString("fr-FR")} GNF</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "grid", gap: "0.6rem" }}>
                        {a.peut_passer_en_livraison && (
                            <button className="liv-act" disabled={busy} onClick={() => doAction("en_livraison", "En route ! Bonne livraison.")}
                                style={{ border: "1px solid #8b5cf6", background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                                <Truck size={18} /> Je pars en livraison
                            </button>
                        )}
                        {a.peut_etre_servie && (
                            <button className="liv-act" disabled={busy} onClick={() => doAction("servie", "Commande marquée livrée.")}
                                style={{ border: "1px solid #22c55e", background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                                <CheckCircle2 size={18} /> Marquer comme livrée
                            </button>
                        )}
                        {a.peut_encaisser && (
                            <button className="liv-act" disabled={busy} onClick={() => doAction("payee", "Paiement encaissé.")}
                                style={{ border: "1px solid #f59e0b", background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                                <Banknote size={18} /> Encaisser le paiement
                            </button>
                        )}
                        {done && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1rem", borderRadius: "var(--radius-xl)", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontWeight: 700, fontSize: "0.9rem" }}>
                                <CheckCircle2 size={18} /> Livraison terminée — merci !
                            </div>
                        )}
                        {!a.peut_passer_en_livraison && !a.peut_etre_servie && !a.peut_encaisser && !done && (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "1rem", borderRadius: "var(--radius-xl)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                <Package size={16} /> En attente de préparation…
                            </div>
                        )}
                    </div>

                    {!data.paiement_autorise && (a.peut_etre_servie || a.peut_passer_en_livraison) && (
                        <p style={{ margin: "1rem 0 0", textAlign: "center", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                            Le paiement sera encaissé par le restaurant.
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
