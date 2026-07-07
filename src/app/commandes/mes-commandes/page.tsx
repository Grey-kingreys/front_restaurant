"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getMesCommandes, downloadRecu, type Commande, type StatutCommande } from "@/lib/api/commandes";
import { typography, radius, spacing } from "@/theme/theme";
import {
    Clock,
    ChefHat,
    Utensils,
    CheckCircle2,
    ArrowLeft,
    RefreshCw,
    ShoppingBag,
    ChevronRight,
    X,
    FileDown,
} from "lucide-react";

// ── Config statuts ──────────────────────────────────────────────────────────

const STATUT_CONFIG: Record<StatutCommande, { label: string; color: string; bg: string; border: string }> = {
    en_attente:   { label: "En attente",   color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    prete:        { label: "Prête",        color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)" },
    en_livraison: { label: "En livraison", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)" },
    servie:       { label: "Servie",       color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)" },
    payee:        { label: "Terminée",     color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)" },
};

const WORKFLOW_ALL: { statut: StatutCommande; label: string; desc: string; icon: React.ReactNode }[] = [
    { statut: "en_attente", label: "Commande reçue",   desc: "Votre commande a été transmise au restaurant.",        icon: <Clock size={16} /> },
    { statut: "prete",      label: "En préparation",  desc: "Vos plats sont en cours de préparation en cuisine.",  icon: <ChefHat size={16} /> },
    { statut: "servie",     label: "Servie",           desc: "Vos plats vous ont été apportés. Bon appétit !",      icon: <Utensils size={16} /> },
    { statut: "payee",      label: "Payée",            desc: "Commande clôturée. Merci de votre visite !",          icon: <CheckCircle2 size={16} /> },
];

function getWorkflow(cmd: Commande) {
    if (cmd.necessite_passage_cuisine === false) {
        return WORKFLOW_ALL.filter(s => s.statut !== "prete");
    }
    return WORKFLOW_ALL;
}

// ── Page principale ─────────────────────────────────────────────────────────

export default function MesCommandesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Commande | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);

    const handleDownloadRecu = async (id: number) => {
        setPdfLoading(true);
        try {
            const blob = await downloadRecu(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `recu-commande-${id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Impossible de télécharger le reçu.");
        } finally {
            setPdfLoading(false);
        }
    };

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && user.role !== "Rtable") router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, router]);

    const fetchCommandes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMesCommandes();
            if (res.success && res.data) {
                setCommandes(res.data.commandes);
            } else {
                setError("Impossible de charger vos commandes.");
            }
        } catch {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && user?.role === "Rtable") fetchCommandes();
    }, [isAuthenticated, user, fetchCommandes]);

    if (isLoading || !user) return <PageLoader />;

    return (
        <>
            <style>{`
                @keyframes fadeIn  { from { opacity:0; transform:translateY(8px); }  to { opacity:1; transform:translateY(0); } }
                @keyframes slideUp { from { opacity:0; transform:translateY(100%); } to { opacity:1; transform:translateY(0); } }
                @keyframes spin    { to { transform:rotate(360deg); } }
                .mc-root { min-height:100vh; background:var(--bg-dark); }
                .mc-inner { max-width:560px; margin:0 auto; }
                .cmd-row {
                    display:flex; align-items:center; gap:0.75rem;
                    background:var(--bg-card); border:1px solid var(--border-subtle);
                    border-radius:${radius.xl}; padding:0.9rem 1rem;
                    margin-bottom:0.6rem; cursor:pointer;
                    transition:border-color 0.15s, transform 0.15s;
                    animation:fadeIn 0.25s ease forwards;
                    text-decoration:none;
                }
                .cmd-row:hover { border-color:var(--border-amber); transform:translateY(-1px); }
                .overlay-backdrop {
                    position:fixed; inset:0; z-index:60;
                    background:rgba(0,0,0,0.6); backdrop-filter:blur(4px);
                }
                .overlay-panel {
                    position:fixed; left:0; right:0; bottom:0; z-index:61;
                    background:var(--bg-card); border-top:1px solid var(--border-amber);
                    border-radius:1.5rem 1.5rem 0 0;
                    max-height:85vh; overflow-y:auto;
                    animation:slideUp 0.3s cubic-bezier(0.4,0,0.2,1);
                    padding:1.5rem 1.25rem 2.5rem;
                }
                @media(min-width:640px) {
                    .overlay-panel { max-width:520px; left:50%; right:auto; transform:translateX(-50%); border-radius:1.5rem; bottom:2rem; }
                }
                .item-line { display:flex; justify-content:space-between; padding:0.5rem 0; border-bottom:1px dashed var(--border-subtle); }
                .item-line:last-child { border-bottom:none; }
                .step { display:flex; gap:0.75rem; align-items:flex-start; position:relative; }
                .step-line { position:absolute; left:15px; top:32px; bottom:-16px; width:2px; background:var(--border-subtle); }
                .step-line.done { background:var(--amber-glow); }
                .step-dot {
                    width:32px; height:32px; border-radius:50%; flex-shrink:0;
                    display:flex; align-items:center; justify-content:center;
                    border:2px solid var(--border-subtle);
                    background:var(--bg-section-alt); color:var(--text-muted);
                    transition:all 0.2s;
                }
                .step-dot.done  { border-color:var(--amber-glow); background:rgba(245,158,11,0.12); color:var(--amber-glow); }
                .step-dot.active { border-color:var(--amber-glow); background:var(--amber-glow); color:#0c0a09; box-shadow:0 0 0 4px rgba(245,158,11,0.2); }
            `}</style>

            <div className="mc-root rp-page-pad">
                <div className="mc-inner">
                    {/* Header */}
                    <div style={{ marginBottom: spacing["6"] }}>
                        <Link href="/menu" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", color: "var(--text-muted)", textDecoration: "none", fontSize: typography.sm, marginBottom: "1rem" }}>
                            <ArrowLeft size={14} /> Retour au menu
                        </Link>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h1 className="rp-h1" style={{ margin: 0, fontWeight: typography.bold, fontFamily: typography.fontSerif, color: "var(--text-primary)" }}>
                                Mes Commandes
                            </h1>
                            <button onClick={fetchCommandes} disabled={loading} style={{ background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", color: "var(--amber-glow)", cursor: "pointer", padding: "0.5rem", borderRadius: radius.md, display: "flex", minWidth: "44px", minHeight: "44px", alignItems: "center", justifyContent: "center" }}>
                                <RefreshCw size={18} style={{ animation: loading ? "spin 0.75s linear infinite" : "none" }} />
                            </button>
                        </div>
                    </div>

                    {/* Contenu */}
                    {loading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin 0.75s linear infinite" }} />
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "3rem 2rem", color: "#f87171", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: radius.xl }}>
                            {error}
                        </div>
                    ) : commandes.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl }}>
                            <ShoppingBag size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem", opacity: 0.5 }} />
                            <h3 style={{ color: "var(--text-primary)", margin: "0 0 0.5rem" }}>Aucune commande</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: typography.sm, margin: "0 0 1.5rem" }}>
                                Vous n'avez pas encore passé de commande.
                            </p>
                            <Link href="/menu" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
                                Commander maintenant
                            </Link>
                        </div>
                    ) : (
                        commandes.map((cmd, i) => {
                            const sc = STATUT_CONFIG[cmd.statut];
                            const nbPlats = cmd.items.reduce((s, it) => s + it.quantite, 0);
                            return (
                                <div
                                    key={cmd.id}
                                    className="cmd-row"
                                    style={{ animationDelay: `${i * 0.04}s` }}
                                    onClick={() => setSelected(cmd)}
                                >
                                    {/* Numéro */}
                                    <div style={{ flexShrink: 0 }}>
                                        <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: typography.base, color: "var(--amber-glow)" }}>
                                            #{cmd.id}
                                        </div>
                                        <div style={{ fontSize: typography.xs, color: "var(--text-muted)", marginTop: "1px" }}>
                                            {new Date(cmd.date_commande).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                        </div>
                                    </div>

                                    {/* Résumé */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 700, fontSize: typography.sm, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {cmd.items.map(it => it.plat_nom).join(", ")}
                                        </div>
                                        <div style={{ fontSize: typography.xs, color: "var(--text-muted)", marginTop: "2px" }}>
                                            {nbPlats} article{nbPlats > 1 ? "s" : ""}
                                        </div>
                                    </div>

                                    {/* Statut + Prix */}
                                    <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.3rem" }}>
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                                            padding: "0.2rem 0.6rem", borderRadius: "999px",
                                            fontSize: typography.xs, fontWeight: 700,
                                            color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`,
                                        }}>
                                            {sc.label}
                                        </span>
                                        <span style={{ fontWeight: 800, fontSize: typography.sm, color: "var(--text-primary)" }}>
                                            {Number(cmd.montant_total).toLocaleString("fr-FR")} GNF
                                        </span>
                                    </div>

                                    <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ── Overlay détail ── */}
            {selected && (
                <>
                    <div className="overlay-backdrop" onClick={() => setSelected(null)} />
                    <div className="overlay-panel">
                        {/* En-tête overlay */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                            <div>
                                <div style={{ fontFamily: "monospace", fontWeight: 900, fontSize: typography.xl, color: "var(--amber-glow)" }}>
                                    Commande #{selected.id}
                                </div>
                                <div style={{ fontSize: typography.xs, color: "var(--text-muted)", marginTop: "2px" }}>
                                    {new Date(selected.date_commande).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>
                            <button onClick={() => setSelected(null)} style={{ background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", borderRadius: radius.lg, padding: "0.5rem", cursor: "pointer", color: "var(--text-muted)", display: "flex", minWidth: "44px", minHeight: "44px", alignItems: "center", justifyContent: "center" }}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Détail des plats */}
                        <div style={{ background: "var(--bg-section-alt)", borderRadius: radius.lg, padding: "0.75rem 1rem", marginBottom: "1.25rem" }}>
                            <p style={{ margin: "0 0 0.6rem", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                                Détail des plats
                            </p>
                            {selected.items.map((item) => (
                                <div key={item.id} className="item-line">
                                    <span style={{ color: "var(--text-primary)", fontSize: typography.sm }}>
                                        <span style={{ fontWeight: 800, color: "var(--amber-glow)" }}>{item.quantite}×</span> {item.plat_nom}
                                    </span>
                                    <span style={{ color: "var(--text-secondary)", fontSize: typography.sm, fontWeight: 600 }}>
                                        {Number(item.sous_total).toLocaleString("fr-FR")} GNF
                                    </span>
                                </div>
                            ))}
                            <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.75rem", marginTop: "0.25rem", borderTop: "2px dashed var(--border-subtle)" }}>
                                <span style={{ fontWeight: 700, fontSize: typography.sm, color: "var(--text-muted)" }}>Total</span>
                                <span style={{ fontWeight: 900, fontSize: typography.lg, color: "var(--text-primary)" }}>
                                    {Number(selected.montant_total).toLocaleString("fr-FR")} GNF
                                </span>
                            </div>
                        </div>

                        {/* Bouton reçu PDF si payée */}
                        {selected.statut === "payee" && (
                            <button
                                onClick={() => handleDownloadRecu(selected.id)}
                                disabled={pdfLoading}
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", padding: "0.75rem", marginBottom: "1.25rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: pdfLoading ? "var(--text-muted)" : "var(--text-primary)", fontWeight: 700, fontSize: typography.sm, cursor: pdfLoading ? "not-allowed" : "pointer", transition: "all 0.15s", opacity: pdfLoading ? 0.6 : 1 }}
                            >
                                {pdfLoading
                                    ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid currentColor", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />
                                    : <FileDown size={15} />}
                                Télécharger le reçu PDF
                            </button>
                        )}

                        {/* Workflow timeline */}
                        <p style={{ margin: "0 0 1rem", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>
                            Suivi de la commande
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingBottom: "0.5rem" }}>
                            {getWorkflow(selected).map((step, i) => {
                                const workflow   = getWorkflow(selected);
                                const currentIdx = workflow.findIndex(s => s.statut === selected.statut);
                                const stepIdx    = i;
                                const isDone     = stepIdx < currentIdx;
                                const isActive   = stepIdx === currentIdx;
                                const isLast     = i === workflow.length - 1;

                                return (
                                    <div key={step.statut} className="step">
                                        {/* Ligne verticale entre étapes */}
                                        {!isLast && (
                                            <div className={`step-line${isDone ? " done" : ""}`} />
                                        )}

                                        {/* Pastille */}
                                        <div className={`step-dot${isActive ? " active" : isDone ? " done" : ""}`}>
                                            {step.icon}
                                        </div>

                                        {/* Texte */}
                                        <div style={{ paddingTop: "0.35rem" }}>
                                            <div style={{ fontWeight: isActive ? 800 : 600, fontSize: typography.sm, color: isActive ? "var(--text-primary)" : isDone ? "var(--text-secondary)" : "var(--text-muted)" }}>
                                                {step.label}
                                                {isActive && (
                                                    <span style={{ marginLeft: "0.4rem", fontSize: typography.xs, fontWeight: 700, color: step.statut === "payee" ? "#22c55e" : "var(--amber-glow)", background: step.statut === "payee" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", padding: "0.1rem 0.4rem", borderRadius: "999px" }}>
                                                        {step.statut === "payee" ? "Payée" : "En cours"}
                                                    </span>
                                                )}
                                                {isDone && (
                                                    <span style={{ marginLeft: "0.4rem", fontSize: typography.xs, color: "var(--text-muted)" }}>✓</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: typography.xs, color: "var(--text-muted)", marginTop: "2px" }}>
                                                {step.desc}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </>
    );
}

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}
