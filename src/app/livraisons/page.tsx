"use client";
// src/app/livraisons/page.tsx
// Livraisons à traiter — Livreur (Rlivreur) + staff (serveur/manager/admin).
// Actions : mettre en livraison, marquer livrée, valider paiement (staff),
// générer un lien / QR de livraison externe (permission manage_livraison_links).

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    getLivraisons,
    genererLivraisonLien,
    marquerEnLivraison,
    marquerServie,
    validerPaiement,
    type Commande,
    type LivraisonLien,
} from "@/lib/api/commandes";
import { cssVar, typography, radius } from "@/theme/theme";
import {
    Truck, Package, MapPin, Phone, RefreshCw, Check, X,
    QrCode, Copy, CreditCard, User2, ExternalLink,
} from "lucide-react";

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

const STATUT_BADGE: Record<string, { label: string; color: string }> = {
    en_attente:   { label: "À préparer",       color: "#f59e0b" },
    prete:        { label: "Prête à expédier",  color: "#3b82f6" },
    en_livraison: { label: "En cours",          color: "#8b5cf6" },
    servie:       { label: "Livrée",            color: "#22c55e" },
    payee:        { label: "Payée",             color: "#22c55e" },
};

function StatutBadge({ statut }: { statut: string }) {
    const c = STATUT_BADGE[statut] ?? { label: statut, color: "#9ca3af" };
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, color: c.color, background: `${c.color}1a`, border: `1px solid ${c.color}40` }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.color }} />
            {c.label}
        </span>
    );
}

export default function LivraisonsPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [livraisons, setLivraisons] = useState<Commande[]>([]);
    const [loading, setLoading]       = useState(true);
    const [actionId, setActionId]     = useState<number | null>(null);
    const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [qrModal, setQrModal]       = useState<{ commandeId: number; data: LivraisonLien } | null>(null);
    const [qrLoadingId, setQrLoadingId] = useState<number | null>(null);
    const [copied, setCopied]         = useState(false);

    const canPay   = hasPermission("manage_commandes");
    const canLinks = hasPermission("manage_livraison_links");

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchLivraisons = useCallback(async () => {
        setLoading(true);
        const res = await getLivraisons();
        if (res.success && res.data) setLivraisons(res.data.commandes);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("view_livraisons")) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, hasPermission, router]);

    useEffect(() => {
        if (isAuthenticated && user && hasPermission("view_livraisons")) fetchLivraisons();
    }, [isAuthenticated, user, hasPermission, fetchLivraisons]);

    const runAction = async (id: number, fn: () => Promise<{ success: boolean; message?: string }>, okMsg: string) => {
        setActionId(id);
        try {
            const res = await fn();
            if (res.success) { showToast(okMsg); await fetchLivraisons(); }
            else showToast(res.message || "Action impossible.", "error");
        } catch { showToast("Erreur réseau.", "error"); }
        setActionId(null);
    };

    const openLink = async (id: number) => {
        setQrLoadingId(id);
        try {
            const res = await genererLivraisonLien(id);
            if (res.success && res.data) { setQrModal({ commandeId: id, data: res.data }); setCopied(false); }
            else showToast(res.message || "Impossible de générer le lien.", "error");
        } catch { showToast("Erreur réseau.", "error"); }
        setQrLoadingId(null);
    };

    const copyLink = async () => {
        if (!qrModal) return;
        try { await navigator.clipboard.writeText(qrModal.data.lien); setCopied(true); setTimeout(() => setCopied(false), 2000); }
        catch { /* clipboard indisponible */ }
    };

    if (isLoading || !user) return <PageLoader />;
    if (!hasPermission("view_livraisons")) return null;

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
                .liv-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:1.125rem; padding:1rem 1.25rem; animation:fadeIn 0.2s ease; }
                .liv-btn { display:flex; align-items:center; justify-content:center; gap:0.4rem; padding:0.55rem 0.9rem; border-radius:0.7rem; font-size:0.8rem; font-weight:700; cursor:pointer; transition:all .15s; }
                .liv-btn:disabled { opacity:0.55; cursor:not-allowed; }
            `}</style>

            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "35vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(139,92,246,0.06) 0%, transparent 70%)" }} />

            {toast && (
                <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200, padding: "0.75rem 1.25rem", borderRadius: radius.xl, background: toast.type === "success" ? "rgba(34,197,94,0.96)" : "rgba(239,68,68,0.96)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="rp-page-pad" style={{ minHeight: "100vh", background: "var(--bg-dark)" }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.3rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "0.875rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8b5cf6" }}>
                                    <Truck size={20} />
                                </div>
                                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary }}>Livraisons</h1>
                            </div>
                            <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                                Commandes à expédier et en cours de livraison
                            </p>
                        </div>
                        <button onClick={fetchLivraisons} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.6rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            <RefreshCw size={13} /> Actualiser
                        </button>
                    </div>

                    {/* Liste */}
                    {loading ? (
                        <div style={{ padding: "3rem", display: "flex", justifyContent: "center" }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-subtle)", borderTopColor: "#8b5cf6", animation: "spin .7s linear infinite" }} />
                        </div>
                    ) : livraisons.length === 0 ? (
                        <div className="liv-card" style={{ textAlign: "center", color: cssVar.textMuted, fontSize: typography.sm, padding: "2.5rem" }}>
                            <Package size={28} style={{ opacity: 0.5, marginBottom: "0.5rem" }} />
                            <p style={{ margin: 0 }}>Aucune livraison à traiter pour le moment.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "0.875rem" }}>
                            {livraisons.map((c) => {
                                const busy = actionId === c.id;
                                const hasCoords = c.client_latitude && c.client_longitude;
                                return (
                                    <div key={c.id} className="liv-card">
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", minWidth: 0 }}>
                                                <span style={{ fontWeight: 800, color: cssVar.textPrimary, fontSize: typography.base }}>#{c.id}</span>
                                                <StatutBadge statut={c.statut} />
                                            </div>
                                            <span style={{ fontWeight: 800, color: "#8b5cf6", fontSize: typography.base, whiteSpace: "nowrap" }}>
                                                {Number(c.montant_total).toLocaleString("fr-FR")} GNF
                                            </span>
                                        </div>

                                        {/* Infos client */}
                                        <div style={{ display: "grid", gap: "0.35rem", marginBottom: "0.85rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: cssVar.textPrimary, fontSize: typography.sm, fontWeight: 600 }}>
                                                <User2 size={14} style={{ color: cssVar.textMuted, flexShrink: 0 }} />
                                                {c.client_display ?? c.client_nom ?? "—"}
                                            </div>
                                            {c.client_adresse_livraison && (
                                                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.45rem", color: cssVar.textMuted, fontSize: typography.sm }}>
                                                    <MapPin size={14} style={{ flexShrink: 0, marginTop: "0.15rem" }} />
                                                    {c.client_adresse_livraison}
                                                </div>
                                            )}
                                            {c.client_telephone && (
                                                <a href={`tel:${c.client_telephone}`} style={{ display: "flex", alignItems: "center", gap: "0.45rem", color: cssVar.textMuted, fontSize: typography.sm, textDecoration: "none" }}>
                                                    <Phone size={14} style={{ flexShrink: 0 }} />
                                                    {c.client_telephone}
                                                </a>
                                            )}
                                            {hasCoords && (
                                                <a href={`https://www.google.com/maps?q=${c.client_latitude},${c.client_longitude}`} target="_blank" rel="noopener noreferrer"
                                                    style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "#8b5cf6", fontSize: typography.sm, fontWeight: 600, textDecoration: "none" }}>
                                                    <MapPin size={14} /> Voir la position sur la carte
                                                </a>
                                            )}
                                        </div>

                                        {/* Articles */}
                                        {(c.items?.length ?? 0) > 0 && (
                                            <div style={{ fontSize: "0.8rem", color: cssVar.textMuted, marginBottom: "0.85rem" }}>
                                                {c.items.map((it) => `${it.quantite}× ${it.plat_nom}`).join(" · ")}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
                                            {c.peut_passer_en_livraison && (
                                                <button className="liv-btn" disabled={busy} onClick={() => runAction(c.id, () => marquerEnLivraison(c.id), "Commande en cours de livraison.")}
                                                    style={{ border: "1px solid #8b5cf6", background: "rgba(139,92,246,0.08)", color: "#8b5cf6" }}>
                                                    <Truck size={14} /> Mettre en livraison
                                                </button>
                                            )}
                                            {c.peut_etre_servie && (
                                                <button className="liv-btn" disabled={busy} onClick={() => runAction(c.id, () => marquerServie(c.id), "Commande marquée livrée.")}
                                                    style={{ border: "1px solid #22c55e", background: "rgba(34,197,94,0.08)", color: "#22c55e" }}>
                                                    <Check size={14} /> Marquer livrée
                                                </button>
                                            )}
                                            {canPay && c.statut === "servie" && (
                                                <button className="liv-btn" disabled={busy} onClick={() => runAction(c.id, () => validerPaiement(c.id), "Paiement validé.")}
                                                    style={{ border: "1px solid #f59e0b", background: "rgba(245,158,11,0.08)", color: "#f59e0b" }}>
                                                    <CreditCard size={14} /> Valider le paiement
                                                </button>
                                            )}
                                            {canLinks && (
                                                <button className="liv-btn" disabled={qrLoadingId === c.id} onClick={() => openLink(c.id)}
                                                    style={{ border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted }}>
                                                    {qrLoadingId === c.id
                                                        ? <span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid var(--border-subtle)", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />
                                                        : <QrCode size={14} />}
                                                    Lien livreur
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal lien / QR */}
            {qrModal && (
                <div onClick={() => setQrModal(null)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                    <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 380, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: "1.5rem", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <h3 style={{ margin: 0, fontSize: typography.base, fontWeight: 800, color: cssVar.textPrimary }}>Lien de livraison — #{qrModal.commandeId}</h3>
                            <button onClick={() => setQrModal(null)} style={{ background: "none", border: "none", color: cssVar.textMuted, cursor: "pointer" }}><X size={18} /></button>
                        </div>
                        <p style={{ margin: "0 0 1rem", fontSize: "0.78rem", color: cssVar.textMuted }}>
                            Le livreur scanne ce QR ou ouvre le lien pour voir la commande et la faire avancer — sans compte.
                        </p>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrModal.data.qr_code_url} alt="QR de livraison" style={{ width: 220, height: 220, borderRadius: radius.lg, background: "#fff", padding: "0.5rem" }} />
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                            <input readOnly value={qrModal.data.lien} style={{ flex: 1, minWidth: 0, padding: "0.55rem 0.7rem", borderRadius: radius.md, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textMuted, fontSize: "0.72rem" }} />
                            <button onClick={copyLink} className="liv-btn" style={{ border: "1px solid var(--border-subtle)", background: "transparent", color: copied ? "#22c55e" : cssVar.textMuted }}>
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                        <a href={qrModal.data.lien} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", marginTop: "0.85rem", fontSize: "0.78rem", color: "#8b5cf6", fontWeight: 600, textDecoration: "none" }}>
                            <ExternalLink size={13} /> Ouvrir le lien
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}
