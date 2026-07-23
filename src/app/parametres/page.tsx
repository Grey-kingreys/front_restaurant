"use client";
// src/app/parametres/page.tsx
// Page paramètres unifiée : Restaurant · Rôles & Permissions · Workflow commandes

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getMonRestaurant, updateMonRestaurant, type Restaurant } from "@/lib/api/company";
import { listRoles, getRole, createRole, updateRole, deleteRole, listPermissions } from "@/lib/api/roles";
import type { RoleConfig, RoleConfigDetail, Permission, DashboardType } from "@/types";
import { cssVar, typography, radius, spacing } from "@/theme/theme";
import MapPicker from "@/components/map/MapPicker";
import { parseCoord } from "@/lib/mapbox";
import {
    Building2, ShieldCheck, GitBranch,
    Check, X, RefreshCw, Plus, Pencil, Trash2,
    ChevronDown, ChevronRight, Truck, ShoppingBag, Repeat, MapPin, AlertTriangle,
    CalendarCheck, Zap, Hand, Banknote,
} from "lucide-react";

// ─── Types & constantes ───────────────────────────────────────────────────────

type Tab = "restaurant" | "roles" | "workflow";

const DASHBOARD_OPTIONS: { value: DashboardType; label: string }[] = [
    { value: "admin",     label: "Vue Admin / Manager" },
    { value: "serveur",   label: "Vue Serveur" },
    { value: "cuisine",   label: "Vue Cuisine" },
    { value: "comptable", label: "Vue Comptable" },
];

const CATEGORIE_ORDER = ["equipe", "commandes", "menu", "tables", "caisse", "restaurant"];

function slugify(s: string) {
    return s.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

// ─── Loader ───────────────────────────────────────────────────────────────────

function Spinner({ size = 28 }: { size?: number }) {
    return (
        <div style={{ width: size, height: size, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite", flexShrink: 0 }} />
    );
}

// ─── Onglet Restaurant ────────────────────────────────────────────────────────

function TabRestaurant() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);
    const [toast, setToast]           = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [nom, setNom]               = useState("");
    const [telephone, setTelephone]   = useState("");
    const [adresse, setAdresse]       = useState("");
    const [latitude, setLatitude]     = useState("");
    const [longitude, setLongitude]   = useState("");
    const [rayon, setRayon]           = useState("200");
    const [duree, setDuree]           = useState("60");
    const [acceptLivraison, setAcceptLivraison] = useState(false);
    const [acceptEmporter, setAcceptEmporter]   = useState(false);
    const [fraisLivraison, setFraisLivraison]   = useState("");
    const [livraisonLienPaiement, setLivraisonLienPaiement] = useState(false);
    const [validationAuto, setValidationAuto]   = useState(true);
    const [delaiAnnulation, setDelaiAnnulation] = useState("2");
    const [saving, setSaving]         = useState(false);
    const [formError, setFormError]   = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await getMonRestaurant();
            if (res.success && res.data) {
                setRestaurant(res.data);
                setNom(res.data.nom ?? "");
                setTelephone(res.data.telephone ?? "");
                setAdresse(res.data.adresse ?? "");
                setLatitude(res.data.latitude ?? "");
                setLongitude(res.data.longitude ?? "");
                setRayon(String(res.data.rayon_connexion ?? 200));
                setDuree(String(res.data.duree_session_table ?? 60));
                setAcceptLivraison(res.data.accept_livraison ?? false);
                setLivraisonLienPaiement(res.data.livraison_lien_autorise_paiement ?? false);
                setAcceptEmporter(res.data.accept_emporter ?? false);
                setFraisLivraison(res.data.frais_livraison ?? "");
                setValidationAuto(res.data.reservation_validation_auto ?? true);
                setDelaiAnnulation(String(res.data.reservation_delai_annulation_heures ?? 2));
            } else setError("Impossible de charger les informations du restaurant.");
        } catch { setError("Erreur de connexion."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true); setFormError(null);
        const payload: Parameters<typeof updateMonRestaurant>[0] = { nom };
        if (telephone.trim()) payload.telephone = telephone.trim();
        if (adresse.trim()) payload.adresse = adresse.trim();
        // Géolocalisation
        const lat = latitude.trim() ? parseFloat(latitude.trim()) : null;
        const lng = longitude.trim() ? parseFloat(longitude.trim()) : null;
        if (lat !== null && lng !== null) { payload.latitude = lat; payload.longitude = lng; }
        else if (!latitude.trim() && !longitude.trim()) { payload.latitude = null; payload.longitude = null; }
        payload.rayon_connexion = parseInt(rayon) || 200;
        payload.duree_session_table = parseInt(duree) || 60;
        // Commande en ligne
        payload.accept_livraison = acceptLivraison;
        payload.livraison_lien_autorise_paiement = livraisonLienPaiement;
        payload.accept_emporter = acceptEmporter;
        payload.frais_livraison = fraisLivraison.trim() ? parseInt(fraisLivraison.trim()) : null;
        // Réservations
        payload.reservation_validation_auto = validationAuto;
        payload.reservation_delai_annulation_heures = delaiAnnulation.trim() ? parseInt(delaiAnnulation.trim()) : 2;
        try {
            const res = await updateMonRestaurant(payload);
            if (res.success && res.data) { setRestaurant(res.data); showToast("Restaurant mis à jour."); }
            else {
                const errs = res.errors;
                setFormError(errs ? Object.values(errs).flat().join(" — ") : res.message || "Erreur.");
            }
        } catch { setFormError("Erreur de connexion."); }
        finally { setSaving(false); }
    };

    return (
        <div style={{ maxWidth: 600 }}>
            {toast && (
                <div style={{ marginBottom: spacing["4"], padding: "0.65rem 1rem", borderRadius: radius.lg, background: toast.type === "success" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, color: toast.type === "success" ? "#22c55e" : "#f87171", display: "flex", alignItems: "center", gap: spacing["2"] }}>
                    {toast.type === "success" ? <Check size={14} /> : <X size={14} />}
                    {toast.msg}
                </div>
            )}

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: spacing["8"] }}><Spinner /></div>
            ) : error ? (
                <div style={{ textAlign: "center", padding: spacing["8"], background: cssVar.bgCard, borderRadius: radius.xl, border: `1px solid ${cssVar.borderSubtle}` }}>
                    <p style={{ color: cssVar.textSecondary, marginBottom: spacing["3"] }}>{error}</p>
                    <button onClick={fetch} style={{ display: "inline-flex", alignItems: "center", gap: spacing["1"], padding: "0.5rem 1rem", borderRadius: radius.md, border: `1px solid ${cssVar.borderAmber}`, background: "transparent", color: cssVar.amberGlow, cursor: "pointer", fontSize: typography.sm }}>
                        <RefreshCw size={13} /> Réessayer
                    </button>
                </div>
            ) : restaurant && (
                <div style={{ background: cssVar.bgCard, borderRadius: radius.xl, border: `1px solid ${cssVar.borderSubtle}`, padding: spacing["5"] }}>
                    {/* Statut */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing["4"], paddingBottom: spacing["4"], borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
                        <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted }}>
                            Créé le {new Date(restaurant.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </p>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "3px 10px", borderRadius: "var(--radius-full)", fontSize: typography.xs, fontWeight: typography.bold, color: restaurant.is_active ? "#22c55e" : "#ef4444", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)" }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: restaurant.is_active ? "#22c55e" : "#ef4444" }} />
                            {restaurant.is_active ? "Actif" : "Suspendu"}
                        </span>
                    </div>

                    {/* Email lecture seule */}
                    <div style={{ marginBottom: spacing["4"] }}>
                        <label style={{ display: "block", fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "4px" }}>Email administrateur</label>
                        <div style={{ padding: "0.55rem 0.75rem", borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`, background: "rgba(255,255,255,0.02)", color: cssVar.textSecondary, fontSize: typography.sm }}>
                            {restaurant.email_admin}
                        </div>
                        <p style={{ margin: "4px 0 0", fontSize: "0.7rem", color: cssVar.textMuted }}>Non modifiable — contactez le Super Admin.</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing["3"] }}>
                        {formError && (
                            <div style={{ padding: "0.55rem 0.75rem", borderRadius: radius.md, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: typography.sm }}>{formError}</div>
                        )}
                        {[
                            { label: "Nom du restaurant *", value: nom, set: setNom, type: "text", required: true },
                            { label: "Téléphone", value: telephone, set: setTelephone, type: "tel", required: false, placeholder: "+224XXXXXXXXX" },
                        ].map(f => (
                            <div key={f.label}>
                                <label style={{ display: "block", fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "4px" }}>{f.label}</label>
                                <input type={f.type} value={f.value} onChange={e => f.set(e.target.value)} required={f.required} placeholder={f.placeholder}
                                    style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt, color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                            </div>
                        ))}
                        <div>
                            <label style={{ display: "block", fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "4px" }}>Adresse</label>
                            <textarea value={adresse} onChange={e => setAdresse(e.target.value)} rows={3} placeholder="Adresse complète…"
                                style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt, color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box", resize: "vertical", fontFamily: "inherit" }} />
                        </div>

                        {/* ── Section commande en ligne ── */}
                        <div style={{ paddingTop: spacing["3"], borderTop: `1px solid ${cssVar.borderSubtle}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: spacing["2"], marginBottom: spacing["3"] }}>
                                <ShoppingBag size={16} style={{ color: cssVar.amberGlow }} />
                                <div>
                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 700, color: cssVar.textPrimary }}>Commande en ligne</p>
                                    <p style={{ margin: 0, fontSize: "0.72rem", color: cssVar.textMuted }}>Rendez votre restaurant visible aux clients pour la livraison ou le retrait.</p>
                                </div>
                            </div>

                            {!acceptLivraison && !acceptEmporter && (
                                <div style={{ display: "flex", alignItems: "flex-start", gap: spacing["2"], padding: "0.55rem 0.75rem", borderRadius: radius.md, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontSize: "0.75rem", marginBottom: spacing["3"] }}>
                                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span>Aucun mode activé — votre restaurant n'apparaît pas dans la liste des clients. Activez la livraison et/ou le retrait pour recevoir des commandes en ligne.</span>
                                </div>
                            )}

                            {/* Toggle Livraison */}
                            <label style={{ display: "flex", alignItems: "center", gap: spacing["2"], padding: "0.6rem 0.75rem", borderRadius: radius.md, border: `1px solid ${acceptLivraison ? "rgba(139,92,246,0.4)" : cssVar.borderSubtle}`, background: acceptLivraison ? "rgba(139,92,246,0.06)" : cssVar.bgSectionAlt, cursor: "pointer", marginBottom: spacing["2"] }}>
                                <Truck size={16} style={{ color: acceptLivraison ? "#8b5cf6" : cssVar.textMuted, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>Livraison à domicile</p>
                                    <p style={{ margin: 0, fontSize: "0.7rem", color: cssVar.textMuted }}>Le client se fait livrer à son adresse.</p>
                                </div>
                                <input type="checkbox" checked={acceptLivraison} onChange={e => setAcceptLivraison(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
                            </label>

                            {/* Frais de livraison — visible si livraison activée */}
                            {acceptLivraison && (
                                <div style={{ marginBottom: spacing["2"], paddingLeft: "1.85rem" }}>
                                    <label style={{ display: "block", fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "4px" }}>Frais de livraison (GNF)</label>
                                    <input type="number" min={0} step={500} value={fraisLivraison} onChange={e => setFraisLivraison(e.target.value)} placeholder="Laisser vide = gratuit"
                                        style={{ width: "100%", maxWidth: 240, padding: "0.5rem 0.75rem", borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt, color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                                </div>
                            )}

                            {/* Encaissement par lien de livraison — visible si livraison activée */}
                            {acceptLivraison && (
                                <label style={{ display: "flex", alignItems: "center", gap: spacing["2"], padding: "0.6rem 0.75rem", marginLeft: "1.85rem", borderRadius: radius.md, border: `1px solid ${livraisonLienPaiement ? "rgba(34,197,94,0.4)" : cssVar.borderSubtle}`, background: livraisonLienPaiement ? "rgba(34,197,94,0.06)" : cssVar.bgSectionAlt, cursor: "pointer", marginBottom: spacing["2"] }}>
                                    <Banknote size={16} style={{ color: livraisonLienPaiement ? "#22c55e" : cssVar.textMuted, flexShrink: 0 }} />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>Encaissement par le livreur externe</p>
                                        <p style={{ margin: 0, fontSize: "0.7rem", color: cssVar.textMuted }}>Autorise un livreur via lien / QR à valider le paiement à la livraison. Sinon, seul le staff encaisse.</p>
                                    </div>
                                    <input type="checkbox" checked={livraisonLienPaiement} onChange={e => setLivraisonLienPaiement(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
                                </label>
                            )}

                            {/* Toggle Emporter */}
                            <label style={{ display: "flex", alignItems: "center", gap: spacing["2"], padding: "0.6rem 0.75rem", borderRadius: radius.md, border: `1px solid ${acceptEmporter ? "rgba(245,158,11,0.4)" : cssVar.borderSubtle}`, background: acceptEmporter ? "rgba(245,158,11,0.06)" : cssVar.bgSectionAlt, cursor: "pointer", marginBottom: spacing["2"] }}>
                                <ShoppingBag size={16} style={{ color: acceptEmporter ? cssVar.amberGlow : cssVar.textMuted, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>À emporter</p>
                                    <p style={{ margin: 0, fontSize: "0.7rem", color: cssVar.textMuted }}>Le client vient récupérer sa commande sur place.</p>
                                </div>
                                <input type="checkbox" checked={acceptEmporter} onChange={e => setAcceptEmporter(e.target.checked)} style={{ width: 18, height: 18, cursor: "pointer", flexShrink: 0 }} />
                            </label>

                            {/* Toggle Aller Retour — service de livraison partenaire externe (projet d'un collègue) ; API à brancher plus tard */}
                            <div aria-disabled="true" title="Bientôt disponible"
                                style={{ display: "flex", alignItems: "center", gap: spacing["2"], padding: "0.6rem 0.75rem", borderRadius: radius.md, border: `1px dashed ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt, opacity: 0.6, cursor: "not-allowed" }}>
                                <Repeat size={16} style={{ color: cssVar.textMuted, flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 600, color: cssVar.textPrimary }}>Aller Retour</p>
                                    <p style={{ margin: 0, fontSize: "0.7rem", color: cssVar.textMuted }}>Livraison assurée par le service partenaire Aller Retour.</p>
                                </div>
                                <span style={{ flexShrink: 0, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: cssVar.amberGlow, background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: "var(--radius-full)", padding: "2px 8px" }}>Bientôt</span>
                            </div>
                        </div>

                        {/* ── Section réservations ── */}
                        <div style={{ paddingTop: spacing["3"], borderTop: `1px solid ${cssVar.borderSubtle}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: spacing["2"], marginBottom: spacing["3"] }}>
                                <CalendarCheck size={16} style={{ color: cssVar.amberGlow }} />
                                <div>
                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 700, color: cssVar.textPrimary }}>Réservations de table</p>
                                    <p style={{ margin: 0, fontSize: "0.72rem", color: cssVar.textMuted }}>La table est attribuée automatiquement selon le nombre de personnes et la disponibilité.</p>
                                </div>
                            </div>

                            {/* Mode de validation */}
                            <p style={{ margin: `0 0 ${spacing["2"]}`, fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted }}>Mode de validation</p>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing["2"], marginBottom: spacing["3"] }}>
                                <button type="button" onClick={() => setValidationAuto(true)}
                                    style={{ textAlign: "left", padding: "0.65rem 0.8rem", borderRadius: radius.md, cursor: "pointer", border: `1px solid ${validationAuto ? "rgba(34,197,94,0.4)" : cssVar.borderSubtle}`, background: validationAuto ? "rgba(34,197,94,0.06)" : cssVar.bgSectionAlt }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: validationAuto ? "#22c55e" : cssVar.textPrimary, fontWeight: 700, fontSize: typography.sm }}><Zap size={14} />Automatique</div>
                                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.7rem", color: cssVar.textMuted }}>La réservation est confirmée immédiatement.</p>
                                </button>
                                <button type="button" onClick={() => setValidationAuto(false)}
                                    style={{ textAlign: "left", padding: "0.65rem 0.8rem", borderRadius: radius.md, cursor: "pointer", border: `1px solid ${!validationAuto ? "rgba(245,158,11,0.4)" : cssVar.borderSubtle}`, background: !validationAuto ? "rgba(245,158,11,0.06)" : cssVar.bgSectionAlt }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: !validationAuto ? cssVar.amberGlow : cssVar.textPrimary, fontWeight: 700, fontSize: typography.sm }}><Hand size={14} />Manuelle</div>
                                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.7rem", color: cssVar.textMuted }}>Le staff confirme chaque demande.</p>
                                </button>
                            </div>

                            {/* Délai d'annulation */}
                            <div>
                                <label style={{ display: "block", fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "4px" }}>Délai d'annulation (heures avant)</label>
                                <input type="number" min={0} max={72} value={delaiAnnulation} onChange={e => setDelaiAnnulation(e.target.value)}
                                    style={{ width: "100%", maxWidth: 240, padding: "0.5rem 0.75rem", borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt, color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                                <p style={{ margin: "3px 0 0", fontSize: "0.7rem", color: cssVar.textMuted }}>Le client peut annuler jusqu'à ce délai avant l'heure réservée (0–72 h).</p>
                            </div>
                        </div>

                        {/* ── Section géolocalisation QR ── */}
                        <div style={{ paddingTop: spacing["3"], borderTop: `1px solid ${cssVar.borderSubtle}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: spacing["2"], marginBottom: spacing["3"] }}>
                                <MapPin size={16} style={{ color: cssVar.amberGlow }} />
                                <div>
                                    <p style={{ margin: 0, fontSize: typography.sm, fontWeight: 700, color: cssVar.textPrimary }}>Restriction QR Code par géolocalisation</p>
                                    <p style={{ margin: 0, fontSize: "0.72rem", color: cssVar.textMuted }}>Empêche la connexion depuis l'extérieur du restaurant.</p>
                                </div>
                            </div>

                            {!latitude && !longitude && (
                                <div style={{ display: "flex", alignItems: "flex-start", gap: spacing["2"], padding: "0.55rem 0.75rem", borderRadius: radius.md, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", fontSize: "0.75rem", marginBottom: spacing["3"] }}>
                                    <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                                    <span>Aucun emplacement défini — la restriction QR est désactivée. Placez votre restaurant sur la carte pour l'activer.</span>
                                </div>
                            )}

                            {/* Sélection de l'emplacement sur la carte */}
                            <MapPicker
                                lat={parseCoord(latitude)}
                                lng={parseCoord(longitude)}
                                radiusMetres={parseInt(rayon) || undefined}
                                onChange={(la, ln) => { setLatitude(String(la)); setLongitude(String(ln)); }}
                                height={300}
                            />

                            <div style={{ display: "flex", alignItems: "center", gap: spacing["2"], margin: `${spacing["2"]} 0 ${spacing["3"]}`, fontSize: "0.72rem", color: cssVar.textMuted }}>
                                <MapPin size={13} style={{ color: latitude && longitude ? "#22c55e" : cssVar.textMuted }} />
                                {latitude && longitude
                                    ? <span>Emplacement défini : <b style={{ color: cssVar.textSecondary }}>{parseCoord(latitude)?.toFixed(5)}, {parseCoord(longitude)?.toFixed(5)}</b></span>
                                    : <span>Aucun emplacement sélectionné.</span>}
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing["3"] }}>
                                <div>
                                    <label style={{ display: "block", fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "4px" }}>Rayon de connexion (m)</label>
                                    <input type="number" min={50} max={2000} value={rayon} onChange={e => setRayon(e.target.value)}
                                        style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt, color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                                    <p style={{ margin: "3px 0 0", fontSize: "0.7rem", color: cssVar.textMuted }}>Distance max depuis le restaurant (50–2000 m)</p>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.06em", color: cssVar.textMuted, marginBottom: "4px" }}>Durée de session (min)</label>
                                    <input type="number" min={15} max={480} value={duree} onChange={e => setDuree(e.target.value)}
                                        style={{ width: "100%", padding: "0.55rem 0.75rem", borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt, color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }} />
                                    <p style={{ margin: "3px 0 0", fontSize: "0.7rem", color: cssVar.textMuted }}>Expiration automatique après ce délai (15–480 min)</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: spacing["1"] }}>
                            <button type="submit" disabled={saving}
                                style={{ display: "inline-flex", alignItems: "center", gap: spacing["2"], padding: "0.6rem 1.5rem", borderRadius: radius.md, border: "none", background: saving ? cssVar.bgSectionAlt : "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0c0a09", fontWeight: typography.bold, fontSize: typography.sm, cursor: saving ? "not-allowed" : "pointer" }}>
                                {saving && <Spinner size={14} />}
                                Enregistrer
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

// ─── Onglet Rôles & Permissions ───────────────────────────────────────────────

function RoleModal({ initial, permissions, onClose, onSaved }: { initial?: RoleConfigDetail | null; permissions: Permission[]; onClose: () => void; onSaved: (msg: string) => void }) {
    const [nom, setNom]         = useState(initial?.nom ?? "");
    const [slug, setSlug]       = useState(initial?.slug ?? "");
    const [dashboard, setDash]  = useState<DashboardType>(initial?.dashboard_type ?? "admin");
    const [selected, setSelected] = useState<Set<number>>(new Set(initial?.permissions.map(p => p.id) ?? []));
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState<string | null>(null);
    const [expandedCat, setExpandedCat] = useState<Record<string, boolean>>({});
    const isEdit = !!initial;

    const togglePerm = (id: number) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const toggleCat  = (c: string)  => setExpandedCat(p => ({ ...p, [c]: !p[c] }));

    const grouped = permissions.reduce<Record<string, Permission[]>>((acc, p) => { (acc[p.categorie] ??= []).push(p); return acc; }, {});
    const cats = [...CATEGORIE_ORDER.filter(c => grouped[c]), ...Object.keys(grouped).filter(c => !CATEGORIE_ORDER.includes(c))];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true); setError(null);
        try {
            const res = isEdit
                ? await updateRole(initial!.id, { nom, dashboard_type: dashboard, permission_ids: [...selected] })
                : await createRole({ nom, slug: slug || slugify(nom), dashboard_type: dashboard, permission_ids: [...selected] });
            if (res.success) { onSaved(isEdit ? "Rôle mis à jour." : "Rôle créé."); onClose(); }
            else {
                const errs = res.errors;
                setError(errs ? Object.values(errs).flat().join(" — ") : res.message || "Erreur.");
            }
        } catch { setError("Erreur de connexion."); }
        finally { setLoading(false); }
    };

    return (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: spacing["4"] }} onClick={onClose}>
            <div style={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.xl, width: "100%", maxWidth: 620, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", animation: "modalIn 0.2s ease" }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: `${spacing["4"]} ${spacing["5"]}`, borderBottom: `1px solid ${cssVar.borderSubtle}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h3 style={{ margin: 0, fontSize: typography.base, fontWeight: typography.bold, color: cssVar.textPrimary }}>
                        {isEdit ? `Modifier : ${initial!.nom}` : "Nouveau rôle"}
                    </h3>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: cssVar.textMuted }}><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
                    <div style={{ flex: 1, overflowY: "auto", padding: `${spacing["4"]} ${spacing["5"]}`, display: "flex", flexDirection: "column", gap: spacing["3"] }}>
                        <div>
                            <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.medium, color: cssVar.textSecondary, marginBottom: "4px" }}>Nom *</label>
                            <input value={nom} onChange={e => { setNom(e.target.value); if (!isEdit) setSlug(slugify(e.target.value)); }} required
                                style={{ width: "100%", padding: "0.5rem 0.75rem", background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.md, color: cssVar.textPrimary, fontSize: typography.base, boxSizing: "border-box" }} />
                        </div>
                        {!isEdit && (
                            <div>
                                <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.medium, color: cssVar.textSecondary, marginBottom: "4px" }}>Slug</label>
                                <input value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="auto-généré"
                                    style={{ width: "100%", padding: "0.5rem 0.75rem", background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.md, color: cssVar.textMuted, fontSize: typography.sm, fontFamily: "monospace", boxSizing: "border-box" }} />
                            </div>
                        )}
                        <div>
                            <label style={{ display: "block", fontSize: typography.sm, fontWeight: typography.medium, color: cssVar.textSecondary, marginBottom: "4px" }}>Tableau de bord *</label>
                            <select value={dashboard} onChange={e => setDash(e.target.value as DashboardType)}
                                style={{ width: "100%", padding: "0.5rem 0.75rem", background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.md, color: cssVar.textPrimary, fontSize: typography.base }}>
                                {DASHBOARD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <p style={{ margin: `0 0 ${spacing["2"]}`, fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textSecondary }}>
                                Permissions ({selected.size} sélectionnées)
                            </p>
                            {cats.map(cat => {
                                const perms = grouped[cat] ?? [];
                                const expanded = expandedCat[cat] !== false;
                                const allSel = perms.every(p => selected.has(p.id));
                                const anySel = perms.some(p => selected.has(p.id));
                                return (
                                    <div key={cat} style={{ marginBottom: spacing["1"], border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.md, overflow: "hidden" }}>
                                        <button type="button" onClick={() => toggleCat(cat)} style={{ width: "100%", display: "flex", alignItems: "center", gap: spacing["2"], padding: "0.45rem 0.75rem", background: cssVar.bgSectionAlt, border: "none", cursor: "pointer", color: cssVar.textPrimary }}>
                                            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                                            <span style={{ flex: 1, textAlign: "left", fontWeight: typography.semibold, fontSize: typography.sm, textTransform: "capitalize" }}>{cat}</span>
                                            <span style={{ fontSize: typography.xs, color: anySel ? cssVar.amberGlow : cssVar.textMuted }}>{perms.filter(p => selected.has(p.id)).length}/{perms.length}</span>
                                            <input type="checkbox" checked={allSel} ref={el => { if (el) el.indeterminate = anySel && !allSel; }}
                                                onChange={() => setSelected(prev => { const n = new Set(prev); allSel ? perms.forEach(p => n.delete(p.id)) : perms.forEach(p => n.add(p.id)); return n; })}
                                                onClick={e => e.stopPropagation()} style={{ cursor: "pointer" }} />
                                        </button>
                                        {expanded && (
                                            <div style={{ padding: "0.35rem 0.75rem", display: "flex", flexDirection: "column", gap: "1px" }}>
                                                {perms.map(p => (
                                                    <label key={p.id} style={{ display: "flex", alignItems: "center", gap: spacing["2"], padding: "0.25rem 0", cursor: "pointer" }}>
                                                        <input type="checkbox" checked={selected.has(p.id)} onChange={() => togglePerm(p.id)} style={{ cursor: "pointer" }} />
                                                        <span style={{ fontSize: typography.sm, color: selected.has(p.id) ? cssVar.textPrimary : cssVar.textSecondary }}>{p.label}</span>
                                                        <span style={{ fontSize: typography.xs, color: cssVar.textMuted, fontFamily: "monospace", marginLeft: "auto" }}>{p.code}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {error && <div style={{ margin: `0 ${spacing["5"]}`, padding: "0.5rem 0.75rem", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: radius.md, color: "#f87171", fontSize: typography.sm }}>{error}</div>}
                    <div style={{ padding: `${spacing["3"]} ${spacing["5"]}`, borderTop: `1px solid ${cssVar.borderSubtle}`, display: "flex", gap: spacing["2"], justifyContent: "flex-end" }}>
                        <button type="button" onClick={onClose} style={{ padding: "0.5rem 1.25rem", background: "transparent", border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.md, color: cssVar.textSecondary, cursor: "pointer" }}>Annuler</button>
                        <button type="submit" disabled={loading} style={{ padding: "0.5rem 1.5rem", background: loading ? cssVar.bgSectionAlt : "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: radius.md, color: "#0c0a09", fontWeight: typography.bold, cursor: loading ? "not-allowed" : "pointer" }}>
                            {loading ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function RoleCard({ role, onEdit, onDelete }: { role: RoleConfig; onEdit: (r: RoleConfig) => void; onDelete: (r: RoleConfig) => void }) {
    return (
        <div style={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.xl, padding: spacing["4"], display: "flex", flexDirection: "column", gap: spacing["2"], transition: "box-shadow 0.15s, border-color 0.15s" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "0 2px 12px rgba(245,158,11,0.08)"; el.style.borderColor = cssVar.borderAmberHover; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "none"; el.style.borderColor = cssVar.borderSubtle; }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing["2"] }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: spacing["2"], flexWrap: "wrap" }}>
                        <span style={{ fontWeight: typography.bold, fontSize: typography.base, color: cssVar.textPrimary }}>{role.nom}</span>
                        {role.is_system && <span style={{ fontSize: typography.xs, padding: "2px 8px", background: cssVar.bgSectionAlt, color: cssVar.amberGlow, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: "var(--radius-full)" }}>système</span>}
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: typography.xs, color: cssVar.textMuted, fontFamily: "monospace" }}>{role.slug}</p>
                </div>
                <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    <button onClick={() => onEdit(role)} title="Modifier" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`, background: "transparent", cursor: "pointer", color: cssVar.textMuted, transition: "all 0.15s" }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = cssVar.borderAmberHover; el.style.color = cssVar.amberGlow; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = cssVar.borderSubtle; el.style.color = cssVar.textMuted; }}>
                        <Pencil size={13} />
                    </button>
                    <button onClick={() => onDelete(role)} title="Supprimer" style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: radius.md, border: `1px solid ${cssVar.borderSubtle}`, background: "transparent", cursor: "pointer", color: cssVar.textMuted, transition: "all 0.15s" }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "rgba(248,113,113,0.4)"; el.style.color = "#f87171"; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = cssVar.borderSubtle; el.style.color = cssVar.textMuted; }}>
                        <Trash2 size={13} />
                    </button>
                </div>
            </div>
            <div style={{ display: "flex", gap: spacing["2"], flexWrap: "wrap" }}>
                {[`${role.permissions_count} permissions`, `${role.users_count} utilisateur${role.users_count !== 1 ? "s" : ""}`, role.dashboard_label].map(tag => (
                    <span key={tag} style={{ fontSize: typography.xs, padding: "2px 10px", background: cssVar.bgSectionAlt, color: cssVar.textSecondary, borderRadius: "var(--radius-full)", border: `1px solid ${cssVar.borderSubtle}` }}>{tag}</span>
                ))}
            </div>
        </div>
    );
}

function TabRoles({ onToast }: { onToast: (msg: string, type?: "success" | "error") => void }) {
    const [roles, setRoles]       = useState<RoleConfig[]>([]);
    const [perms, setPerms]       = useState<Permission[]>([]);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [editRole, setEditRole]     = useState<RoleConfigDetail | null>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const [rolesRes, permsRes] = await Promise.all([listRoles(), listPermissions()]);
            if (rolesRes.success && rolesRes.data) setRoles(rolesRes.data.roles);
            else setError("Impossible de charger les rôles.");
            if (permsRes.success && permsRes.data) setPerms(permsRes.data);
        } catch { setError("Erreur de connexion."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleEdit = async (role: RoleConfig) => {
        const res = await getRole(role.id);
        if (res.success && res.data) setEditRole(res.data);
    };

    const handleDelete = async (role: RoleConfig) => {
        const msg = role.is_system
            ? `« ${role.nom} » est un rôle système. Le supprimer retirera toutes ses permissions aux utilisateurs qui l'ont. Confirmer ?`
            : `Supprimer le rôle « ${role.nom} » ?`;
        if (!window.confirm(msg)) return;
        const res = await deleteRole(role.id);
        if (res.success) { onToast(`Rôle « ${role.nom} » supprimé.`); fetchAll(); }
        else onToast(res.message || "Suppression impossible.", "error");
    };

    const systemRoles = roles.filter(r => r.is_system);
    const customRoles = roles.filter(r => !r.is_system);

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: spacing["4"] }}>
                <p style={{ margin: 0, fontSize: typography.sm, color: cssVar.textMuted }}>
                    {roles.length} rôle{roles.length !== 1 ? "s" : ""} — {customRoles.length} personnalisé{customRoles.length !== 1 ? "s" : ""}
                </p>
                <button onClick={() => setShowCreate(true)} style={{ display: "inline-flex", alignItems: "center", gap: spacing["1"], padding: "0.5rem 1rem", background: "linear-gradient(135deg,#f59e0b,#d97706)", border: "none", borderRadius: radius.md, color: "#0c0a09", fontWeight: typography.bold, cursor: "pointer", fontSize: typography.sm }}>
                    <Plus size={14} /> Nouveau rôle
                </button>
            </div>

            {error && <div style={{ padding: "0.65rem 1rem", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: radius.md, color: "#f87171", marginBottom: spacing["4"] }}>{error}</div>}

            {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: spacing["8"] }}><Spinner /></div>
            ) : (
                <>
                    <p style={{ margin: `0 0 ${spacing["2"]}`, fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.1em", color: cssVar.textMuted }}>Rôles système</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: spacing["3"], marginBottom: spacing["5"] }}>
                        {systemRoles.map(r => <RoleCard key={r.id} role={r} onEdit={handleEdit} onDelete={handleDelete} />)}
                    </div>

                    <p style={{ margin: `0 0 ${spacing["2"]}`, fontSize: typography.xs, fontWeight: typography.bold, textTransform: "uppercase", letterSpacing: "0.1em", color: cssVar.textMuted }}>Rôles personnalisés</p>
                    {customRoles.length === 0 ? (
                        <div style={{ padding: spacing["6"], textAlign: "center", border: `2px dashed ${cssVar.borderSubtle}`, borderRadius: radius.xl, color: cssVar.textMuted }}>
                            <ShieldCheck size={28} style={{ opacity: 0.25, marginBottom: spacing["2"] }} />
                            <p style={{ margin: 0, fontSize: typography.sm }}>Aucun rôle personnalisé — créez-en un ci-dessus.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: spacing["3"] }}>
                            {customRoles.map(r => <RoleCard key={r.id} role={r} onEdit={handleEdit} onDelete={handleDelete} />)}
                        </div>
                    )}
                </>
            )}

            {(showCreate || editRole) && (
                <RoleModal initial={editRole} permissions={perms}
                    onClose={() => { setShowCreate(false); setEditRole(null); }}
                    onSaved={msg => { fetchAll(); onToast(msg); }} />
            )}
        </>
    );
}

// ─── Onglet Workflow commandes ────────────────────────────────────────────────

function TabWorkflow() {
    return (
        <div style={{ maxWidth: 560, padding: `${spacing["8"]} 0`, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: radius.xl, background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`, display: "flex", alignItems: "center", justifyContent: "center", margin: `0 auto ${spacing["4"]}` }}>
                <GitBranch size={28} color={cssVar.amberGlow} style={{ opacity: 0.6 }} />
            </div>
            <h3 style={{ margin: `0 0 ${spacing["2"]}`, fontSize: typography.lg, fontWeight: typography.bold, color: cssVar.textPrimary }}>Workflow commandes</h3>
            <p style={{ margin: `0 0 ${spacing["1"]}`, fontSize: typography.sm, color: cssVar.textSecondary }}>
                Personnalisation du workflow de commande via BPMN & Camunda.
            </p>
            <p style={{ margin: 0, fontSize: typography.xs, color: cssVar.textMuted }}>Fonctionnalité à venir.</p>
        </div>
    );
}

// ─── Page principale ──────────────────────────────────────────────────────────

const TAB_CONFIG: { id: Tab; label: string; icon: React.ReactNode; perm: string }[] = [
    { id: "restaurant", label: "Mon restaurant", icon: <Building2 size={15} />,   perm: "manage_restaurant" },
    { id: "roles",      label: "Rôles & Permissions", icon: <ShieldCheck size={15} />, perm: "manage_roles" },
    { id: "workflow",   label: "Workflow commandes",  icon: <GitBranch size={15} />,   perm: "manage_roles" },
];

export default function ParametresPage() {
    const { user, isAuthenticated, isLoading, hasPermission } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        if (!isLoading && !isAuthenticated) router.replace("/auth/login");
        if (!isLoading && user && !hasPermission("manage_restaurant") && !hasPermission("manage_roles")) {
            router.replace("/dashboard");
        }
    }, [isLoading, isAuthenticated, user, router, hasPermission]);

    const availableTabs = TAB_CONFIG.filter(t => hasPermission(t.perm));
    // Onglets dédupliqués (workflow et roles ont le même perm)
    const tabs = availableTabs.filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);

    const defaultTab = tabs[0]?.id ?? "restaurant";
    const paramTab = searchParams.get("tab") as Tab | null;
    const activeTab: Tab = (paramTab && tabs.find(t => t.id === paramTab)) ? paramTab : defaultTab;

    const setTab = (id: Tab) => {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", id);
        router.replace(url.pathname + url.search);
    };

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    if (isLoading || !user) {
        return (
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-dark)" }}>
                <Spinner size={34} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
        );
    }

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes modalIn { from { opacity:0; transform:translateY(10px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
            `}</style>

            {toast && (
                <div style={{ position: "fixed", top: "1.5rem", right: "1.5rem", zIndex: 200, padding: "0.65rem 1.1rem", background: toast.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(248,113,113,0.12)", border: `1px solid ${toast.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(248,113,113,0.3)"}`, borderRadius: radius.lg, color: toast.type === "success" ? "#22c55e" : "#f87171", fontWeight: typography.medium, display: "flex", alignItems: "center", gap: spacing["2"] }}>
                    {toast.type === "success" ? <Check size={14} /> : <X size={14} />}
                    {toast.msg}
                </div>
            )}

            <div style={{ minHeight: "100vh", background: "var(--bg-dark)" }} className="rp-page-pad">
                <div style={{ maxWidth: 960, margin: "0 auto" }}>

                    {/* En-tête */}
                    <div style={{ marginBottom: spacing["5"] }}>
                        <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: typography.bold, color: cssVar.textPrimary }}>Paramètres</h1>
                        <p style={{ margin: "4px 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                            {user.restaurant_nom ?? ""}
                        </p>
                    </div>

                    {/* Onglets */}
                    <div style={{ display: "flex", gap: "4px", borderBottom: `1px solid ${cssVar.borderSubtle}`, marginBottom: spacing["5"] }}>
                        {tabs.map(t => {
                            const active = activeTab === t.id;
                            return (
                                <button key={t.id} onClick={() => setTab(t.id)} style={{
                                    display: "inline-flex", alignItems: "center", gap: spacing["1"],
                                    padding: "0.55rem 1rem", border: "none", background: "transparent",
                                    cursor: "pointer", fontSize: typography.sm, fontWeight: active ? typography.semibold : typography.medium,
                                    color: active ? cssVar.amberGlow : cssVar.textSecondary,
                                    borderBottom: `2px solid ${active ? cssVar.amberGlow : "transparent"}`,
                                    marginBottom: "-1px", transition: "color 0.15s",
                                }}>
                                    <span style={{ opacity: active ? 1 : 0.6 }}>{t.icon}</span>
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Contenu */}
                    {activeTab === "restaurant" && <TabRestaurant />}
                    {activeTab === "roles"      && <TabRoles onToast={showToast} />}
                    {activeTab === "workflow"   && <TabWorkflow />}
                </div>
            </div>
        </>
    );
}
