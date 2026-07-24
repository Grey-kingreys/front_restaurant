"use client";
// src/app/commandes/page.tsx
// Toutes les commandes — Serveur, Chef Cuisinier, Admin, Manager

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
    listCommandes,
    getCommande,
    marquerPrete,
    marquerEnLivraison,
    marquerServie,
    validerPaiement,
    annulerCommande,
    downloadRecu,
    type Commande,
    type StatutCommande,
} from "@/lib/api/commandes";
import { cssVar, typography, radius, spacing } from "@/theme/theme";
import {
    Clock,
    CheckCircle2,
    Check,
    X,
    RefreshCw,
    FileDown,
    Flame,
    ChevronRight,
    Package,
    User2,
    ChefHat,
    CreditCard,
    ArrowRight,
    Truck,
    MapPin,
    Plus,
} from "lucide-react";

const STATUT_CONFIG: Record<StatutCommande, { label: string; color: string; bg: string; border: string }> = {
    en_attente:   { label: "En attente",    color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
    prete:        { label: "Prête",         color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)" },
    en_livraison: { label: "En livraison",  color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  border: "rgba(139,92,246,0.25)" },
    servie:       { label: "Servie",        color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)" },
    payee:        { label: "Terminée",      color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)" },
    annulee:      { label: "Annulée",       color: "#6b7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.25)" },
};

// Règles de transition (miroir du backend) — évitent de sauter une étape.
// Une livraison part en course depuis son état « prêt à expédier » :
// 'prete' si un plat passe par la cuisine, sinon 'en_attente' directement.
const peutPartirEnLivraison = (c: Commande) =>
    c.type_commande === "livraison" &&
    (c.necessite_passage_cuisine === false ? c.statut === "en_attente" : c.statut === "prete");

// Servie / Livrée : une livraison ne peut l'être qu'après 'en_livraison' ;
// sur place / à emporter → depuis 'prete', ou directement 'en_attente' sans cuisine.
const peutEtreServie = (c: Commande) =>
    c.type_commande === "livraison"
        ? c.statut === "en_livraison"
        : c.statut === "prete" || (c.statut === "en_attente" && c.necessite_passage_cuisine === false);

// Type de commande — différencie une commande sur place (table) d'une commande client en ligne
const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    sur_table: { label: "Sur table", color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)" },
    livraison: { label: "Livraison", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)" },
    emporter:  { label: "À emporter", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
};

function TypeBadge({ type, label }: { type?: string; label?: string }) {
    if (!type) return null;
    const c = TYPE_CONFIG[type] ?? { label: label ?? type, color: "#9ca3af", bg: "rgba(156,163,175,0.1)", border: "rgba(156,163,175,0.25)" };
    return (
        <span style={{ alignSelf: "flex-start", display: "inline-block", padding: "1px 7px", borderRadius: "var(--radius-full)", fontSize: "0.66rem", fontWeight: 700, color: c.color, background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)" }}>
            {label ?? c.label}
        </span>
    );
}

const FILTER_TABS: { value: StatutCommande | ""; label: string }[] = [
    { value: "", label: "Toutes" },
    { value: "en_attente", label: "En attente" },
    { value: "prete", label: "Prêtes" },
    { value: "en_livraison", label: "En livraison" },
    { value: "servie", label: "Servies" },
    { value: "payee", label: "Payées" },
    { value: "annulee", label: "Annulées" },
];

export default function CommandesPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statutFilter, setStatutFilter] = useState<StatutCommande | "">("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [drawerCmd, setDrawerCmd] = useState<Commande | null>(null);
    const [drawerLoading, setDrawerLoading] = useState(false);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("view_commandes") && !hasPermission("manage_commandes")) router.replace("/dashboard");
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

    const handleAction = async (id: number, action: "prete" | "en_livraison" | "servie" | "payee") => {
        setActionLoading(id);
        try {
            let res;
            if (action === "prete") res = await marquerPrete(id);
            else if (action === "en_livraison") res = await marquerEnLivraison(id);
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

    const openDetail = async (id: number) => {
        setDrawerLoading(true);
        setDrawerCmd(null);
        // Ouvrir le drawer immédiatement avec les données de la liste (optimiste)
        const existing = commandes.find((c) => c.id === id);
        if (existing) setDrawerCmd(existing);
        try {
            const res = await getCommande(id);
            if (res.success && res.data) setDrawerCmd(res.data);
        } catch { /* garde les données existantes */ }
        finally { setDrawerLoading(false); }
    };

    const closeDrawer = () => { setDrawerCmd(null); setDrawerLoading(false); };

    const handleActionFromDrawer = async (id: number, action: "prete" | "en_livraison" | "servie" | "payee") => {
        setActionLoading(id);
        try {
            let res;
            if (action === "prete") res = await marquerPrete(id);
            else if (action === "en_livraison") res = await marquerEnLivraison(id);
            else if (action === "servie") res = await marquerServie(id);
            else res = await validerPaiement(id);
            if (res.success && res.data) {
                setDrawerCmd(res.data);
                setCommandes((prev) => prev.map((c) => c.id === id ? { ...c, statut: res.data!.statut } : c));
                showToast(`Commande #${id} mise à jour.`);
                fetchCommandes();
            } else {
                showToast("Action impossible.", "error");
            }
        } catch (e: unknown) {
            showToast((e as { message?: string })?.message ?? "Erreur.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancelFromDrawer = async (id: number, motif: string) => {
        setActionLoading(id);
        try {
            const res = await annulerCommande(id, motif);
            if (res.success && res.data) {
                setDrawerCmd(res.data);
                setCommandes((prev) => prev.map((c) => c.id === id ? { ...c, statut: res.data!.statut } : c));
                showToast(`Commande #${id} annulée.`);
                fetchCommandes();
            } else {
                showToast(res.message || "Annulation impossible.", "error");
            }
        } catch (e: unknown) {
            showToast((e as { message?: string })?.message ?? "Erreur.", "error");
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading || !user) return <PageLoader />;
    if (!hasPermission("view_commandes") && !hasPermission("manage_commandes")) return null;

    const isServeur = hasPermission("manage_commandes");
    const isCuisinier = hasPermission("manage_cuisine") || hasPermission("view_cuisine");

    return (
        <>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { opacity:0; transform: translateX(60px); } to { opacity:1; transform: translateX(0); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
        .cmd-root { min-height:100vh; background:var(--bg-dark); }
        .cmd-inner { max-width:1100px; margin:0 auto; position:relative; z-index:1; }
        .cmd-table { width:100%; border-collapse:collapse; }
        .cmd-table th { padding:0.6rem 0.875rem; text-align:left; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); border-bottom:1px solid var(--border-subtle); white-space:nowrap; }
        .cmd-table td { padding:0.75rem 0.875rem; border-bottom:1px solid var(--border-subtle); vertical-align:middle; }
        .cmd-row { animation: fadeIn 0.25s ease; }
        .cmd-row:hover td { background: var(--bg-section-alt); }
        .tab-btn { padding:0.5rem 0.875rem; border-radius:9999px; border:1px solid var(--border-subtle); background:transparent; cursor:pointer; font-size:0.875rem; font-weight:600; color:var(--text-muted); transition:all 0.15s; white-space:nowrap; min-height:40px; }
        .tab-btn.active { background:var(--gradient-btn); color:#0c0a09; border-color:transparent; }
        .tab-btn:not(.active):hover { border-color:var(--border-amber); color:var(--text-primary); }
        .action-btn { display:inline-flex; align-items:center; gap:0.35rem; padding:0.5rem 0.75rem; border-radius:0.5rem; border:1px solid; cursor:pointer; font-size:0.8rem; font-weight:600; transition:all 0.15s; min-height:40px; }
        .cmd-row { cursor:pointer; }
        .cmd-card-click { cursor:pointer; transition: border-color 0.15s, box-shadow 0.15s; }
        .cmd-card-click:hover { border-color: var(--border-amber) !important; box-shadow: 0 2px 8px rgba(0,0,0,0.18); }
        .drawer-overlay { position:fixed; inset:0; z-index:80; background:rgba(0,0,0,0.5); backdrop-filter:blur(4px); animation:fadeIn 0.2s ease; }
        .drawer-panel { position:fixed; top:0; right:0; bottom:0; z-index:81; width:min(480px,100vw); background:var(--bg-card); border-left:1px solid var(--border-subtle); display:flex; flex-direction:column; overflow:hidden; animation:drawerSlide 0.28s cubic-bezier(0.4,0,0.2,1); }
        @keyframes drawerSlide { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        .drawer-body { flex:1; overflow-y:auto; padding:1.25rem; display:flex; flex-direction:column; gap:1rem; }
        .drawer-section { background:var(--bg-section-alt); border:1px solid var(--border-subtle); border-radius:0.875rem; padding:0.875rem 1rem; }
        .drawer-section-title { font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--text-muted); margin:0 0 0.625rem; }
        .timeline-step { display:flex; align-items:flex-start; gap:0.625rem; padding:0.4rem 0; }
        .timeline-dot { width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
        .items-table { width:100%; border-collapse:collapse; font-size:0.82rem; }
        .items-table th { text-align:left; font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); padding:0 0 0.4rem; border-bottom:1px solid var(--border-subtle); }
        .items-table td { padding:0.45rem 0; border-bottom:1px solid var(--border-subtle); color:var(--text-secondary); vertical-align:middle; }
        .items-table tr:last-child td { border-bottom:none; }
        @media (min-width: 1024px) { .rp-cards-mobile { display:none !important; } }
        @media (max-width: 1023px) { .rp-table-desktop { display:none !important; } }
      `}</style>

            {/* Toast */}
            {toast && (
                <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 200, padding: "0.75rem 1.25rem", borderRadius: radius.xl, background: toast.type === "success" ? "rgba(34,197,94,0.96)" : "rgba(239,68,68,0.96)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", boxShadow: "0 8px 32px rgba(0,0,0,0.25)", animation: "toastIn 0.3s ease", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {toast.type === "success" ? <Check size={16} /> : <X size={16} />}
                    {toast.msg}
                </div>
            )}

            <div className="cmd-root rp-page-pad">
                <div className="cmd-inner">

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing["3"], marginBottom: spacing["5"], flexWrap: "wrap" }}>
                        <div>
                            <nav style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginBottom: "0.4rem" }}>
                                <Link href="/dashboard" style={{ fontSize: typography.xs, color: cssVar.textMuted, textDecoration: "none" }}>Tableau de bord</Link>
                                <ChevronRight size={10} style={{ color: "var(--text-muted)" }} />
                                <span style={{ fontSize: typography.xs, color: cssVar.textSecondary }}>Commandes</span>
                            </nav>
                            <div style={{ display: "flex", alignItems: "center", gap: spacing["3"] }}>
                                <h1 className="rp-h1" style={{ margin: 0, fontWeight: typography.bold, fontFamily: typography.fontSerif, color: cssVar.textPrimary }}>
                                    Commandes
                                </h1>
                                <span
                                    aria-label={`${commandes.length} commande${commandes.length > 1 ? "s" : ""}`}
                                    style={{
                                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                                        minWidth: 26, height: 24, padding: "0 0.5rem",
                                        borderRadius: radius.full,
                                        background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`,
                                        color: cssVar.textSecondary, fontSize: typography.sm, fontWeight: 700,
                                        fontVariantNumeric: "tabular-nums", lineHeight: 1,
                                    }}
                                >
                                    {commandes.length}
                                </span>
                            </div>
                            <p style={{ margin: "0.2rem 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                                {commandes.length} commande{commandes.length > 1 ? "s" : ""} {statutFilter ? `· ${STATUT_CONFIG[statutFilter]?.label}` : "au total"}
                            </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {isServeur && (
                                <Link href="/commandes/nouvelle" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#1c1917", cursor: "pointer", fontSize: typography.sm, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                                    <Plus size={15} />
                                    Nouvelle commande
                                </Link>
                            )}
                            <button onClick={fetchCommandes} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textSecondary, cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}>
                                <RefreshCw size={14} />
                                Actualiser
                            </button>
                        </div>
                    </div>

                    {/* Filtres statut */}
                    <div className="rp-scroll-x" style={{ marginBottom: spacing["4"] }}>
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
                            <div className="rp-table-desktop" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, overflow: "hidden" }}>
                                <table className="cmd-table">
                                    <thead style={{ background: "var(--bg-section-alt)" }}>
                                        <tr>
                                            <th>N°</th>
                                            <th>Client / Table</th>
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
                                                <tr key={cmd.id} className="cmd-row" onClick={() => openDetail(cmd.id)}>
                                                    <td>
                                                        <span style={{ fontWeight: 700, color: cssVar.amberGlow, fontFamily: "monospace" }}>#{cmd.id}</span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-start" }}>
                                                            <span style={{ fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>{cmd.client_display ?? cmd.table_login}</span>
                                                            <TypeBadge type={cmd.type_commande} label={cmd.type_commande_display} />
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.72rem", fontWeight: 700, color: sc.color, background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)" }}>
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
                                                            {isCuisinier && cmd.statut === "en_attente" && (
                                                                <ActionButton
                                                                    onClick={() => handleAction(cmd.id, "prete")}
                                                                    loading={isLoading}
                                                                    color="#3b82f6"
                                                                    icon={<Flame size={12} />}
                                                                    label="Prête"
                                                                />
                                                            )}
                                                            {/* Serveur — marquer EN LIVRAISON (livraison uniquement, après cuisine) */}
                                                            {isServeur && peutPartirEnLivraison(cmd) && (
                                                                <ActionButton
                                                                    onClick={() => handleAction(cmd.id, "en_livraison")}
                                                                    loading={isLoading}
                                                                    color="#8b5cf6"
                                                                    icon={<Truck size={12} />}
                                                                    label="En livraison"
                                                                />
                                                            )}
                                                            {/* Serveur — marquer SERVIE / LIVRÉE */}
                                                            {isServeur && peutEtreServie(cmd) && (
                                                                <ActionButton
                                                                    onClick={() => handleAction(cmd.id, "servie")}
                                                                    loading={isLoading}
                                                                    color="#a855f7"
                                                                    icon={<Check size={12} />}
                                                                    label={cmd.type_commande === "livraison" ? "Livrée" : "Servie"}
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
                            <div className="rp-cards-mobile">
                                {commandes.map((cmd) => (
                                    <CommandeCard
                                        key={cmd.id}
                                        cmd={cmd}
                                        isServeur={isServeur}
                                        isCuisinier={isCuisinier}
                                        actionLoading={actionLoading}
                                        onAction={handleAction}
                                        onDownload={handleDownload}
                                        onOpen={openDetail}
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Drawer détail commande ── */}
            {(drawerCmd || drawerLoading) && (
                <CommandeDrawer
                    cmd={drawerCmd}
                    loading={drawerLoading}
                    onClose={closeDrawer}
                    isServeur={isServeur}
                    isCuisinier={isCuisinier}
                    actionLoading={actionLoading}
                    onAction={handleActionFromDrawer}
                    onCancel={handleCancelFromDrawer}
                    onDownload={handleDownload}
                />
            )}
        </>
    );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatutIcon({ statut }: { statut: StatutCommande }) {
    const size = 8;
    if (statut === "en_attente") return <Clock size={size} />;
    if (statut === "prete") return <Flame size={size} />;
    if (statut === "en_livraison") return <Truck size={size} />;
    if (statut === "servie") return <Check size={size} />;
    return <CheckCircle2 size={size} />;
}

function ActionButton({ onClick, loading, color, icon, label }: {
    onClick: (e?: React.MouseEvent) => void; loading: boolean; color: string; icon: React.ReactNode; label: string;
}) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick(e); }}
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

function CommandeCard({ cmd, isServeur, isCuisinier, actionLoading, onAction, onDownload, onOpen }: {
    cmd: Commande; isServeur: boolean; isCuisinier: boolean;
    actionLoading: number | null;
    onAction: (id: number, action: "prete" | "en_livraison" | "servie" | "payee") => void;
    onDownload: (id: number) => void;
    onOpen: (id: number) => void;
}) {
    const sc = STATUT_CONFIG[cmd.statut];
    const isLoading = actionLoading === cmd.id;

    return (
        <div className="cmd-card-click" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: radius.xl, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: cssVar.amberGlow, fontFamily: "monospace" }}>#{cmd.id}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.72rem", fontWeight: 700, color: sc.color, background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)" }}>
                    <StatutIcon statut={cmd.statut} />
                    {sc.label}
                </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-start", minWidth: 0 }}>
                    <span style={{ fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>{cmd.client_display ?? cmd.table_login}</span>
                    <TypeBadge type={cmd.type_commande} label={cmd.type_commande_display} />
                </div>
                <span style={{ fontWeight: 700, color: cssVar.textPrimary, fontSize: typography.sm }}>
                    {Number(cmd.montant_total).toLocaleString("fr-FR")} GNF
                </span>
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                    {isCuisinier && cmd.statut === "en_attente" && (
                        <ActionButton onClick={() => onAction(cmd.id, "prete")} loading={isLoading} color="#3b82f6" icon={<Flame size={12} />} label="Prête" />
                    )}
                    {isServeur && peutPartirEnLivraison(cmd) && (
                        <ActionButton onClick={() => onAction(cmd.id, "en_livraison")} loading={isLoading} color="#8b5cf6" icon={<Truck size={12} />} label="En livraison" />
                    )}
                    {isServeur && peutEtreServie(cmd) && (
                        <ActionButton onClick={() => onAction(cmd.id, "servie")} loading={isLoading} color="#a855f7" icon={<Check size={12} />} label={cmd.type_commande === "livraison" ? "Livrée" : "Servie"} />
                    )}
                    {isServeur && cmd.statut === "servie" && (
                        <ActionButton onClick={() => onAction(cmd.id, "payee")} loading={isLoading} color="#22c55e" icon={<CheckCircle2 size={12} />} label="Payer" />
                    )}
                    {cmd.statut === "payee" && (
                        <ActionButton onClick={() => onDownload(cmd.id)} loading={false} color={cssVar.textMuted} icon={<FileDown size={12} />} label="Reçu PDF" />
                    )}
                </div>
                <button onClick={() => onOpen(cmd.id)} style={{ background:"none", border:"1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", padding:"0.4rem 0.6rem", cursor:"pointer", color:"var(--text-muted)", display:"flex", alignItems:"center", gap:"0.25rem", fontSize:"0.75rem", fontWeight:600 }}>
                    Détails <ArrowRight size={12} />
                </button>
            </div>
        </div>
    );
}

function EmptyState({ statutFilter }: { statutFilter: StatutCommande | "" }) {
    return (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid var(--border-subtle)" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", color: "var(--icon-primary)" }}>
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

// ── Drawer détail commande ──────────────────────────────────────────────────

function CommandeDrawer({ cmd, loading, onClose, isServeur, isCuisinier, actionLoading, onAction, onCancel, onDownload }: {
    cmd: Commande | null;
    loading: boolean;
    onClose: () => void;
    isServeur: boolean;
    isCuisinier: boolean;
    actionLoading: number | null;
    onAction: (id: number, action: "prete" | "en_livraison" | "servie" | "payee") => void;
    onCancel: (id: number, motif: string) => void;
    onDownload: (id: number) => void;
}) {
    const sc = cmd ? STATUT_CONFIG[cmd.statut] : null;
    const isActLoading = cmd ? actionLoading === cmd.id : false;
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [motif, setMotif] = useState("");

    // Réinitialise le mini-formulaire d'annulation quand on change de commande
    useEffect(() => { setConfirmCancel(false); setMotif(""); }, [cmd?.id]);

    const fmt = (iso: string | null) =>
        iso ? new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : null;

    const avecCuisine = cmd ? cmd.necessite_passage_cuisine !== false : true;
    const estLivraison = cmd?.type_commande === "livraison";

    const TIMELINE_ALL: { key: StatutCommande; label: string; icon: React.ReactNode; date: string | null; actor: string | null }[] = cmd ? [
        { key: "en_attente",   label: "Commande passée",        icon: <Clock size={13} />,      date: cmd.date_commande,  actor: cmd.client_display ?? cmd.table_login ?? null },
        { key: "prete",        label: "Préparée / Prête",       icon: <ChefHat size={13} />,    date: cmd.statut !== "en_attente" ? cmd.date_modification : null, actor: cmd.cuisinier_login ?? null },
        ...(estLivraison ? [{ key: "en_livraison" as StatutCommande, label: "En cours de livraison", icon: <Truck size={13} />, date: cmd.statut === "en_livraison" || cmd.statut === "servie" || cmd.statut === "payee" ? cmd.date_modification : null, actor: null }] : []),
        { key: "servie",       label: estLivraison ? "Livrée" : "Servie", icon: <User2 size={13} />, date: cmd.statut === "servie" || cmd.statut === "payee" ? cmd.date_modification : null, actor: cmd.serveur_login ?? null },
        { key: "payee",        label: "Paiement encaissé",      icon: <CreditCard size={13} />, date: cmd.date_paiement,  actor: cmd.serveur_login ?? null },
    ] : [];

    const TIMELINE = avecCuisine ? TIMELINE_ALL : TIMELINE_ALL.filter(s => s.key !== "prete");
    const currentIdx = cmd ? TIMELINE.findIndex(s => s.key === cmd.statut) : -1;

    return (
        <>
            <div className="drawer-overlay" onClick={onClose} />
            <div className="drawer-panel">
                {/* Header */}
                <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <Package size={18} color="var(--amber-glow)" />
                        <span style={{ fontWeight: 700, fontSize: typography.lg, fontFamily: typography.fontSerif, color: cssVar.textPrimary }}>
                            {cmd ? `Commande #${cmd.id}` : "Chargement…"}
                        </span>
                        {sc && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.15rem 0.55rem", borderRadius: "var(--radius-full)", fontSize: "0.72rem", fontWeight: 700, color: sc.color, background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)" }}>
                                <StatutIcon statut={cmd!.statut} />
                                {sc.label}
                            </span>
                        )}
                        {cmd?.type_commande && <TypeBadge type={cmd.type_commande} label={cmd.type_commande_display} />}
                    </div>
                    <button onClick={onClose} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", cursor: "pointer", color: cssVar.textMuted }}>
                        <X size={15} />
                    </button>
                </div>

                {loading && !cmd ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: cssVar.textMuted, gap: "0.75rem" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                        Chargement…
                    </div>
                ) : cmd ? (
                    <div className="drawer-body">

                        {/* Résumé */}
                        <div className="drawer-section">
                            <p className="drawer-section-title">Résumé</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem 1rem" }}>
                                {(() => {
                                    const isOnline = cmd.type_commande === "livraison" || cmd.type_commande === "emporter";
                                    const nb = cmd.nb_items ?? cmd.items?.length ?? 0;
                                    const rows: { label: string; value: string }[] = [
                                        { label: isOnline ? "Client" : "Table", value: cmd.client_display ?? cmd.table_login ?? "—" },
                                        { label: "Type", value: cmd.type_commande_display ?? (isOnline ? "En ligne" : "Sur table") },
                                        { label: "Montant", value: `${Number(cmd.montant_total).toLocaleString("fr-FR")} GNF` },
                                        { label: "Articles", value: `${nb} article${nb > 1 ? "s" : ""}` },
                                        { label: "Passée le", value: fmt(cmd.date_commande) ?? "—" },
                                    ];
                                    if (isOnline && cmd.client_telephone) rows.push({ label: "Téléphone", value: cmd.client_telephone });
                                    if (cmd.type_commande === "livraison" && cmd.client_adresse_livraison) rows.push({ label: "Adresse", value: cmd.client_adresse_livraison });
                                    if (isOnline && cmd.mode_paiement_display) rows.push({ label: "Paiement", value: cmd.mode_paiement_display });
                                    return rows;
                                })().map((r) => (
                                    <div key={r.label}>
                                        <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: cssVar.textMuted }}>{r.label}</p>
                                        <p style={{ margin: "2px 0 0", fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>{r.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bandeau annulation */}
                        {cmd.statut === "annulee" && (
                            <div className="drawer-section" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
                                <p className="drawer-section-title" style={{ color: "#ef4444" }}>Commande annulée</p>
                                <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textSecondary }}>
                                    {cmd.motif_annulation ? `Motif : ${cmd.motif_annulation}` : "Aucun motif renseigné."}
                                </p>
                                {(cmd.annulee_par_login || cmd.annulee_le) && (
                                    <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: cssVar.textMuted }}>
                                        {cmd.annulee_par_login ? `Par ${cmd.annulee_par_login}` : ""}{cmd.annulee_le ? ` · ${fmt(cmd.annulee_le)}` : ""}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Position de livraison (client géolocalisé) */}
                        {cmd.type_commande === "livraison" && cmd.client_latitude && cmd.client_longitude && (
                            <a
                                href={`https://www.google.com/maps?q=${cmd.client_latitude},${cmd.client_longitude}`}
                                target="_blank" rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", margin: "0 0 1rem", padding: "0.6rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.amberGlow, textDecoration: "none", fontSize: typography.sm, fontWeight: 600 }}
                            >
                                <MapPin size={15} /> Voir la position sur la carte
                            </a>
                        )}

                        {/* Articles */}
                        {(cmd.items?.length ?? 0) > 0 && (
                            <div className="drawer-section">
                                <p className="drawer-section-title">Articles commandés</p>
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "100%" }}>Plat</th>
                                            <th style={{ textAlign: "center", paddingRight: "0.5rem" }}>Qté</th>
                                            <th style={{ textAlign: "right" }}>Sous-total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(cmd.items ?? []).map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <span style={{ fontWeight: 600, color: cssVar.textPrimary }}>{item.plat_nom}</span>
                                                    {item.plat_categorie && (
                                                        <span style={{ marginLeft: "0.375rem", fontSize: "0.7rem", color: cssVar.textMuted }}>· {item.plat_categorie}</span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: "center", paddingRight: "0.5rem" }}>× {item.quantite}</td>
                                                <td style={{ textAlign: "right", fontWeight: 600, color: cssVar.textPrimary, whiteSpace: "nowrap" }}>
                                                    {Number(item.sous_total).toLocaleString("fr-FR")} GNF
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div style={{ marginTop: "0.625rem", paddingTop: "0.5rem", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: typography.xs, color: cssVar.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</span>
                                    <span style={{ fontWeight: 800, fontSize: typography.base, color: "var(--amber-glow)" }}>
                                        {Number(cmd.montant_total).toLocaleString("fr-FR")} GNF
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Timeline workflow */}
                        <div className="drawer-section">
                            <p className="drawer-section-title">Workflow{!avecCuisine && <span style={{ marginLeft: "0.4rem", fontSize: "0.65rem", fontWeight: 600, color: "#22c55e", background: "var(--bg-section-alt)", padding: "0.1rem 0.4rem", borderRadius: "var(--radius-full)" }}>Sans étape cuisine</span>}</p>
                            {TIMELINE.map((step, i) => {
                                const done = i <= currentIdx;
                                const isCurrent = i === currentIdx;
                                return (
                                    <div key={step.key} className="timeline-step">
                                        <div className="timeline-dot" style={{ background: done ? (isCurrent ? sc!.bg : "rgba(34,197,94,0.12)") : "var(--bg-card)", border: `1px solid ${done ? (isCurrent ? sc!.color : "#22c55e") : "var(--border-subtle)"}`, color: done ? (isCurrent ? sc!.color : "#22c55e") : cssVar.textMuted }}>
                                            {done && !isCurrent ? <Check size={11} /> : step.icon}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ margin: 0, fontSize: typography.sm, fontWeight: isCurrent ? 700 : 500, color: done ? cssVar.textPrimary : cssVar.textMuted }}>{step.label}</p>
                                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1px" }}>
                                                {step.date && <span style={{ fontSize: "0.7rem", color: cssVar.textMuted }}>{fmt(step.date)}</span>}
                                                {step.actor && <span style={{ fontSize: "0.7rem", color: cssVar.amberGlow, fontWeight: 600 }}>· {step.actor}</span>}
                                                {!done && <span style={{ fontSize: "0.7rem", color: cssVar.textMuted, fontStyle: "italic" }}>En attente</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {isCuisinier && cmd.statut === "en_attente" && (
                                <button onClick={() => onAction(cmd.id, "prete")} disabled={isActLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.7rem", borderRadius: radius.lg, border: "1px solid #3b82f6", background: "rgba(59,130,246,0.08)", color: "#3b82f6", fontWeight: 700, fontSize: typography.sm, cursor: isActLoading ? "not-allowed" : "pointer", opacity: isActLoading ? 0.6 : 1, transition: "all 0.15s" }}>
                                    {isActLoading ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #3b82f6", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} /> : <ChefHat size={15} />}
                                    Marquer PRÊTE
                                </button>
                            )}
                            {isServeur && peutPartirEnLivraison(cmd) && (
                                <button onClick={() => onAction(cmd.id, "en_livraison")} disabled={isActLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.7rem", borderRadius: radius.lg, border: "1px solid #8b5cf6", background: "rgba(139,92,246,0.08)", color: "#8b5cf6", fontWeight: 700, fontSize: typography.sm, cursor: isActLoading ? "not-allowed" : "pointer", opacity: isActLoading ? 0.6 : 1, transition: "all 0.15s" }}>
                                    {isActLoading ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #8b5cf6", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} /> : <Truck size={15} />}
                                    Mettre en livraison
                                </button>
                            )}
                            {isServeur && peutEtreServie(cmd) && (
                                <button onClick={() => onAction(cmd.id, "servie")} disabled={isActLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.7rem", borderRadius: radius.lg, border: "1px solid #a855f7", background: "rgba(168,85,247,0.08)", color: "#a855f7", fontWeight: 700, fontSize: typography.sm, cursor: isActLoading ? "not-allowed" : "pointer", opacity: isActLoading ? 0.6 : 1, transition: "all 0.15s" }}>
                                    {isActLoading ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #a855f7", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} /> : <User2 size={15} />}
                                    {cmd.type_commande === "livraison" ? "Marquer LIVRÉE" : "Marquer SERVIE"}
                                </button>
                            )}
                            {isServeur && cmd.statut === "servie" && (
                                <button onClick={() => onAction(cmd.id, "payee")} disabled={isActLoading} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.7rem", borderRadius: radius.lg, border: "1px solid #22c55e", background: "rgba(34,197,94,0.08)", color: "#22c55e", fontWeight: 700, fontSize: typography.sm, cursor: isActLoading ? "not-allowed" : "pointer", opacity: isActLoading ? 0.6 : 1, transition: "all 0.15s" }}>
                                    {isActLoading ? <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid #22c55e", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} /> : <CreditCard size={15} />}
                                    Valider le paiement
                                </button>
                            )}
                            {cmd.statut === "payee" && (
                                <button onClick={() => onDownload(cmd.id)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.7rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer", transition: "all 0.15s" }}>
                                    <FileDown size={15} />
                                    Télécharger le reçu PDF
                                </button>
                            )}

                            {/* Annulation (staff) — possible jusqu'à « en livraison » inclus */}
                            {isServeur && cmd.peut_annuler_staff && (
                                confirmCancel ? (
                                    <div style={{ border: "1px solid var(--border-subtle)", borderRadius: radius.lg, padding: "0.75rem", background: "var(--bg-section-alt)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        <span style={{ fontSize: typography.sm, fontWeight: 700, color: cssVar.textPrimary }}>Annuler la commande #{cmd.id} ?</span>
                                        <textarea value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Motif de l'annulation (obligatoire)" rows={2}
                                            style={{ width: "100%", boxSizing: "border-box", padding: "0.5rem 0.7rem", borderRadius: radius.md, border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: cssVar.textPrimary, fontSize: typography.sm, resize: "vertical", fontFamily: "inherit", outline: "none" }} />
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button onClick={() => onCancel(cmd.id, motif)} disabled={isActLoading || !motif.trim()}
                                                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem", padding: "0.6rem", borderRadius: radius.lg, border: "none", background: (!motif.trim() || isActLoading) ? "rgba(239,68,68,0.4)" : "#ef4444", color: "#fff", fontWeight: 700, fontSize: typography.sm, cursor: (!motif.trim() || isActLoading) ? "not-allowed" : "pointer" }}>
                                                {isActLoading ? "Annulation…" : "Confirmer l'annulation"}
                                            </button>
                                            <button onClick={() => { setConfirmCancel(false); setMotif(""); }} disabled={isActLoading}
                                                style={{ padding: "0.6rem 0.9rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontWeight: 600, fontSize: typography.sm, cursor: "pointer" }}>
                                                Retour
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setConfirmCancel(true)}
                                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.7rem", borderRadius: radius.lg, border: "1px solid rgba(239,68,68,0.4)", background: "transparent", color: "#ef4444", fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>
                                        <X size={15} /> Annuler la commande
                                    </button>
                                )
                            )}
                        </div>

                    </div>
                ) : null}
            </div>
        </>
    );
}

