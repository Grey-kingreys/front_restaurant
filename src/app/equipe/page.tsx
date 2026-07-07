"use client";
// src/app/equipe/page.tsx
// Gestion de l'équipe — Admin & Manager uniquement

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    listUsers,
    createUser,
    updateUser,
    toggleUser,
    adminResetUserPassword,
    deleteUser,
} from "@/lib/api/auth";
import type { User, Role, UserCreatePayload, UserUpdatePayload } from "@/types";
import { cssVar, typography, radius } from "@/theme/theme";
import { ROLE_LABELS, ROLE_COLORS } from "@/lib/navigation";
import {
    Users,
    Plus,
    X,
    Check,
    RefreshCw,
    Search,
    ChevronDown,
    UserCheck,
    UserX,
    KeyRound,
    Pencil,
    Play,
    Trash2,
} from "lucide-react";

const ROLES_AUTORISES: Role[] = ["Radmin", "Rmanager", "Rsuper_admin"];

const ROLES_CREABLES: { value: Role; label: string }[] = [
    { value: "Rmanager",        label: "Manager" },
    { value: "Rserveur",        label: "Serveur" },
    { value: "Rchef_cuisinier", label: "Chef Cuisinier" },
    { value: "Rcuisinier",      label: "Cuisinier" },
    { value: "Rcomptable",      label: "Comptable" },
];

const FILTER_ROLES: { value: string; label: string }[] = [
    { value: "",               label: "Tous les rôles" },
    { value: "Rmanager",        label: "Manager" },
    { value: "Rserveur",        label: "Serveur" },
    { value: "Rchef_cuisinier", label: "Chef Cuisinier" },
    { value: "Rcuisinier",      label: "Cuisinier" },
    { value: "Rcomptable",      label: "Comptable" },
];

// ── Composants utilitaires ───────────────────────────────────────────────────

function RoleBadge({ role }: { role: Role }) {
    const rc = ROLE_COLORS[role] ?? { bg: "rgba(100,100,100,0.1)", text: "#888", border: "rgba(100,100,100,0.2)" };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            padding: "0.2rem 0.55rem", borderRadius: "9999px",
            fontSize: "0.7rem", fontWeight: 700,
            color: rc.text, background: rc.bg, border: `1px solid ${rc.border}`,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: rc.text, flexShrink: 0 }} />
            {ROLE_LABELS[role] ?? role}
        </span>
    );
}

function StatutBadge({ actif }: { actif: boolean }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            padding: "0.2rem 0.55rem", borderRadius: "9999px",
            fontSize: "0.7rem", fontWeight: 700,
            color: actif ? "#22c55e" : "#ef4444",
            background: actif ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${actif ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: actif ? "#22c55e" : "#ef4444" }} />
            {actif ? "Actif" : "Inactif"}
        </span>
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

// ── Formulaire création / modification ───────────────────────────────────────

interface UserFormProps {
    initial?: User | null;
    isAdmin: boolean;
    onSubmit: (data: UserCreatePayload | UserUpdatePayload) => Promise<void>;
    onClose: () => void;
    loading: boolean;
    error: string | null;
}

function UserForm({ initial, isAdmin, onSubmit, onClose, loading, error }: UserFormProps) {
    const isEdit = !!initial;
    const [role, setRole]           = useState<Role>(initial?.role ?? "Rserveur");
    const [nom, setNom]             = useState(initial?.nom_complet ?? "");
    const [email, setEmail]         = useState(initial?.email ?? "");
    const [telephone, setTelephone] = useState(initial?.telephone ?? "");
    const [password, setPassword]   = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        // Validation des champs obligatoires
        if (!nom?.trim()) {
            setValidationError("Le nom complet est obligatoire.");
            return;
        }
        if (!email?.trim()) {
            setValidationError("L'email est obligatoire.");
            return;
        }
        if (!isEdit && !password?.trim()) {
            setValidationError("Le mot de passe est obligatoire.");
            return;
        }

        if (isEdit) {
            await onSubmit({ nom_complet: nom || undefined, email: email || undefined, telephone: telephone || undefined, role } as UserUpdatePayload);
        } else {
            await onSubmit({ role, nom_complet: nom || undefined, email: email || undefined, telephone: telephone || undefined, password: password || undefined } as UserCreatePayload);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {(error || validationError) && (
                <div style={{ padding: "0.625rem 0.875rem", borderRadius: radius.lg, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: typography.sm }}>
                    {validationError || error}
                </div>
            )}

            {/* Rôle */}
            <div>
                <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>
                    Rôle *
                </label>
                <div style={{ position: "relative" }}>
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value as Role)}
                        disabled={isEdit && !isAdmin}
                        style={{ width: "100%", padding: "0.6rem 2rem 0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, appearance: "none", cursor: "pointer" }}
                    >
                        {ROLES_CREABLES.map(r => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                        {isAdmin && <option value="Radmin">Administrateur</option>}
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: "0.65rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none" }} />
                </div>
            </div>

            {/* Nom complet */}
            <div>
                <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>
                    Nom complet {role !== "Rtable" ? "*" : ""}
                </label>
                <input
                    type="text"
                    value={nom}
                    onChange={e => setNom(e.target.value)}
                    placeholder="Prénom Nom"
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }}
                />
            </div>

            {/* Email */}
            {role !== "Rtable" && (
                <div>
                    <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>
                        Email *
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="email@restaurant.com"
                        style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }}
                    />
                </div>
            )}

            {/* Téléphone */}
            <div>
                <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>
                    Téléphone
                </label>
                <input
                    type="tel"
                    value={telephone}
                    onChange={e => setTelephone(e.target.value)}
                    placeholder="+224 6xx xxx xxx"
                    style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }}
                />
            </div>

            {/* Mot de passe (création uniquement) */}
            {!isEdit && (
                <div>
                    <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>
                        Mot de passe initial
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Laissez vide pour auto-générer"
                        style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }}
                    />
                    <p style={{ margin: "0.3rem 0 0", fontSize: "0.7rem", color: cssVar.textMuted }}>
                        L&apos;utilisateur devra changer son mot de passe à la première connexion.
                    </p>
                </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.25rem" }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                >
                    {loading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #0c0a09", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                    {isEdit ? "Enregistrer" : "Créer l'utilisateur"}
                </button>
            </div>
        </form>
    );
}

// ── Formulaire reset mot de passe ────────────────────────────────────────────

function ResetPasswordForm({ user, onSubmit, onClose, loading, error }: {
    user: User;
    onSubmit: (password: string) => Promise<void>;
    onClose: () => void;
    loading: boolean;
    error: string | null;
}) {
    const [password, setPassword]   = useState("");
    const [confirm, setConfirm]     = useState("");
    const [localErr, setLocalErr]   = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) { setLocalErr("Minimum 8 caractères."); return; }
        if (password !== confirm) { setLocalErr("Les mots de passe ne correspondent pas."); return; }
        setLocalErr(null);
        await onSubmit(password);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                Réinitialiser le mot de passe de <strong style={{ color: cssVar.textPrimary }}>{user.nom_complet ?? user.login}</strong>
            </p>
            {(error || localErr) && (
                <div style={{ padding: "0.625rem 0.875rem", borderRadius: radius.lg, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: typography.sm }}>
                    {error ?? localErr}
                </div>
            )}
            <div>
                <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Nouveau mot de passe *</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 caractères" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
            </div>
            <div>
                <label style={{ display: "block", fontSize: typography.xs, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "0.375rem" }}>Confirmer *</label>
                <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Répétez le mot de passe" style={{ width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                <button type="submit" disabled={loading} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid #f59e0b", background: "rgba(245,158,11,0.08)", color: "#f59e0b", fontWeight: 700, fontSize: typography.sm, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    {loading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #f59e0b", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                    Réinitialiser
                </button>
            </div>
        </form>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────

type ModalMode = "create" | "edit" | "reset" | "delete" | null;

export default function EquipePage() {
    const { user, isAuthenticated, isLoading, impersonate, hasPermission } = useAuth();
    const router = useRouter();

    const [users, setUsers]             = useState<User[]>([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<string | null>(null);
    const [search, setSearch]           = useState("");
    const [filterRole, setFilterRole]   = useState("");
    const [filterActif, setFilterActif] = useState<"" | "true" | "false">("");
    const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const [modal, setModal]             = useState<ModalMode>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError]     = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("manage_equipe")) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, router]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const filters: { role?: string; actif?: boolean } = {};
            if (filterRole) filters.role = filterRole;
            if (filterActif !== "") filters.actif = filterActif === "true";
            const res = await listUsers(filters);
            if (res.success && res.data) setUsers(res.data.users);
            else setError("Impossible de charger l'équipe.");
        } catch {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    }, [filterRole, filterActif]);

    useEffect(() => { if (isAuthenticated) fetchUsers(); }, [fetchUsers, isAuthenticated]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const openCreate = () => { setSelectedUser(null); setFormError(null); setModal("create"); };
    const openEdit   = (u: User) => { setSelectedUser(u); setFormError(null); setModal("edit"); };
    const openReset  = (u: User) => { setSelectedUser(u); setFormError(null); setModal("reset"); };
    const openDelete = (u: User) => { setSelectedUser(u); setFormError(null); setModal("delete"); };
    const closeModal = () => { setModal(null); setSelectedUser(null); setFormError(null); };

    const handleCreate = async (data: UserCreatePayload | UserUpdatePayload) => {
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await createUser(data as UserCreatePayload);
            if (res.success) {
                showToast("Utilisateur créé avec succès.");
                closeModal();
                fetchUsers();
            } else {
                const errs = res.errors;
                const msg = errs ? Object.values(errs).flat().join(" — ") : "Erreur de création.";
                setFormError(msg);
            }
        } catch {
            setFormError("Erreur de connexion.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (data: UserCreatePayload | UserUpdatePayload) => {
        if (!selectedUser) return;
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await updateUser(selectedUser.id, data as UserUpdatePayload);
            if (res.success) {
                showToast("Utilisateur mis à jour.");
                closeModal();
                fetchUsers();
            } else {
                const errs = res.errors;
                setFormError(errs ? Object.values(errs).flat().join(" — ") : "Erreur.");
            }
        } catch {
            setFormError("Erreur de connexion.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleToggle = async (u: User) => {
        try {
            const res = await toggleUser(u.id);
            if (res.success) {
                showToast(`${u.nom_complet ?? u.login} ${u.actif ? "désactivé" : "activé"}.`);
                fetchUsers();
            } else {
                showToast("Action impossible.", "error");
            }
        } catch {
            showToast("Erreur de connexion.", "error");
        }
    };

    const handleResetPassword = async (password: string) => {
        if (!selectedUser) return;
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await adminResetUserPassword(selectedUser.id, password);
            if (res.success) {
                showToast("Mot de passe réinitialisé.");
                closeModal();
            } else {
                setFormError("Impossible de réinitialiser le mot de passe.");
            }
        } catch {
            setFormError("Erreur de connexion.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await deleteUser(selectedUser.id);
            if (res.success) {
                showToast(`${selectedUser.nom_complet ?? selectedUser.login} désactivé définitivement.`);
                closeModal();
                fetchUsers();
            } else {
                setFormError(res.message || "Impossible de désactiver l'utilisateur.");
            }
        } catch {
            setFormError("Erreur de connexion.");
        } finally {
            setFormLoading(false);
        }
    };

    const ROLES_SIMULABLES: Role[] = ["Rmanager", "Rserveur", "Rchef_cuisinier", "Rcuisinier", "Rcomptable", "Rtable"];

    const handleSimuler = async (u: User) => {
        try {
            await impersonate(u.id);
        } catch {
            showToast("Impossible de simuler cet utilisateur.", "error");
        }
    };

    if (isLoading || !user) return <PageLoader />;
    if (!hasPermission("manage_equipe")) return null;

    const isAdmin = hasPermission("impersonate");

    const filtered = users.filter(u => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            (u.nom_complet ?? "").toLowerCase().includes(q) ||
            u.login.toLowerCase().includes(q) ||
            (u.email ?? "").toLowerCase().includes(q)
        );
    });

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                @keyframes modalIn { from { opacity:0; transform:translateY(12px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
                .eq-root { min-height:100vh; background:var(--bg-dark); }
                .eq-inner { max-width:1100px; margin:0 auto; }
                .eq-table { width:100%; border-collapse:collapse; }
                .eq-table th { padding:0.6rem 0.875rem; text-align:left; font-size:0.72rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); border-bottom:1px solid var(--border-subtle); white-space:nowrap; }
                .eq-table td { padding:0.75rem 0.875rem; border-bottom:1px solid var(--border-subtle); vertical-align:middle; }
                .eq-row { animation:fadeIn 0.2s ease; cursor:default; }
                .eq-row:hover td { background:var(--bg-section-alt); }
                .icon-btn { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:0.5rem; border:1px solid var(--border-subtle); background:transparent; cursor:pointer; color:var(--text-muted); transition:all 0.15s; }
                .icon-btn:hover { border-color:var(--border-amber); color:var(--amber-glow); }
                .eq-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:1rem; padding:0.875rem 1rem; animation:fadeIn 0.2s ease; display:flex; flex-direction:column; gap:0.625rem; }
                .search-input { background:var(--bg-section-alt); border:1px solid var(--border-subtle); border-radius:0.625rem; padding:0.55rem 0.75rem 0.55rem 2.25rem; color:var(--text-primary); font-size:0.875rem; outline:none; width:100%; box-sizing:border-box; transition:border-color 0.15s; }
                .search-input:focus { border-color:var(--border-amber); }
                select.filter-sel { background:var(--bg-section-alt); border:1px solid var(--border-subtle); border-radius:0.625rem; padding:0.55rem 2rem 0.55rem 0.75rem; color:var(--text-primary); font-size:0.8rem; font-weight:600; outline:none; appearance:none; cursor:pointer; }
                select.filter-sel:focus { border-color:var(--border-amber); }
                @media (min-width: 1024px) { .rp-cards-mobile { display:none !important; } }
                @media (max-width: 1023px) { .rp-table-desktop { display:none !important; } }
            `}</style>

            {/* Glow */}
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "35vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 70% 35% at 50% -5%, rgba(245,158,11,0.05) 0%, transparent 70%)" }} />

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
                        <div style={{ width: "100%", maxWidth: 460, background: "var(--bg-card)", border: "1px solid var(--border-amber)", borderRadius: "1.25rem", padding: "1.5rem", animation: "modalIn 0.25s ease", maxHeight: "90vh", overflowY: "auto" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                                <h2 style={{ margin: 0, fontSize: typography.lg, fontWeight: 800, color: cssVar.textPrimary }}>
                                    {modal === "create" ? "Ajouter un membre" : modal === "edit" ? "Modifier le membre" : "Réinitialiser le mot de passe"}
                                </h2>
                                <button onClick={closeModal} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.5rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", cursor: "pointer", color: cssVar.textMuted }}>
                                    <X size={15} />
                                </button>
                            </div>

                            {modal === "delete" && selectedUser ? (
                                <div>
                                    <p style={{ margin: "0 0 1rem", fontSize: typography.sm, color: cssVar.textMuted }}>
                                        Êtes-vous sûr de vouloir désactiver <strong style={{ color: cssVar.textPrimary }}>{selectedUser.nom_complet ?? selectedUser.login}</strong> ?
                                    </p>
                                    <p style={{ margin: "0 0 1.25rem", fontSize: typography.xs, color: "#f59e0b" }}>
                                        ⚠️ L'utilisateur sera désactivé mais ses données historiques (commandes, paiements) seront conservées.
                                    </p>
                                    {formError && <div style={{ padding: "0.625rem 0.875rem", borderRadius: radius.lg, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: typography.sm, marginBottom: "0.75rem" }}>{formError}</div>}
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button onClick={closeModal} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                                        <button onClick={handleDelete} disabled={formLoading} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid #ef4444", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontWeight: 700, fontSize: typography.sm, cursor: formLoading ? "not-allowed" : "pointer", opacity: formLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                            {formLoading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #ef4444", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                                            Désactiver
                                        </button>
                                    </div>
                                </div>
                            ) : modal === "reset" && selectedUser ? (
                                <ResetPasswordForm
                                    user={selectedUser}
                                    onSubmit={handleResetPassword}
                                    onClose={closeModal}
                                    loading={formLoading}
                                    error={formError}
                                />
                            ) : (
                                <UserForm
                                    initial={modal === "edit" ? selectedUser : null}
                                    isAdmin={isAdmin}
                                    onSubmit={modal === "edit" ? handleEdit : handleCreate}
                                    onClose={closeModal}
                                    loading={formLoading}
                                    error={formError}
                                />
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="eq-root rp-page-pad">
                <div className="eq-inner">

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.3rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "0.875rem", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber-glow)" }}>
                                    <Users size={20} />
                                </div>
                                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary }}>
                                    Mon équipe
                                </h1>
                            </div>
                            <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                                {filtered.length} membre{filtered.length > 1 ? "s" : ""} · Gérez les accès et les rôles
                            </p>
                        </div>
                        <button
                            onClick={openCreate}
                            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}
                        >
                            <Plus size={16} />
                            Ajouter un membre
                        </button>
                    </div>

                    {/* Filtres */}
                    <div style={{ display: "flex", gap: "0.625rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" }}>
                        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                            <Search size={14} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none" }} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Rechercher nom, email, login…"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={{ position: "relative" }}>
                            <select className="filter-sel" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                                {FILTER_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                            <ChevronDown size={12} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none" }} />
                        </div>
                        <div style={{ position: "relative" }}>
                            <select className="filter-sel" value={filterActif} onChange={e => setFilterActif(e.target.value as "" | "true" | "false")}>
                                <option value="">Tous les statuts</option>
                                <option value="true">Actifs</option>
                                <option value="false">Inactifs</option>
                            </select>
                            <ChevronDown size={12} style={{ position: "absolute", right: "0.5rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none" }} />
                        </div>
                        <button
                            onClick={fetchUsers}
                            style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 0.875rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}
                        >
                            <RefreshCw size={13} />
                            Actualiser
                        </button>
                    </div>

                    {/* Contenu */}
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "0.75rem", color: cssVar.textMuted }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                            Chargement de l&apos;équipe…
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid rgba(239,68,68,0.2)" }}>
                            <p style={{ color: cssVar.textSecondary, marginBottom: "1rem" }}>{error}</p>
                            <button onClick={fetchUsers} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.25rem", borderRadius: radius.lg, border: "1px solid var(--border-amber)", background: "transparent", color: "var(--amber-glow)", cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}>
                                <RefreshCw size={14} /> Réessayer
                            </button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid var(--border-subtle)" }}>
                            <Users size={40} style={{ color: cssVar.textMuted, margin: "0 auto 1rem", display: "block" }} />
                            <h3 style={{ margin: "0 0 0.5rem", color: cssVar.textPrimary }}>Aucun membre trouvé</h3>
                            <p style={{ margin: 0, color: cssVar.textMuted, fontSize: typography.sm }}>
                                {search ? "Modifiez votre recherche." : "Ajoutez votre premier membre d'équipe."}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Table desktop */}
                            <div className="rp-table-desktop" style={{ background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
                                <table className="eq-table">
                                    <thead>
                                        <tr>
                                            <th>Membre</th>
                                            <th>Rôle</th>
                                            <th>Login</th>
                                            <th>Email</th>
                                            <th>Statut</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(u => (
                                            <tr key={u.id} className="eq-row">
                                                <td>
                                                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "var(--amber-glow)", flexShrink: 0 }}>
                                                            {(u.nom_complet ?? u.login).slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>{u.nom_complet ?? "—"}</p>
                                                            {u.must_change_password && (
                                                                <span style={{ fontSize: "0.65rem", color: "#f59e0b" }}>⚠ MDP à changer</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td><RoleBadge role={u.role} /></td>
                                                <td><span style={{ fontFamily: "monospace", fontSize: typography.xs, background: "var(--bg-section-alt)", padding: "0.15rem 0.4rem", borderRadius: "0.375rem", color: cssVar.textSecondary }}>{u.login}</span></td>
                                                <td><span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>{u.email ?? "—"}</span></td>
                                                <td><StatutBadge actif={u.actif} /></td>
                                                <td>
                                                    <div style={{ display: "flex", gap: "0.3rem" }}>
                                                        <button title="Modifier" className="icon-btn" onClick={() => openEdit(u)}><Pencil size={13} /></button>
                                                        <button title="Réinitialiser MDP" className="icon-btn" onClick={() => openReset(u)}><KeyRound size={13} /></button>
                                                        <button
                                                            title={u.actif ? "Désactiver" : "Activer"}
                                                            className="icon-btn"
                                                            onClick={() => handleToggle(u)}
                                                            style={{ color: u.actif ? "#ef4444" : "#22c55e", borderColor: u.actif ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)" }}
                                                        >
                                                            {u.actif ? <UserX size={13} /> : <UserCheck size={13} />}
                                                        </button>
                                                        {isAdmin && ROLES_SIMULABLES.includes(u.role as Role) && u.actif && u.id !== user.id && (
                                                            <button
                                                                title="Simuler cet utilisateur"
                                                                className="icon-btn"
                                                                onClick={() => handleSimuler(u)}
                                                                style={{ color: "#7c3aed", borderColor: "rgba(124,58,237,0.3)" }}
                                                            >
                                                                <Play size={13} />
                                                            </button>
                                                        )}
                                                        {u.actif && u.id !== user.id && (
                                                            <button
                                                                title="Désactiver définitivement"
                                                                className="icon-btn"
                                                                onClick={() => openDelete(u)}
                                                                style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
                                                            >
                                                                <Trash2 size={13} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cards mobile */}
                            <div className="rp-cards-mobile" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {filtered.map(u => (
                                    <div key={u.id} className="eq-card">
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                                                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 800, color: "var(--amber-glow)", flexShrink: 0 }}>
                                                    {(u.nom_complet ?? u.login).slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 700, color: cssVar.textPrimary }}>{u.nom_complet ?? "—"}</p>
                                                    <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: cssVar.textMuted }}>{u.login}</span>
                                                </div>
                                            </div>
                                            <StatutBadge actif={u.actif} />
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <RoleBadge role={u.role} />
                                            <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>{u.email ?? "Pas d'email"}</span>
                                        </div>
                                        {u.must_change_password && (
                                            <span style={{ fontSize: "0.7rem", color: "#f59e0b", background: "rgba(245,158,11,0.08)", padding: "0.2rem 0.5rem", borderRadius: "0.375rem", width: "fit-content" }}>⚠ MDP temporaire à changer</span>
                                        )}
                                        <div style={{ display: "flex", gap: "0.4rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.5rem" }}>
                                            <button onClick={() => openEdit(u)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.45rem", borderRadius: "0.5rem", border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                <Pencil size={12} /> Modifier
                                            </button>
                                            <button onClick={() => openReset(u)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.45rem", borderRadius: "0.5rem", border: "1px solid rgba(245,158,11,0.3)", background: "transparent", color: "#f59e0b", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                <KeyRound size={12} /> MDP
                                            </button>
                                            <button onClick={() => handleToggle(u)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.45rem", borderRadius: "0.5rem", border: `1px solid ${u.actif ? "rgba(239,68,68,0.3)" : "rgba(34,197,94,0.3)"}`, background: "transparent", color: u.actif ? "#ef4444" : "#22c55e", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                {u.actif ? <><UserX size={12} /> Désactiver</> : <><UserCheck size={12} /> Activer</>}
                                            </button>
                                            {isAdmin && ROLES_SIMULABLES.includes(u.role as Role) && u.actif && u.id !== user.id && (
                                                <button onClick={() => handleSimuler(u)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.45rem 0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(124,58,237,0.3)", background: "transparent", color: "#7c3aed", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                    <Play size={12} /> Simuler
                                                </button>
                                            )}
                                            {u.actif && u.id !== user.id && (
                                                <button onClick={() => openDelete(u)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.45rem 0.6rem", borderRadius: "0.5rem", border: "1px solid rgba(239,68,68,0.3)", background: "transparent", color: "#ef4444", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
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
