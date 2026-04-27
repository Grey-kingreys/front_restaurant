"use client";
// src/components/menu/PlatForm.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPlat, updatePlat } from "@/lib/api/menu";
import { ImageUploader } from "./ImageUploader";
import type { Plat, Categorie } from "@/lib/api/menu";
import { CATEGORIES } from "@/hooks/useMenu";
import {
    inputStyle, cssVar, typography, radius, spacing, palette,
    btnPrimary, btnPrimaryDisabled,
} from "@/theme/theme";

interface PlatFormProps {
    plat?: Plat; // undefined = création, défini = édition
}

const CATEGORIE_OPTIONS = CATEGORIES.slice(1); // sans "Tous"

export function PlatForm({ plat }: PlatFormProps) {
    const router = useRouter();
    const isEdit = !!plat;

    const [nom, setNom] = useState(plat?.nom ?? "");
    const [description, setDescription] = useState(plat?.description ?? "");
    const [prix, setPrix] = useState(plat?.prix_unitaire ? String(Number(plat.prix_unitaire)) : "");
    const [categorie, setCategorie] = useState<Categorie>(plat?.categorie ?? "PLAT");
    const [disponible, setDisponible] = useState(plat?.disponible ?? true);
    const [cuisine, setCuisine] = useState(plat?.necessite_validation_cuisine ?? false);
    const [image, setImage] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const existingImageUrl = plat?.image
        ? plat.image.startsWith("http")
            ? plat.image
            : `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:8000"}${plat.image}`
        : null;

    const validate = () => {
        const e: Record<string, string> = {};
        if (!nom.trim()) e.nom = "Le nom est obligatoire.";
        if (!prix || isNaN(Number(prix)) || Number(prix) <= 0)
            e.prix = "Le prix doit être un nombre positif.";
        if (image && image.size > 5 * 1024 * 1024)
            e.image = "L'image ne doit pas dépasser 5 Mo.";
        return e;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setLoading(true);
        setErrors({});

        try {
            const payload: Parameters<typeof createPlat>[0] = {
                nom: nom.trim(),
                description: description.trim() || undefined,
                prix_unitaire: Number(prix),
                categorie,
                disponible,
                necessite_validation_cuisine: cuisine,
                ...(image ? { image } : {}),
            };

            const res = isEdit
                ? await updatePlat(plat!.id, payload)
                : await createPlat(payload);

            if (res.success) {
                setSuccess(true);
                setTimeout(() => router.push("/menu"), 1200);
            } else {
                setErrors({ global: res.message || "Une erreur est survenue." });
            }
        } catch (err: unknown) {
            const e = err as { errors?: Record<string, string[]>; message?: string };
            if (e?.errors) {
                const mapped: Record<string, string> = {};
                Object.entries(e.errors).forEach(([k, v]) => {
                    mapped[k] = Array.isArray(v) ? v[0] : String(v);
                });
                setErrors(mapped);
            } else {
                setErrors({ global: e?.message ?? "Erreur serveur." });
            }
        } finally {
            setLoading(false);
        }
    };

    const label = (text: string, required = false) => (
        <label style={{
            display: "block", fontSize: typography.sm, fontWeight: 600,
            color: cssVar.textSecondary, marginBottom: spacing["1"],
        }}>
            {text}{required && <span style={{ color: palette.amber[500], marginLeft: 2 }}>*</span>}
        </label>
    );

    const fieldError = (key: string) =>
        errors[key] ? (
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: palette.red[500] }}>
                {errors[key]}
            </p>
        ) : null;

    return (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: spacing["5"] }}>

            {/* Nom + Catégorie */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: spacing["3"] }}>
                <div>
                    {label("Nom du plat", true)}
                    <input
                        type="text"
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        placeholder="Ex : Thiéboudienne Royale"
                        style={{ ...inputStyle, borderColor: errors.nom ? "rgba(239,68,68,0.5)" : undefined }}
                    />
                    {fieldError("nom")}
                </div>

                <div>
                    {label("Catégorie", true)}
                    <select
                        value={categorie}
                        onChange={(e) => setCategorie(e.target.value as Categorie)}
                        style={{
                            ...inputStyle,
                            width: "auto",
                            minWidth: 160,
                            cursor: "pointer",
                        }}
                    >
                        {CATEGORIE_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                                {c.emoji} {c.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Description */}
            <div>
                {label("Description")}
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez le plat (ingrédients, préparation…)"
                    rows={3}
                    style={{
                        ...inputStyle,
                        resize: "vertical",
                        minHeight: 80,
                        fontFamily: typography.fontSans,
                        lineHeight: 1.5,
                    }}
                />
            </div>

            {/* Prix + Switches */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: spacing["4"] }}>
                <div>
                    {label("Prix unitaire (GNF)", true)}
                    <div style={{ position: "relative" }}>
                        <input
                            type="number"
                            value={prix}
                            onChange={(e) => setPrix(e.target.value)}
                            placeholder="Ex : 45000"
                            min={1}
                            step={500}
                            style={{
                                ...inputStyle,
                                paddingRight: "3.5rem",
                                borderColor: errors.prix ? "rgba(239,68,68,0.5)" : undefined,
                            }}
                        />
                        <span style={{
                            position: "absolute", right: "0.875rem", top: "50%",
                            transform: "translateY(-50%)",
                            fontSize: typography.sm, fontWeight: 600, color: cssVar.textMuted,
                        }}>
                            GNF
                        </span>
                    </div>
                    {fieldError("prix")}
                    {prix && !isNaN(Number(prix)) && Number(prix) > 0 && (
                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.72rem", color: cssVar.amberGlow }}>
                            ≈ {Number(prix).toLocaleString("fr-FR")} GNF
                        </p>
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: spacing["3"] }}>
                    <div>
                        {label("Options")}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {/* Toggle disponible */}
                            <ToggleSwitch
                                checked={disponible}
                                onChange={setDisponible}
                                label="Disponible à la commande"
                                colorOn="#22c55e"
                            />
                            {/* Toggle cuisine */}
                            <ToggleSwitch
                                checked={cuisine}
                                onChange={setCuisine}
                                label="Validation cuisine requise"
                                colorOn="#f97316"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Image */}
            <div>
                {label("Image du plat")}
                <ImageUploader
                    value={image}
                    preview={existingImageUrl}
                    onChange={setImage}
                    error={errors.image}
                />
            </div>

            {/* Erreur globale */}
            {errors.global && (
                <div style={{
                    padding: "0.65rem 0.875rem",
                    borderRadius: radius.lg,
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: palette.red[500],
                    fontSize: "0.82rem",
                }}>
                    {errors.global}
                </div>
            )}

            {/* Succès */}
            {success && (
                <div style={{
                    padding: "0.65rem 0.875rem",
                    borderRadius: radius.lg,
                    background: "rgba(34,197,94,0.08)",
                    border: "1px solid rgba(34,197,94,0.2)",
                    color: "#22c55e",
                    fontSize: "0.82rem",
                    display: "flex", alignItems: "center", gap: "0.4rem",
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                    {isEdit ? "Plat mis à jour !" : "Plat créé avec succès !"} Redirection…
                </div>
            )}

            {/* Boutons */}
            <div style={{ display: "flex", gap: spacing["3"], justifyContent: "flex-end", paddingTop: spacing["2"] }}>
                <button
                    type="button"
                    onClick={() => router.push("/menu")}
                    style={{
                        padding: "0.65rem 1.25rem",
                        borderRadius: radius.lg,
                        border: `1px solid ${cssVar.borderSubtle}`,
                        background: "transparent",
                        color: cssVar.textSecondary,
                        fontWeight: 600,
                        fontSize: typography.base,
                        cursor: "pointer",
                    }}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    disabled={loading || success}
                    style={{
                        ...(loading || success ? btnPrimaryDisabled : btnPrimary),
                        padding: "0.65rem 1.75rem",
                        minWidth: 140,
                        fontSize: typography.base,
                    }}
                >
                    {loading ? (
                        <>
                            <div style={{
                                width: 14, height: 14, borderRadius: "50%",
                                border: "2px solid currentColor",
                                borderTopColor: "transparent",
                                animation: "spin 0.65s linear infinite",
                            }} />
                            {isEdit ? "Enregistrement…" : "Création…"}
                        </>
                    ) : isEdit ? "Enregistrer" : "Créer le plat"}
                </button>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </form>
    );
}

// ── Toggle Switch ─────────────────────────────────────────────────────────

function ToggleSwitch({
    checked, onChange, label, colorOn,
}: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    colorOn: string;
}) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                background: "transparent", border: "none", cursor: "pointer",
                padding: 0, textAlign: "left",
            }}
        >
            {/* Track */}
            <div style={{
                width: 36, height: 20, borderRadius: 10,
                background: checked ? colorOn : "var(--border-subtle)",
                position: "relative",
                transition: "background 0.2s",
                flexShrink: 0,
            }}>
                {/* Thumb */}
                <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: "#fff",
                    position: "absolute",
                    top: 2, left: checked ? 18 : 2,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }} />
            </div>
            <span style={{
                fontSize: typography.sm, color: cssVar.textSecondary,
                fontWeight: 500,
            }}>
                {label}
            </span>
        </button>
    );
}