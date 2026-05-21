"use client";
// src/app/commandes/page.tsx
// Toutes les commandes — Serveur, Chef Cuisinier, Admin, Manager

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
    listCommandes,
    marquerPrete,
    marquerServie,
    validerPaiement,
    downloadRecu,
    type Commande,
    type StatutCommande,
} from "@/lib/api/commandes";
import type { Role } from "@/types";
import { cssVar, typography, radius, spacing } from "@/theme/theme";
import {
    Clock,
    CheckCircle2,
    Check,
    X,
    RefreshCw,
    FileDown,
    Flame,
    ChevronRight
} from "lucide-react";

const ROLES_AUTORISES: Role[] = ["Rserveur", "Rchef_cuisinier", "Radmin", "Rmanager", "Rsuper_admin"];

const STATUT_CONFIG: Record<StatutCommande, { label: string; color: string; bg: string; border: string }> = {
    en_attente: { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    prete: { label: "Prête", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)" },
    servie: { label: "Servie", color: "#a855f7", bg: "rgba(168,85,247,0.1)", border: "rgba(168,85,247,0.25)" },
    payee: { label: "Payée", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
};

const FILTER_TABS: { value: StatutCommande | ""; label: string }[] = [
    { value: "", label: "Toutes" },
    { value: "en_attente", label: "En attente" },
    { value: "prete", label: "Prêtes" },
    { value: "servie", label: "Servies" },
    { value: "payee", label: "Payées" },
];

export default function CommandesPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statutFilter, setStatutFilter] = useState<StatutCommande | "">("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !ROLES_AUTORISES.includes(user.role as Role)) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, router]);

    const fetchCommandes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listCommandes(statutFilter ? { statut: statutFilter } : undefined);
            if (res.success && res.data) setCommandes(res.data.commandes);
            else setError("Impossible de charger les commandes.");
        } catch {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    }, [statutFilter]);

    useEffect(() => { if (isAuthenticated) fetchCommandes(); }, [fetchCommandes, isAuthenticated]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleAction = async (id: number, action: "prete" | "servie" | "payee") => {
        setActionLoading(id);
        try {
            let res;
            if (action === "prete") res = await marquerPrete(id);
            else if (action === "servie") res = await marquerServie(id);
            else res = await validerPaiement(id);

            if (res.success) {
                showToast(`Commande #${id} mise à jour.`);
                fetchCommandes();
            } else {
                showToast("Action impossible.", "error");
            }
        } catch (e: unknown) {
            const msg = (e as { message?: string })?.message ?? "Erreur.";
            showToast(msg, "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleDownload = async (id: number) => {
        try {
            const blob = await downloadRecu(id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `recu-commande-${id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            showToast("Erreur téléchargement PDF.", "error");
        }
    };

    if (isLoading || !user) return <PageLoader />;
    if (!ROLES_AUTORISES.includes(user.role as Role)) return null;

    const role = user.role as Role;
    const isServeur = role === "Rserveur";
    const isCuisinier = role === "Rchef_cuisinier" || role === "Rcuisinier";

    return (
        <>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform: translateX(60px); } to { opacity:1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
        .cmd-root { min-height:100vh; background:var(--bg-dark); padding:1.25rem 1rem 3rem; }
        .cmd-inner { max-width:1100px; margin:0 auto; position:relative; z-index:1; }
        .cmd-table { width:100%; border-collapse:collapse; }
        .cmd-table th { padding:0.6rem 0.875rem; text-align:left; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); border-bottom:1px solid var(--border-subtle); white-space:nowrap; }
        .cmd-table td { padding:0.75rem 0.875rem; border-bottom:1px solid var(--border-subtle); vertical-align:middle; }
        .cmd-row { animation: fadeIn 0.25s ease; }
        .cmd-row:hover td { background: var(--bg-section-alt); }
        .tab-btn { padding:0.45rem 0.875rem; border-radius:9999px; border:1px solid var(--border-subtle); background:transparent; cursor:pointer; font-size:0.78rem; font-weight:600; color:var(--text-muted); transition:all 0.15s; white-space:nowrap; }
        .tab-btn.active { background:var(--gradient-btn); color:#0c0a09; border-color:transparent; }
        .tab-btn:not(.active):hover { border-color:var(--border-amber); color:var(--text-primary); }
        .action-btn { display:inline-flex; align-items:center; gap:0.3rem; padding:0.35rem 0.65rem; border-radius:0.45rem; border:1px solid; cursor:pointer; font-size:0.72rem; font-weight:600; transition:all 0.15s; }
        @media(min-width:640px) { .cmd-root { padding:1.5rem 1.5rem 3rem; } }
        @media(min-width:1024px) { .cmd-root { padding:2rem 2rem 3rem; } }
        @media(max-width:768px) { .cmd-desktop { display:none !important; } .cmd-mobile { display:block !important; } }
        .cmd-mobile { display:none; }
      `}</style>

            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "35vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(245,158,11,0.05) 0%, transparent 70%)" }} />

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200, padding: "0.75rem 1.25rem", borderRadius: radius.xl, background: toast.type === "success" ? "rgba(34,197,94,0.96)" : "rgba(239,68,68,0.96)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="cmd-root">
                <div className="cmd-inner">

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing["3"], marginBottom: spacing["5"], flexWrap: "wrap" }}>
                        <div>
                            <nav style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.4rem" }}>
                                <Link href="/dashboard" style={{ fontSize: typography.xs, color: cssVar.textMuted, textDecoration: "none" }}>Tableau de bord</Link>
                                <ChevronRight size={10} style={{ color: "var(--text-muted)" }} />
                                <span style={{ fontSize: typography.xs, color: cssVar.textSecondary }}>Commandes</span>
                            </nav>
                            <h1 style={{ margin: 0, fontSize: typography["2xl"], fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary }}>
                                Commandes
                            </h1>
                            <p style={{ margin: "0.2rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                                {commandes.length} commande{commandes.length > 1 ? "s" : ""} {statutFilter ? `· ${STATUT_CONFIG[statutFilter]?.label}` : "au total"}
                            </p>
                        </div>
                        <button onClick={fetchCommandes} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textSecondary, cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}>
                            <RefreshCw size={14} />
                            Actualiser
                        </button>
                    </div>

                    {/* Filtres statut */}
                    <div style={{ display: "flex", gap: "0.4rem", marginBottom: spacing["4"], flexWrap: "wrap" }}>
                        {FILTER_TABS.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setStatutFilter(tab.value as StatutCommande | "")}
                                className={`tab-btn${statutFilter === tab.value ? " active" : ""}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Contenu */}
                    {loading ? (
                        <Loader text="Chargement des commandes…" />
                    ) : error ? (
                        <ErrorState message={error} onRetry={fetchCommandes} />
                    ) : commandes.length === 0 ? (
                        <EmptyState statutFilter={statutFilter} />
                    ) : (
                        <>
                            {/* Table desktop */}
                            <div className="cmd-desktop" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, overflow: "hidden" }}>
                                <table className="cmd-table">
                                    <thead style={{ background: "var(--bg-section-alt)" }}>
                                        <tr>
                                            <th>N°</th>
                                            <th>Table</th>
                                            <th>Statut</th>
                                            <th>Montant</th>
                                            <th>Articles</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {commandes.map((cmd) => {
                                            const sc = STATUT_CONFIG[cmd.statut];
                                            const isLoading = actionLoading === cmd.id;
                                            return (
                                                <tr key={cmd.id} className="cmd-row">
                                                    <td>
                                                        <span style={{ fontWeight: 700, color: cssVar.amberGlow, fontFamily: "monospace" }}>#{cmd.id}</span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>{cmd.table_login}</span>
                                                    </td>
                                                    <td>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                                                            <StatutIcon statut={cmd.statut} />
                                                            {sc.label}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontWeight: 700, color: cssVar.textPrimary, fontSize: typography.sm }}>
                                                            {Number(cmd.montant_total).toLocaleString("fr-FR")} GNF
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: typography.sm, color: cssVar.textMuted }}>
                                                            {(cmd as unknown as { nb_items: number }).nb_items ?? "—"} article{((cmd as unknown as { nb_items: number }).nb_items ?? 0) > 1 ? "s" : ""}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>
                                                            {new Date(cmd.date_commande).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                                            {/* Cuisinier — marquer PRÊTE */}
                                                            {(isCuisinier) && cmd.statut === "en_attente" && (
                                                                <ActionButton
                                                                    onClick={() => handleAction(cmd.id, "prete")}
                                                                    loading={isLoading}
                                                                    color="#3b82f6"
                                                                    icon={<Flame size={12} />}
                                                                    label="Prête"
                                                                />
                                                            )}
                                                            {/* Serveur — marquer SERVIE */}
                                                            {isServeur && (cmd.statut === "prete" || cmd.statut === "en_attente") && (
                                                                <ActionButton
                                                                    onClick={() => handleAction(cmd.id, "servie")}
                                                                    loading={isLoading}
                                                                    color="#a855f7"
                                                                    icon={<Check size={12} />}
                                                                    label="Servie"
                                                                />
                                                            )}
                                                            {/* Serveur — valider PAIEMENT */}
                                                            {isServeur && cmd.statut === "servie" && (
                                                                <ActionButton
                                                                    onClick={() => handleAction(cmd.id, "payee")}
                                                                    loading={isLoading}
                                                                    color="#22c55e"
                                                                    icon={<CheckCircle2 size={12} />}
                                                                    label="Payer"
                                                                />
                                                            )}
                                                            {/* PDF */}
                                                            {cmd.statut === "payee" && (
                                                                <ActionButton
                                                                    onClick={() => handleDownload(cmd.id)}
                                                                    loading={false}
                                                                    color={cssVar.textMuted}
                                                                    icon={<FileDown size={12} />}
                                                                    label="Reçu"
                                                                />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cards mobile */}
                            <div className="cmd-mobile" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {commandes.map((cmd) => (
                                    <CommandeCard
                                        key={cmd.id}
                                        cmd={cmd}
                                        isServeur={isServeur}
                                        isCuisinier={isCuisinier}
                                        actionLoading={actionLoading}
                                        onAction={handleAction}
                                        onDownload={handleDownload}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatutIcon({ statut }: { statut: StatutCommande }) {
    const size = 8;
    if (statut === "en_attente") return <Clock size={size} />;
    if (statut === "prete") return <Flame size={size} />;
    if (statut === "servie") return <Check size={size} />;
    return <CheckCircle2 size={size} />;
}

function ActionButton({ onClick, loading, color, icon, label }: {
    onClick: () => void; loading: boolean; color: string; icon: React.ReactNode; label: string;
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="action-btn"
            style={{ color, borderColor: color, background: "transparent", opacity: loading ? 0.6 : 1 }}
        >
            {loading
                ? <div style={{ width: 12, height: 12, borderRadius: "50%", border: `2px solid ${color}`, borderTopColor: "transparent", animation: "spin 0.6s linear infinite" }} />
                : icon}
            {label}
        </button>
    );
}

function CommandeCard({ cmd, isServeur, isCuisinier, actionLoading, onAction, onDownload }: {
    cmd: Commande; isServeur: boolean; isCuisinier: boolean;
    actionLoading: number | null;
    onAction: (id: number, action: "prete" | "servie" | "payee") => void;
    onDownload: (id: number) => void;
}) {
    const sc = STATUT_CONFIG[cmd.statut];
    const isLoading = actionLoading === cmd.id;

    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: cssVar.amberGlow, fontFamily: "monospace" }}>#{cmd.id}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.72rem", fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}` }}>
                    <StatutIcon statut={cmd.statut} />
                    {sc.label}
                </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>{cmd.table_login}</span>
                <span style={{ fontWeight: 700, color: cssVar.textPrimary, fontSize: typography.sm }}>
                    {Number(cmd.montant_total).toLocaleString("fr-FR")} GNF
                </span>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                {isCuisinier && cmd.statut === "en_attente" && (
                    <ActionButton onClick={() => onAction(cmd.id, "prete")} loading={isLoading} color="#3b82f6" icon={<Flame size={12} />} label="Prête" />
                )}
                {isServeur && (cmd.statut === "prete" || cmd.statut === "en_attente") && (
                    <ActionButton onClick={() => onAction(cmd.id, "servie")} loading={isLoading} color="#a855f7" icon={<Check size={12} />} label="Servie" />
                )}
                {isServeur && cmd.statut === "servie" && (
                    <ActionButton onClick={() => onAction(cmd.id, "payee")} loading={isLoading} color="#22c55e" icon={<CheckCircle2 size={12} />} label="Payer" />
                )}
                {cmd.statut === "payee" && (
                    <ActionButton onClick={() => onDownload(cmd.id)} loading={false} color={cssVar.textMuted} icon={<FileDown size={12} />} label="Reçu PDF" />
                )}
            </div>
        </div>
    );
}

function EmptyState({ statutFilter }: { statutFilter: StatutCommande | "" }) {
    return (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid var(--border-subtle)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--icon-bg)", border: "1px solid var(--icon-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", color: "var(--icon-primary)" }}>
                <Clock size={24} />
            </div>
            <h3 style={{ margin: "0 0 0.5rem", color: "var(--text-primary)" }}>Aucune commande</h3>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: typography.sm }}>
                {statutFilter ? `Aucune commande au statut « ${STATUT_CONFIG[statutFilter]?.label} »` : "Aucune commande pour le moment."}
            </p>
        </div>
    );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid rgba(239,68,68,0.2)" }}>
            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>{message}</p>
            <button onClick={onRetry} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.25rem", borderRadius: radius.lg, border: "1px solid var(--border-amber)", background: "transparent", color: "var(--amber-glow)", cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}>
                <RefreshCw size={14} />
                Réessayer
            </button>
        </div>
    );
}

function Loader({ text }: { text: string }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "0.75rem", color: "var(--text-muted)" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin 0.75s linear infinite" }} />
            {text}
        </div>
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
