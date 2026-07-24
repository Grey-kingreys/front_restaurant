"use client";
// src/components/client/AdresseBook.tsx
// Carnet d'adresses de livraison du client : liste + ajout/édition (avec carte GPS) +
// suppression + choix de l'adresse par défaut. Embarqué dans /profil pour les Rclient.

import { useEffect, useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, Check, X } from "lucide-react";
import dynamic from "next/dynamic";
import {
    listAdresses, createAdresse, updateAdresse, deleteAdresse, setDefaultAdresse,
} from "@/lib/api/adresses";
import type { AdresseClient, AdresseClientPayload } from "@/types";
import { cssVar, typography, radius, spacing, palette } from "@/theme/theme";

// La carte tire mapbox-gl (lourd) → chargement côté client uniquement.
const MapPicker = dynamic(() => import("@/components/map/MapPicker"), { ssr: false });

const LIBELLE_SUGGESTIONS = ["Maison", "Bureau", "Autre"];

interface FormState {
    id: number | null;      // null = création
    libelle: string;
    description: string;
    telephone: string;
    lat: number | null;
    lng: number | null;
}

const emptyForm: FormState = { id: null, libelle: "", description: "", telephone: "", lat: null, lng: null };

const btnPrimaryStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: spacing["2"],
    padding: `${spacing["2"]} ${spacing["4"]}`, borderRadius: radius.lg, border: "none",
    background: cssVar.gradientBtn, color: palette.btnText, fontWeight: typography.bold,
    fontSize: typography.sm, cursor: "pointer",
};
const btnGhostStyle: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: spacing["2"],
    padding: `${spacing["2"]} ${spacing["3"]}`, borderRadius: radius.lg,
    border: `1px solid ${cssVar.borderSubtle}`, background: "transparent",
    color: cssVar.textSecondary, fontWeight: typography.semibold, fontSize: typography.xs, cursor: "pointer",
};
const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.55rem 0.75rem", borderRadius: radius.md,
    border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt,
    color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box", outline: "none",
};

export default function AdresseBook() {
    const [adresses, setAdresses] = useState<AdresseClient[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState | null>(null);   // null = pas de formulaire ouvert
    const [saving, setSaving] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);  // ligne en cours d'action (defaut/suppr)
    const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

    const load = async () => {
        try {
            const res = await listAdresses();
            if (res.success && res.data) setAdresses(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => { setMsg(null); setForm({ ...emptyForm }); };
    const openEdit = (a: AdresseClient) => {
        setMsg(null);
        setForm({
            id: a.id,
            libelle: a.libelle,
            description: a.description,
            telephone: a.telephone ?? "",
            lat: a.latitude != null ? Number(a.latitude) : null,
            lng: a.longitude != null ? Number(a.longitude) : null,
        });
    };
    const closeForm = () => setForm(null);

    const handleSubmit = async () => {
        if (!form) return;
        if (!form.libelle.trim()) { setMsg({ type: "err", text: "Donnez un libellé (ex. Maison)." }); return; }
        if (!form.description.trim()) { setMsg({ type: "err", text: "Décrivez l'adresse / le point de repère." }); return; }

        setSaving(true); setMsg(null);
        const payload: AdresseClientPayload = {
            libelle: form.libelle.trim(),
            description: form.description.trim(),
            telephone: form.telephone.trim() || null,
            latitude: form.lat,
            longitude: form.lng,
        };
        try {
            const res = form.id
                ? await updateAdresse(form.id, payload)
                : await createAdresse(payload);
            if (res.success) {
                await load();
                setForm(null);
                setMsg({ type: "ok", text: form.id ? "Adresse mise à jour." : "Adresse ajoutée." });
            } else {
                const e = res.errors ? Object.values(res.errors).flat()[0] : null;
                setMsg({ type: "err", text: e || res.message || "Enregistrement impossible." });
            }
        } catch {
            setMsg({ type: "err", text: "Serveur indisponible." });
        }
        setSaving(false);
    };

    const handleDelete = async (a: AdresseClient) => {
        if (!confirm(`Supprimer l'adresse « ${a.libelle} » ?`)) return;
        setBusyId(a.id); setMsg(null);
        try {
            const res = await deleteAdresse(a.id);
            if (res.success) { await load(); setMsg({ type: "ok", text: "Adresse supprimée." }); }
            else setMsg({ type: "err", text: res.message || "Suppression impossible." });
        } catch {
            setMsg({ type: "err", text: "Serveur indisponible." });
        }
        setBusyId(null);
    };

    const handleSetDefault = async (a: AdresseClient) => {
        setBusyId(a.id); setMsg(null);
        try {
            const res = await setDefaultAdresse(a.id);
            if (res.success) await load();
            else setMsg({ type: "err", text: res.message || "Action impossible." });
        } catch {
            setMsg({ type: "err", text: "Serveur indisponible." });
        }
        setBusyId(null);
    };

    return (
        <div style={{ background: cssVar.bgCard, border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius["2xl"], boxShadow: cssVar.shadowCard, overflow: "hidden" }}>

            {/* En-tête */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: spacing["2"], padding: `${spacing["4"]} ${spacing["4"]}`, borderBottom: `1px solid ${cssVar.borderSubtle}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: spacing["2"] }}>
                    <span style={{ color: cssVar.iconPrimary, display: "inline-flex" }}><MapPin size={16} /></span>
                    <h2 style={{ fontSize: typography.base, fontWeight: typography.bold, color: cssVar.textPrimary, margin: 0 }}>
                        Mes adresses de livraison
                    </h2>
                </div>
                {!form && (
                    <button onClick={openCreate} style={btnPrimaryStyle}>
                        <Plus size={14} /> Ajouter
                    </button>
                )}
            </div>

            <div style={{ padding: `${spacing["3"]} ${spacing["4"]} ${spacing["4"]}` }}>

                {msg && (
                    <p style={{ margin: `0 0 ${spacing["3"]}`, fontSize: typography.xs, color: msg.type === "ok" ? palette.green[500] : palette.red[500] }}>
                        {msg.text}
                    </p>
                )}

                {/* Formulaire ajout / édition */}
                {form && (
                    <div style={{ border: `1px solid ${cssVar.borderSubtle}`, borderRadius: radius.xl, padding: spacing["4"], marginBottom: spacing["4"], background: cssVar.bgSectionAlt }}>
                        <p style={{ margin: `0 0 ${spacing["3"]}`, fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textPrimary }}>
                            {form.id ? "Modifier l'adresse" : "Nouvelle adresse"}
                        </p>

                        {/* Libellé + suggestions */}
                        <label style={{ display: "block", fontSize: typography.xs, color: cssVar.textMuted, marginBottom: "4px" }}>Libellé</label>
                        <input value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} placeholder="Ex. Maison" style={inputStyle} />
                        <div style={{ display: "flex", gap: spacing["2"], marginTop: spacing["2"], flexWrap: "wrap" }}>
                            {LIBELLE_SUGGESTIONS.map((s) => (
                                <button key={s} type="button" onClick={() => setForm({ ...form, libelle: s })}
                                    style={{ padding: "0.2rem 0.6rem", borderRadius: radius.full, border: `1px solid ${cssVar.borderSubtle}`, background: form.libelle === s ? cssVar.bgCard : "transparent", color: form.libelle === s ? cssVar.amberGlow : cssVar.textMuted, fontSize: typography.xs, cursor: "pointer" }}>
                                    {s}
                                </button>
                            ))}
                        </div>

                        {/* Description / repère */}
                        <label style={{ display: "block", fontSize: typography.xs, color: cssVar.textMuted, margin: `${spacing["3"]} 0 4px` }}>
                            Adresse / point de repère
                        </label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                            placeholder="Ex. Quartier Almamya, en face de la pharmacie Camara, portail bleu."
                            rows={2} style={{ ...inputStyle, resize: "vertical", minHeight: 60 }} />

                        {/* Téléphone du lieu (optionnel) */}
                        <label style={{ display: "block", fontSize: typography.xs, color: cssVar.textMuted, margin: `${spacing["3"]} 0 4px` }}>
                            Téléphone du lieu <span style={{ opacity: 0.7 }}>(optionnel)</span>
                        </label>
                        <input value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="+224 …" style={inputStyle} />

                        {/* Carte GPS */}
                        <label style={{ display: "block", fontSize: typography.xs, color: cssVar.textMuted, margin: `${spacing["3"]} 0 6px` }}>
                            Emplacement sur la carte <span style={{ opacity: 0.7 }}>(aide le livreur à vous trouver)</span>
                        </label>
                        <MapPicker lat={form.lat} lng={form.lng} height={240} showLocateButton
                            caption="Cliquez sur la carte ou déplacez le marqueur pour situer précisément l'adresse de livraison."
                            onChange={(lat, lng) => setForm((f) => (f ? { ...f, lat, lng } : f))} />
                        {form.lat != null && form.lng != null && (
                            <p style={{ margin: `${spacing["2"]} 0 0`, fontSize: typography.xs, color: cssVar.textMuted }}>
                                📍 Position définie : {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
                            </p>
                        )}

                        {/* Actions form */}
                        <div style={{ display: "flex", gap: spacing["2"], marginTop: spacing["4"] }}>
                            <button onClick={handleSubmit} disabled={saving} style={{ ...btnPrimaryStyle, opacity: saving ? 0.6 : 1, cursor: saving ? "not-allowed" : "pointer" }}>
                                <Check size={14} /> {saving ? "Enregistrement…" : (form.id ? "Enregistrer" : "Ajouter au carnet")}
                            </button>
                            <button onClick={closeForm} disabled={saving} style={btnGhostStyle}>
                                <X size={14} /> Annuler
                            </button>
                        </div>
                    </div>
                )}

                {/* Liste */}
                {loading ? (
                    <p style={{ fontSize: typography.sm, color: cssVar.textMuted, textAlign: "center", padding: `${spacing["4"]} 0` }}>Chargement…</p>
                ) : adresses.length === 0 && !form ? (
                    <div style={{ textAlign: "center", padding: `${spacing["5"]} 0`, color: cssVar.textMuted }}>
                        <MapPin size={26} style={{ opacity: 0.4, marginBottom: 8 }} />
                        <p style={{ margin: 0, fontSize: typography.sm }}>Aucune adresse enregistrée.</p>
                        <p style={{ margin: "2px 0 0", fontSize: typography.xs }}>Ajoutez-en une pour la retrouver à la commande.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: spacing["2"] }}>
                        {adresses.map((a) => (
                            <div key={a.id} style={{ border: `1px solid ${a.is_default ? cssVar.borderAmber : cssVar.borderSubtle}`, borderRadius: radius.xl, padding: `${spacing["3"]} ${spacing["3"]}`, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: spacing["3"] }}>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: spacing["2"], flexWrap: "wrap" }}>
                                        <span style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: cssVar.textPrimary }}>{a.libelle}</span>
                                        {a.is_default && (
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "0.1rem 0.45rem", borderRadius: radius.full, background: cssVar.bgSectionAlt, border: `1px solid ${cssVar.borderSubtle}`, color: cssVar.amberGlow, fontSize: "0.68rem", fontWeight: typography.semibold }}>
                                                <Star size={10} fill="currentColor" /> Par défaut
                                            </span>
                                        )}
                                    </div>
                                    <p style={{ margin: "3px 0 0", fontSize: typography.xs, color: cssVar.textSecondary, lineHeight: 1.45, wordBreak: "break-word" }}>{a.description}</p>
                                    <div style={{ display: "flex", gap: spacing["3"], marginTop: 4, flexWrap: "wrap" }}>
                                        {a.telephone && <span style={{ fontSize: "0.7rem", color: cssVar.textMuted }}>☎ {a.telephone}</span>}
                                        {a.latitude != null && a.longitude != null && <span style={{ fontSize: "0.7rem", color: cssVar.textMuted }}>📍 GPS enregistré</span>}
                                    </div>

                                    {/* Actions ligne */}
                                    <div style={{ display: "flex", gap: spacing["2"], marginTop: spacing["3"], flexWrap: "wrap" }}>
                                        {!a.is_default && (
                                            <button onClick={() => handleSetDefault(a)} disabled={busyId === a.id} style={btnGhostStyle}>
                                                <Star size={13} /> Par défaut
                                            </button>
                                        )}
                                        <button onClick={() => openEdit(a)} disabled={busyId === a.id} style={btnGhostStyle}>
                                            <Pencil size={13} /> Modifier
                                        </button>
                                        <button onClick={() => handleDelete(a)} disabled={busyId === a.id}
                                            style={{ ...btnGhostStyle, color: palette.red[500] }}>
                                            <Trash2 size={13} /> Supprimer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
