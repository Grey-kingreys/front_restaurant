"use client";
// src/app/restaurants/page.tsx
// Gestion de la plateforme — Super Admin uniquement

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    listRestaurants,
    createRestaurant,
    updateRestaurant,
    toggleRestaurant,
    deleteRestaurant,
    getPlatformStats,
    type Restaurant,
    type RestaurantCreatePayload,
    type PlatformStats,
} from "@/lib/api/company";
import type { Role } from "@/types";
import { cssVar, typography, radius } from "@/theme/theme";
import {
    Building2,
    Plus,
    X,
    Check,
    RefreshCw,
    Search,
    Pencil,
    Power,
    Trash2,
    ChevronDown,
    Eye,
    EyeOff,
} from "lucide-react";

const ROLES_AUTORISES: Role[] = ["Rsuper_admin"];

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

function StatutBadge({ active }: { active: boolean }) {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontSize: "0.7rem", fontWeight: 700, color: active ? "#22c55e" : "#ef4444", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: active ? "#22c55e" : "#ef4444" }} />
            {active ? "Actif" : "Suspendu"}
        </span>
    );
}

// ── Formulaire restaurant ─────────────────────────────────────────────────────

function RestaurantForm({ initial, onSubmit, onClose, loading, error }: {
    initial?: Restaurant | null;
    onSubmit: (data: RestaurantCreatePayload) => Promise<void>;
    onClose: () => void;
    loading: boolean;
    error: string | null;
}) {
    const isEdit = !!initial;
    const [nom, setNom]               = useState(initial?.nom ?? "");
    const [email, setEmail]           = useState(initial?.email_admin ?? "");
    const [telephone, setTelephone]   = useState(initial?.telephone ?? "");
    const [adresse, setAdresse]       = useState(initial?.adresse ?? "");
    const [solde, setSolde]           = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: RestaurantCreatePayload = {
            nom,
            email_admin: email,
            telephone: telephone || undefined,
            adresse: adresse || undefined,
        };
        if (!isEdit && solde) payload.solde_initial = parseFloat(solde);
        await onSubmit(payload);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {error && (
                <div style={{ padding: "0.625rem 0.875rem", borderRadius: radius.lg, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: typography.sm }}>
                    {error}
                </div>
            )}

            <div>
                <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Nom du restaurant *</label>
                <input type="text" value={nom} onChange={e => setNom(e.target.value)} required placeholder="Le Petit Bistro" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
            </div>

            <div>
                <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Email admin *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@restaurant.com" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                {!isEdit && <p style={{ margin: "0.25rem 0 0", fontSize: "0.7rem", color: cssVar.textMuted }}>Un compte Admin sera créé automatiquement avec cet email.</p>}
            </div>

            <div>
                <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Téléphone</label>
                <input type="tel" value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+224 6xx xxx xxx" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
            </div>

            <div>
                <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Adresse</label>
                <input type="text" value={adresse} onChange={e => setAdresse(e.target.value)} placeholder="Conakry, Quartier…" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
            </div>

            {!isEdit && (
                <div>
                    <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Solde initial caisse (GNF)</label>
                    <input type="number" value={solde} onChange={e => setSolde(e.target.value)} min="0" placeholder="0" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.25rem" }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                <button type="submit" disabled={loading} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    {loading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #0c0a09", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                    {isEdit ? "Enregistrer" : "Créer le restaurant"}
                </button>
            </div>
        </form>
    );
}

// ── Page principale ────────────────────────────────────────────────────────────

type ModalMode = "create" | "edit" | "toggle" | "delete" | null;

export default function RestaurantsPage() {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [stats, setStats]             = useState<PlatformStats | null>(null);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<string | null>(null);
    const [search, setSearch]           = useState("");
    const [filterActif, setFilterActif] = useState<"" | "true" | "false">("");
    const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const [modal, setModal]             = useState<ModalMode>(null);
    const [selected, setSelected]       = useState<Restaurant | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError]     = useState<string | null>(null);
    const [deletePassword, setDeletePassword] = useState("");
    const [showDeletePwd, setShowDeletePwd] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !ROLES_AUTORISES.includes(user.role as Role)) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, router]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [rRes, sRes] = await Promise.allSettled([listRestaurants(), getPlatformStats()]);
            if (rRes.status === "fulfilled" && rRes.value.success && rRes.value.data) setRestaurants(rRes.value.data.restaurants);
            else if (rRes.status === "fulfilled") setError("Impossible de charger les restaurants.");
            if (sRes.status === "fulfilled" && sRes.value.success && sRes.value.data) setStats(sRes.value.data);
        } catch {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { if (isAuthenticated) fetchAll(); }, [fetchAll, isAuthenticated]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const closeModal = () => {
        setModal(null);
        setSelected(null);
        setFormError(null);
        setDeletePassword("");
        setDeleteError("");
    };

    const handleCreate = async (data: RestaurantCreatePayload) => {
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await createRestaurant(data);
            if (res.success) {
                showToast(`Restaurant «${data.nom}» créé avec succès.`);
                closeModal();
                fetchAll();
            } else {
                const errs = res.errors;
                setFormError(errs ? Object.values(errs).flat().join(" — ") : "Erreur de création.");
            }
        } catch {
            setFormError("Erreur de connexion.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (data: RestaurantCreatePayload) => {
        if (!selected) return;
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await updateRestaurant(selected.id, data);
            if (res.success) {
                showToast("Restaurant mis à jour.");
                closeModal();
                fetchAll();
            } else {
                setFormError("Erreur de mise à jour.");
            }
        } catch {
            setFormError("Erreur de connexion.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggle = async () => {
        if (!selected) return;
        setFormLoading(true);
        try {
            const res = await toggleRestaurant(selected.id, selected.is_active);
            if (res.success) {
                showToast(`Restaurant ${selected.is_active ? "suspendu" : "activé"}.`);
                closeModal();
                fetchAll();
            } else {
                showToast("Action impossible.", "error");
                closeModal();
            }
        } catch {
            showToast("Erreur.", "error");
            closeModal();
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        if (!deletePassword) { setDeleteError("Mot de passe requis."); return; }
        setDeleteLoading(true);
        setDeleteError("");
        try {
            const res = await deleteRestaurant(selected.id, selected.nom, deletePassword);
            if (res.success) {
                showToast(`Restaurant «${selected.nom}» supprimé définitivement.`, "success");
                closeModal();
                setDeletePassword("");
                fetchAll();
            } else {
                setDeleteError(res.message || "Erreur lors de la suppression.");
            }
        } catch {
            setDeleteError("Erreur lors de la suppression.");
        } finally {
            setDeleteLoading(false);
        }
    };

    if (isLoading || !user) return <PageLoader />;
    if (!ROLES_AUTORISES.includes(user.role as Role)) return null;

    const fmt = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });

    const filtered = restaurants.filter(r => {
        const matchSearch = !search || r.nom.toLowerCase().includes(search.toLowerCase()) || r.email_admin.toLowerCase().includes(search.toLowerCase());
        const matchActif = filterActif === "" || (filterActif === "true" ? r.is_active : !r.is_active);
        return matchSearch && matchActif;
    });

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                @keyframes modalIn { from { opacity:0; transform:translateY(12px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
                .rts-root { min-height:100vh; background:var(--bg-dark); }
                .rts-inner { max-width:1100px; margin:0 auto; }
                .rts-table { width:100%; border-collapse:collapse; }
                .rts-table th { padding:0.6rem 0.875rem; text-align:left; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); border-bottom:1px solid var(--border-subtle); white-space:nowrap; }
                .rts-table td { padding:0.75rem 0.875rem; border-bottom:1px solid var(--border-subtle); vertical-align:middle; }
                .rts-row { animation:fadeIn 0.2s ease; }
                .rts-row:hover td { background:var(--bg-section-alt); }
                .rts-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:1rem; padding:0.875rem 1rem; animation:fadeIn 0.2s ease; display:flex; flex-direction:column; gap:0.625rem; }
                .icon-btn { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:0.5rem; border:1px solid var(--border-subtle); background:transparent; cursor:pointer; color:var(--text-muted); transition:all 0.15s; }
                .icon-btn:hover { border-color:var(--border-amber); color:var(--amber-glow); }
                .search-input { background:var(--bg-section-alt); border:1px solid var(--border-subtle); border-radius:0.625rem; padding:0.55rem 0.75rem 0.55rem 2.25rem; color:var(--text-primary); font-size:0.875rem; outline:none; width:100%; box-sizing:border-box; transition:border-color 0.15s; }
                .search-input:focus { border-color:var(--border-amber); }
                .filter-sel { background:var(--bg-section-alt); border:1px solid var(--border-subtle); border-radius:0.625rem; padding:0.55rem 2rem 0.55rem 0.75rem; color:var(--text-primary); font-size:0.8rem; font-weight:600; outline:none; appearance:none; cursor:pointer; }
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

            {/* Modal */}
            {modal && (
                <>
                    <div onClick={closeModal} style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
                    <div style={{ position: "fixed", inset: 0, zIndex: 91, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                        <div style={{ width: "100%", maxWidth: 480, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-2xl)", padding: "1.5rem", animation: "modalIn 0.25s ease", maxHeight: "90vh", overflowY: "auto" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                                <h2 style={{ margin: 0, fontSize: typography.lg, fontWeight: 800, color: cssVar.textPrimary }}>
                                    {modal === "create" ? "Nouveau restaurant" : modal === "edit" ? "Modifier le restaurant" : selected?.is_active ? "Suspendre le restaurant" : "Activer le restaurant"}
                                </h2>
                                <button onClick={closeModal} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-md)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", cursor: "pointer", color: cssVar.textMuted }}>
                                    <X size={15} />
                                </button>
                            </div>

                            {(modal === "create" || modal === "edit") && (
                                <RestaurantForm
                                    initial={modal === "edit" ? selected : null}
                                    onSubmit={modal === "edit" ? handleEdit : handleCreate}
                                    onClose={closeModal}
                                    loading={formLoading}
                                    error={formError}
                                />
                            )}

                            {modal === "toggle" && selected && (
                                <div>
                                    <p style={{ margin: "0 0 1.25rem", fontSize: typography.sm, color: cssVar.textMuted }}>
                                        {selected.is_active
                                            ? <>Suspendre <strong style={{ color: cssVar.textPrimary }}>«{selected.nom}»</strong> ? Les utilisateurs ne pourront plus se connecter.</>
                                            : <>Réactiver <strong style={{ color: cssVar.textPrimary }}>«{selected.nom}»</strong> et ses accès ?</>
                                        }
                                    </p>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button onClick={closeModal} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                                        <button onClick={handleToggle} disabled={formLoading} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: `1px solid ${selected.is_active ? "#ef4444" : "#22c55e"}`, background: selected.is_active ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)", color: selected.is_active ? "#ef4444" : "#22c55e", fontWeight: 700, fontSize: typography.sm, cursor: formLoading ? "not-allowed" : "pointer", opacity: formLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                            {formLoading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: `2px solid ${selected.is_active ? "#ef4444" : "#22c55e"}`, borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                                            {selected.is_active ? "Suspendre" : "Activer"}
                                        </button>
                                    </div>
                                </div>
                            )}
                            {modal === "delete" && selected && (
                                <div>
                                    <p style={{ margin: "0 0 1rem", fontSize: typography.sm, color: "#ef4444" }}>
                                        <strong>⚠️ Attention — Opération IRREVERSIBLE</strong>
                                    </p>
                                    <p style={{ margin: "0 0 1.25rem", fontSize: typography.sm, color: cssVar.textMuted }}>
                                        La suppression de <strong style={{ color: cssVar.textPrimary }}>«{selected.nom}»</strong> supprimera définitivement le restaurant et <strong>TOUTES ses données</strong> (utilisateurs, plats, commandes, paiements, etc.).
                                    </p>
                                    {deleteError && <div style={{ padding: "0.625rem 0.875rem", borderRadius: radius.lg, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: typography.sm, marginBottom: "0.75rem" }}>{deleteError}</div>}
                                    <div>
                                        <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Votre mot de passe Super Admin</label>
                                        <div style={{ position: "relative", marginBottom: "1rem" }}>
                                            <input type={showDeletePwd ? "text" : "password"} value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="••••••" style={{ width: "100%", display: "block", padding: "0.6rem 2.5rem 0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                                            <button type="button" onClick={() => setShowDeletePwd(v => !v)} aria-label={showDeletePwd ? "Masquer le mot de passe" : "Afficher le mot de passe"} title={showDeletePwd ? "Masquer" : "Afficher"} style={{ position: "absolute", right: "0.6rem", top: 0, bottom: 0, display: "flex", alignItems: "center", background: "none", border: "none", color: cssVar.textMuted, cursor: "pointer", padding: 0 }}>
                                                {showDeletePwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button onClick={closeModal} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                                        <button onClick={handleDelete} disabled={deleteLoading || !deletePassword} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid #ef4444", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontWeight: 700, fontSize: typography.sm, cursor: deleteLoading || !deletePassword ? "not-allowed" : "pointer", opacity: deleteLoading || !deletePassword ? 0.5 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                            {deleteLoading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #ef4444", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                                            Supprimer définitivement
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="rts-root rp-page-pad">
                <div className="rts-inner">

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.3rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "var(--radius-xl)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber-glow)" }}>
                                    <Building2 size={20} />
                                </div>
                                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary }}>Restaurants</h1>
                            </div>
                            {stats && (
                                <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                                    {stats.restaurants_total} restaurant{stats.restaurants_total > 1 ? "s" : ""} ·{" "}
                                    <span style={{ color: "#22c55e" }}>{stats.restaurants_actifs} actif{stats.restaurants_actifs > 1 ? "s" : ""}</span> ·{" "}
                                    <span style={{ color: "#ef4444" }}>{stats.restaurants_suspendus} suspendu{stats.restaurants_suspendus > 1 ? "s" : ""}</span>
                                </p>
                            )}
                        </div>
                        <button onClick={() => { setSelected(null); setFormError(null); setModal("create"); }} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>
                            <Plus size={16} /> Nouveau restaurant
                        </button>
                    </div>

                    {/* Stats cards */}
                    {stats && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
                            {[
                                { label: "Total", val: stats.restaurants_total, color: "var(--amber-glow)" },
                                { label: "Actifs", val: stats.restaurants_actifs, color: "#22c55e" },
                                { label: "Suspendus", val: stats.restaurants_suspendus, color: "#ef4444" },
                            ].map(s => (
                                <div key={s.label} style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "0.875rem 1rem" }}>
                                    <p style={{ margin: "0 0 2px", fontSize: typography.xs, color: cssVar.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}>{s.label}</p>
                                    <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.val}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Filtres */}
                    <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                            <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none" }} />
                            <input type="text" className="search-input" placeholder="Rechercher un restaurant…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div style={{ position: "relative" }}>
                            <select className="filter-sel" value={filterActif} onChange={e => setFilterActif(e.target.value as "" | "true" | "false")}>
                                <option value="">Tous les statuts</option>
                                <option value="true">Actifs</option>
                                <option value="false">Suspendus</option>
                            </select>
                            <ChevronDown size={12} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none" }} />
                        </div>
                        <button onClick={fetchAll} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 0.875rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                            <RefreshCw size={13} /> Actualiser
                        </button>
                    </div>

                    {/* Contenu */}
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "0.75rem", color: cssVar.textMuted }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                            Chargement des restaurants…
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid rgba(239,68,68,0.2)" }}>
                            <p style={{ color: cssVar.textSecondary, marginBottom: "1rem" }}>{error}</p>
                            <button onClick={fetchAll} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.25rem", borderRadius: radius.lg, border: "1px solid var(--border-amber)", background: "transparent", color: "var(--amber-glow)", cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}>
                                <RefreshCw size={14} /> Réessayer
                            </button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid var(--border-subtle)" }}>
                            <Building2 size={40} style={{ color: cssVar.textMuted, margin: "0 auto 1rem", display: "block" }} />
                            <h3 style={{ margin: "0 0 0.5rem", color: cssVar.textPrimary }}>Aucun restaurant</h3>
                            <p style={{ margin: "0 0 1.25rem", color: cssVar.textMuted, fontSize: typography.sm }}>
                                {search ? "Aucun résultat pour cette recherche." : "Créez votre premier restaurant sur la plateforme."}
                            </p>
                            <button onClick={() => setModal("create")} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>
                                <Plus size={15} /> Créer un restaurant
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Table desktop */}
                            <div className="rp-table-desktop" style={{ background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
                                <table className="rts-table">
                                    <thead>
                                        <tr>
                                            <th>Restaurant</th>
                                            <th>Email admin</th>
                                            <th>Téléphone</th>
                                            <th>Créé le</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(r => (
                                            <tr key={r.id} className="rts-row">
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                                        <div style={{ width: 34, height: 34, borderRadius: "var(--radius-lg)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "var(--amber-glow)", flexShrink: 0 }}>
                                                            {r.nom.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <span style={{ fontSize: typography.sm, fontWeight: 700, color: cssVar.textPrimary }}>{r.nom}</span>
                                                    </div>
                                                </td>
                                                <td><span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>{r.email_admin}</span></td>
                                                <td><span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>{r.telephone ?? "—"}</span></td>
                                                <td><span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>{fmt(r.created_at)}</span></td>
                                                <td><StatutBadge active={r.is_active} /></td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "0.3rem" }}>
                                                        <button title="Modifier" className="icon-btn" onClick={() => { setSelected(r); setFormError(null); setModal("edit"); }}><Pencil size={13} /></button>
                                                        <button title={r.is_active ? "Suspendre" : "Activer"} className="icon-btn" onClick={() => { setSelected(r); setModal("toggle"); }} style={{ color: r.is_active ? "#ef4444" : "#22c55e", borderColor: r.is_active ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)" }}>
                                                            <Power size={13} />
                                                        </button>
                                                        <button title="Supprimer" className="icon-btn" onClick={() => { setSelected(r); setDeletePassword(""); setDeleteError(""); setModal("delete"); }} style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}>
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cards mobile */}
                            <div className="rp-cards-mobile" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {filtered.map(r => (
                                    <div key={r.id} className="rts-card">
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-lg)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: "var(--amber-glow)", flexShrink: 0 }}>
                                                    {r.nom.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 700, color: cssVar.textPrimary }}>{r.nom}</p>
                                                    <span style={{ fontSize: "0.7rem", color: cssVar.textMuted }}>{r.email_admin}</span>
                                                </div>
                                            </div>
                                            <StatutBadge active={r.is_active} />
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: typography.xs, color: cssVar.textMuted }}>
                                            <span>{r.telephone ?? "Pas de tél."}</span>
                                            <span>Créé {fmt(r.created_at)}</span>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.4rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.5rem" }}>
                                            <button onClick={() => { setSelected(r); setFormError(null); setModal("edit"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.45rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                <Pencil size={12} /> Modifier
                                            </button>
                                            <button onClick={() => { setSelected(r); setModal("toggle"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.45rem", borderRadius: "var(--radius-md)", border: `1px solid ${r.is_active ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, background: "transparent", color: r.is_active ? "#ef4444" : "#22c55e", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                <Power size={12} /> {r.is_active ? "Suspendre" : "Activer"}
                                            </button>
                                            <button onClick={() => { setSelected(r); setDeletePassword(""); setDeleteError(""); setModal("delete"); }} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.45rem", borderRadius: "var(--radius-md)", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                <Trash2 size={12} /> Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
