"use client";
// src/app/tables/page.tsx
// Gestion des tables & QR Codes — Admin & Manager

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
    listTables,
    createTable,
    updateTable,
    deleteTable,
    getQRCode,
    regenerateQRCode,
    type Table,
    type TableCreatePayload,
    type TableUpdatePayload,
} from "@/lib/api/restaurant";
import { cssVar, typography, radius } from "@/theme/theme";
import {
    QrCode,
    Plus,
    X,
    Check,
    RefreshCw,
    Trash2,
    Pencil,
    Download,
    ChevronDown,
} from "lucide-react";

const STATUT_TABLE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    libre:       { label: "Libre",      color: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)" },
    en_attente:  { label: "En attente", color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  border: "rgba(245,158,11,0.25)" },
    prete:       { label: "Prête",      color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)" },
    servie:      { label: "Servie",     color: "#a855f7", bg: "rgba(168,85,247,0.1)",  border: "rgba(168,85,247,0.25)" },
};

function PageLoader() {
    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}

function StatutBadge({ statut }: { statut: string }) {
    const cfg = STATUT_TABLE_CONFIG[statut] ?? STATUT_TABLE_CONFIG.libre;
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.55rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: 700, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color }} />
            {cfg.label}
        </span>
    );
}

// ── Formulaire table ─────────────────────────────────────────────────────────

function slugifyLogin(s: string) {
    return s.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

function TableForm({ initial, onSubmitCreate, onSubmitUpdate, onClose, loading, error }: {
    initial?: Table | null;
    onSubmitCreate: (data: TableCreatePayload) => Promise<void>;
    onSubmitUpdate: (data: TableUpdatePayload) => Promise<void>;
    onClose: () => void;
    loading: boolean;
    error: string | null;
}) {
    const isEdit = !!initial;

    const [numero,      setNumero]      = useState(initial?.numero_table ?? "");
    const [places,      setPlaces]      = useState(String(initial?.nombre_places ?? 4));
    const [login,       setLogin]       = useState("");
    const [loginTouched, setLoginTouched] = useState(false);
    const [password,    setPassword]    = useState("");
    const [nomComplet,  setNomComplet]  = useState(
        initial ? (initial as Table & { utilisateur_nom?: string }).utilisateur_nom ?? "" : ""
    );

    // Auto-suggestion du login à partir du numéro de table (création seulement)
    const handleNumeroChange = (val: string) => {
        setNumero(val);
        if (!isEdit && !loginTouched) {
            setLogin(slugifyLogin(`table_${val}`));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            const payload: TableUpdatePayload = { numero_table: numero, nombre_places: parseInt(places, 10) || 4 };
            if (nomComplet.trim()) payload.nom_complet = nomComplet.trim();
            await onSubmitUpdate(payload);
        } else {
            await onSubmitCreate({
                numero_table: numero,
                nombre_places: parseInt(places, 10) || 4,
                login: login.trim(),
                nom_complet: nomComplet.trim() || undefined,
                password: password.trim() || undefined,
            });
        }
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "0.6rem 0.75rem", borderRadius: radius.lg,
        border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)",
        color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box",
    };
    const labelStyle: React.CSSProperties = {
        display: "block", fontSize: typography.xs, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: "0.06em",
        color: cssVar.textMuted, marginBottom: "0.375rem",
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {error && (
                <div style={{ padding: "0.625rem 0.875rem", borderRadius: radius.lg, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: typography.sm }}>
                    {error}
                </div>
            )}

            {/* Numéro de table */}
            <div>
                <label style={labelStyle}>Numéro / Nom de la table *</label>
                <input type="text" value={numero} onChange={e => handleNumeroChange(e.target.value)}
                    placeholder="Ex: 01, VIP, Terrasse 3…" required style={inputStyle} />
            </div>

            {/* Nombre de places */}
            <div>
                <label style={labelStyle}>Nombre de places *</label>
                <div style={{ position: "relative" }}>
                    <select value={places} onChange={e => setPlaces(e.target.value)}
                        style={{ ...inputStyle, padding: "0.6rem 2rem 0.6rem 0.75rem", appearance: "none" }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map(n => (
                            <option key={n} value={n}>{n} place{n > 1 ? "s" : ""}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} style={{ position: "absolute", right: "0.65rem", top: "50%", transform: "translateY(-50%)", color: cssVar.textMuted, pointerEvents: "none" }} />
                </div>
            </div>

            {/* Nom affiché (optionnel) */}
            <div>
                <label style={labelStyle}>Nom affiché {!isEdit && "(optionnel)"}</label>
                <input type="text" value={nomComplet} onChange={e => setNomComplet(e.target.value)}
                    placeholder={`Ex: Table ${numero || "01"}`} style={inputStyle} />
                {!isEdit && <p style={{ margin: "3px 0 0", fontSize: "0.68rem", color: cssVar.textMuted }}>Si vide, le numéro de table est utilisé.</p>}
            </div>

            {/* Login — création uniquement */}
            {!isEdit && (
                <div>
                    <label style={labelStyle}>Login du compte table *</label>
                    <input type="text" value={login}
                        onChange={e => { setLogin(slugifyLogin(e.target.value)); setLoginTouched(true); }}
                        placeholder="Ex: lebaobab_table_01" required
                        style={{ ...inputStyle, fontFamily: "monospace" }} />
                    <p style={{ margin: "3px 0 0", fontSize: "0.68rem", color: cssVar.textMuted }}>
                        Identifiant unique (lettres minuscules, chiffres, _). Utilisé pour la connexion QR.
                    </p>
                </div>
            )}

            {/* Mot de passe — création uniquement, optionnel */}
            {!isEdit && (
                <div>
                    <label style={labelStyle}>Mot de passe (optionnel)</label>
                    <input type="text" value={password} onChange={e => setPassword(e.target.value)}
                        minLength={8} placeholder="Min. 8 caractères — vide = QR uniquement"
                        style={inputStyle} />
                    <p style={{ margin: "3px 0 0", fontSize: "0.68rem", color: cssVar.textMuted }}>
                        Permet la connexion manuelle (login + mot de passe). Laissé vide, la table se connecte uniquement via QR code.
                    </p>
                </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", paddingTop: "0.25rem" }}>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                <button type="submit" disabled={loading} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                    {loading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #0c0a09", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                    {isEdit ? "Enregistrer" : "Créer la table"}
                </button>
            </div>
        </form>
    );
}

// ── Page principale ───────────────────────────────────────────────────────────

type ModalMode = "create" | "edit" | "delete" | "qr" | null;

export default function TablesPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();

    const [tables, setTables]           = useState<Table[]>([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState<string | null>(null);
    const [toast, setToast]             = useState<{ msg: string; type: "success" | "error" } | null>(null);

    const [modal, setModal]             = useState<ModalMode>(null);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError]     = useState<string | null>(null);
    const [qrUrl, setQrUrl]             = useState<string | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("manage_tables")) router.replace("/dashboard");
    }, [isLoading, isAuthenticated, user, router]);

    const fetchTables = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listTables();
            if (res.success && res.data) setTables(res.data.tables);
            else setError("Impossible de charger les tables.");
        } catch {
            setError("Erreur de connexion.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { if (isAuthenticated) fetchTables(); }, [fetchTables, isAuthenticated]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const closeModal = () => { setModal(null); setSelectedTable(null); setFormError(null); setQrUrl(null); };

    const handleCreate = async (data: TableCreatePayload) => {
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await createTable(data);
            if (res.success) {
                showToast("Table créée avec succès.");
                closeModal();
                fetchTables();
            } else {
                const errs = res.errors;
                setFormError(errs ? Object.values(errs).flat().join(" — ") : res.message || "Erreur de création.");
            }
        } catch {
            setFormError("Erreur de connexion.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleEdit = async (data: TableUpdatePayload) => {
        if (!selectedTable) return;
        setFormLoading(true);
        setFormError(null);
        try {
            const res = await updateTable(selectedTable.id, data);
            if (res.success) {
                showToast("Table mise à jour.");
                closeModal();
                fetchTables();
            } else {
                const errs = res.errors;
                setFormError(errs ? Object.values(errs).flat().join(" — ") : "Erreur de mise à jour.");
            }
        } catch {
            setFormError("Erreur de connexion.");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTable) return;
        setFormLoading(true);
        try {
            const res = await deleteTable(selectedTable.id);
            if (res.success) {
                showToast("Table supprimée.");
                closeModal();
                fetchTables();
            } else {
                showToast("Impossible de supprimer.", "error");
            }
        } catch {
            showToast("Erreur de connexion.", "error");
        } finally {
            setFormLoading(false);
        }
    };

    // Affiche le QR existant sans toucher au token
    const handleShowQR = async (table: Table) => {
        setSelectedTable(table);
        setFormLoading(true);
        setModal("qr");
        setQrUrl(null);
        try {
            const res = await getQRCode(table.id);
            if (res.success && res.data?.qr_code_url) {
                setQrUrl(res.data.qr_code_url);
            } else {
                showToast("QR code introuvable.", "error");
                closeModal();
            }
        } catch {
            showToast("Erreur.", "error");
            closeModal();
        } finally {
            setFormLoading(false);
        }
    };

    // Crée un premier QR (table sans QR) OU regénère en invalidant l'ancien
    const handleRegenerateQR = async () => {
        if (!selectedTable) return;
        setFormLoading(true);
        try {
            const res = await regenerateQRCode(selectedTable.id);
            if (res.success && res.data) {
                setQrUrl(res.data.qr_code_url);
                fetchTables();
                showToast("Nouveau QR code généré.");
            } else {
                showToast("Impossible de générer le QR code.", "error");
            }
        } catch {
            showToast("Erreur.", "error");
        } finally {
            setFormLoading(false);
        }
    };

    // Créer le premier QR pour une table qui n'en a pas encore
    const handleCreateQR = async (table: Table) => {
        setSelectedTable(table);
        setFormLoading(true);
        setModal("qr");
        setQrUrl(null);
        try {
            const res = await regenerateQRCode(table.id);
            if (res.success && res.data) {
                setQrUrl(res.data.qr_code_url);
                fetchTables();
            } else {
                showToast("Impossible de créer le QR code.", "error");
                closeModal();
            }
        } catch {
            showToast("Erreur.", "error");
            closeModal();
        } finally {
            setFormLoading(false);
        }
    };

    const handleDownloadQR = () => {
        if (!qrUrl || !selectedTable) return;
        const a = document.createElement("a");
        a.href = qrUrl;
        a.download = `qr-table-${selectedTable.numero_table}.png`;
        a.target = "_blank";
        a.click();
    };

    if (isLoading || !user) return <PageLoader />;
    if (!hasPermission("manage_tables")) return null;

    const isAdmin = hasPermission("manage_tables");
    const libres = tables.filter(t => (t as unknown as { statut_courant: string }).statut_courant === "libre").length;
    const occupees = tables.length - libres;

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes toastIn { from { opacity:0; transform:translateX(60px); } to { opacity:1; transform:translateX(0); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
                @keyframes modalIn { from { opacity:0; transform:translateY(12px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
                .tbl-root { min-height:100vh; background:var(--bg-dark); }
                .tbl-inner { max-width:1100px; margin:0 auto; }
                .tbl-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px, 1fr)); gap:1rem; }
                .tbl-card { background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:1.125rem; padding:1.125rem; display:flex; flex-direction:column; gap:0.75rem; animation:fadeIn 0.2s ease; transition:border-color 0.15s, box-shadow 0.15s; }
                .tbl-card:hover { border-color:var(--border-amber); box-shadow:0 2px 12px rgba(0,0,0,0.2); }
                .icon-btn { display:inline-flex; align-items:center; justify-content:center; width:32px; height:32px; border-radius:0.5rem; border:1px solid var(--border-subtle); background:transparent; cursor:pointer; color:var(--text-muted); transition:all 0.15s; }
                .icon-btn:hover { border-color:var(--border-amber); color:var(--amber-glow); }
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
                        <div style={{ width: "100%", maxWidth: 420, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "1.25rem", padding: "1.5rem", animation: "modalIn 0.25s ease" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                                <h2 style={{ margin: 0, fontSize: typography.lg, fontWeight: 800, color: cssVar.textPrimary }}>
                                    {modal === "create" ? "Nouvelle table" : modal === "edit" ? "Modifier la table" : modal === "delete" ? "Supprimer la table" : "QR Code"}
                                </h2>
                                <button onClick={closeModal} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "0.5rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", cursor: "pointer", color: cssVar.textMuted }}>
                                    <X size={15} />
                                </button>
                            </div>

                            {(modal === "create" || modal === "edit") && (
                                <TableForm
                                    initial={modal === "edit" ? selectedTable : null}
                                    onSubmitCreate={handleCreate}
                                    onSubmitUpdate={handleEdit}
                                    onClose={closeModal}
                                    loading={formLoading}
                                    error={formError}
                                />
                            )}

                            {modal === "delete" && selectedTable && (
                                <div>
                                    <p style={{ margin: "0 0 1.25rem", fontSize: typography.sm, color: cssVar.textMuted }}>
                                        Supprimer définitivement la table <strong style={{ color: cssVar.textPrimary }}>«{selectedTable.numero_table}»</strong> et son compte associé ?
                                        Cette action est irréversible.
                                    </p>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button onClick={closeModal} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Annuler</button>
                                        <button onClick={handleDelete} disabled={formLoading} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid #ef4444", background: "rgba(239,68,68,0.08)", color: "#ef4444", fontWeight: 700, fontSize: typography.sm, cursor: formLoading ? "not-allowed" : "pointer", opacity: formLoading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                            {formLoading && <div style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid #ef4444", borderTopColor: "transparent", animation: "spin .6s linear infinite" }} />}
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {modal === "qr" && (
                                <div style={{ textAlign: "center" }}>
                                    {formLoading ? (
                                        <div style={{ padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", color: cssVar.textMuted }}>
                                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                                            Chargement du QR code…
                                        </div>
                                    ) : qrUrl ? (
                                        <>
                                            <p style={{ margin: "0 0 1rem", fontSize: typography.sm, color: cssVar.textMuted }}>
                                                QR Code pour <strong style={{ color: cssVar.textPrimary }}>Table {selectedTable?.numero_table}</strong>
                                            </p>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={qrUrl} alt="QR Code" style={{ maxWidth: 220, width: "100%", borderRadius: "0.75rem", border: "1px solid var(--border-subtle)", background: "#fff", padding: "0.5rem" }} />
                                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                                                <button onClick={handleDownloadQR} style={{ flex: 2, padding: "0.65rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                                    <Download size={15} /> Télécharger
                                                </button>
                                                <button onClick={closeModal} style={{ flex: 1, padding: "0.65rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>Fermer</button>
                                            </div>
                                            <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-subtle)" }}>
                                                <p style={{ margin: "0 0 0.5rem", fontSize: "0.7rem", color: cssVar.textMuted }}>
                                                    ⚠ Regénérer invalide l&apos;ancien QR — les QR déjà imprimés ne fonctionneront plus.
                                                </p>
                                                <button
                                                    onClick={handleRegenerateQR}
                                                    disabled={formLoading}
                                                    style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.4rem 0.875rem", borderRadius: radius.lg, border: "1px solid rgba(239,68,68,0.35)", background: "rgba(239,68,68,0.06)", color: "#ef4444", fontSize: "0.75rem", fontWeight: 700, cursor: formLoading ? "not-allowed" : "pointer" }}
                                                >
                                                    <RefreshCw size={12} /> Regénérer
                                                </button>
                                            </div>
                                        </>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className="tbl-root rp-page-pad">
                <div className="tbl-inner">

                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1.75rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.3rem" }}>
                                <div style={{ width: 40, height: 40, borderRadius: "0.875rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--amber-glow)" }}>
                                    <QrCode size={20} />
                                </div>
                                <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: cssVar.textPrimary }}>Tables & QR Codes</h1>
                            </div>
                            <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                                {tables.length} table{tables.length > 1 ? "s" : ""} · <span style={{ color: "#22c55e" }}>{libres} libre{libres > 1 ? "s" : ""}</span> · <span style={{ color: "#f59e0b" }}>{occupees} occupée{occupees > 1 ? "s" : ""}</span>
                            </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button onClick={fetchTables} style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.6rem 1rem", borderRadius: radius.lg, border: "1px solid var(--border-subtle)", background: "transparent", color: cssVar.textMuted, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                                <RefreshCw size={13} /> Actualiser
                            </button>
                            {isAdmin && (
                                <button onClick={() => { setSelectedTable(null); setFormError(null); setModal("create"); }} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>
                                    <Plus size={16} /> Nouvelle table
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Contenu */}
                    {loading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, gap: "0.75rem", color: cssVar.textMuted }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                            Chargement des tables…
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: "center", padding: "3rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid rgba(239,68,68,0.2)" }}>
                            <p style={{ color: cssVar.textSecondary, marginBottom: "1rem" }}>{error}</p>
                            <button onClick={fetchTables} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.55rem 1.25rem", borderRadius: radius.lg, border: "1px solid var(--border-amber)", background: "transparent", color: "var(--amber-glow)", cursor: "pointer", fontSize: typography.sm, fontWeight: 600 }}>
                                <RefreshCw size={14} /> Réessayer
                            </button>
                        </div>
                    ) : tables.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--bg-card)", borderRadius: radius.xl, border: "1px solid var(--border-subtle)" }}>
                            <QrCode size={40} style={{ color: cssVar.textMuted, margin: "0 auto 1rem", display: "block" }} />
                            <h3 style={{ margin: "0 0 0.5rem", color: cssVar.textPrimary }}>Aucune table configurée</h3>
                            <p style={{ margin: "0 0 1.25rem", color: cssVar.textMuted, fontSize: typography.sm }}>Créez votre première table pour générer son QR Code.</p>
                            {isAdmin && (
                                <button onClick={() => setModal("create")} style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.65rem 1.25rem", borderRadius: radius.lg, border: "none", background: "var(--gradient-btn)", color: "#0c0a09", fontWeight: 700, fontSize: typography.sm, cursor: "pointer" }}>
                                    <Plus size={15} /> Créer une table
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="tbl-grid">
                            {tables.map(t => {
                                const ext = t as unknown as { statut_courant: string; a_qr_code: boolean; nb_commandes_actives: number; utilisateur_login: string };
                                return (
                                    <div key={t.id} className="tbl-card">
                                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                                            <div>
                                                <p style={{ margin: 0, fontSize: "1.125rem", fontWeight: 800, color: cssVar.textPrimary }}>Table {t.numero_table}</p>
                                                <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>{t.nombre_places} place{t.nombre_places > 1 ? "s" : ""}</span>
                                            </div>
                                            <StatutBadge statut={ext.statut_courant ?? "libre"} />
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>Login table</span>
                                                <span style={{ fontFamily: "monospace", fontSize: "0.7rem", background: "var(--bg-section-alt)", padding: "0.15rem 0.4rem", borderRadius: "0.375rem", color: cssVar.textSecondary }}>{ext.utilisateur_login ?? t.utilisateur_login}</span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>Commandes actives</span>
                                                <span style={{ fontSize: typography.xs, fontWeight: 700, color: ext.nb_commandes_actives > 0 ? "#f59e0b" : cssVar.textMuted }}>
                                                    {ext.nb_commandes_actives ?? 0}
                                                </span>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: typography.xs, color: cssVar.textMuted }}>QR Code</span>
                                                <span style={{ fontSize: typography.xs, fontWeight: 700, color: ext.a_qr_code ? "#22c55e" : "#ef4444" }}>
                                                    {ext.a_qr_code ? "✓ Actif" : "✗ Absent"}
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: "0.4rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.625rem" }}>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => ext.a_qr_code ? handleShowQR(t) : handleCreateQR(t)}
                                                    style={{ flex: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem", padding: "0.5rem", borderRadius: "0.5rem", border: "1px solid var(--border-subtle)", background: "var(--bg-section-alt)", color: "var(--amber-glow)", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}
                                                >
                                                    <QrCode size={13} /> {ext.a_qr_code ? "Voir QR" : "Créer QR"}
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <>
                                                    <button title="Modifier" className="icon-btn" onClick={() => { setSelectedTable(t); setFormError(null); setModal("edit"); }}>
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button title="Supprimer" className="icon-btn" onClick={() => { setSelectedTable(t); setModal("delete"); }} style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
