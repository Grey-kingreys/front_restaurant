"use client";
// src/components/onboarding/ConfigurationInitiale.tsx
//
// Assistant de configuration affiché à l'Admin d'un restaurant tant qu'une
// étape initiale reste à faire. Les trois étapes ne sont pas décoratives :
// sans coffre, aucun transfert d'argent n'est possible ; sans position GPS, la
// restriction de connexion par QR ne s'applique pas ; sans caisse du jour, les
// paiements des tables ne sont rattachés à rien.
//
// L'état vient du backend (`Restaurant.configuration`), jamais du navigateur :
// une étape faite depuis un autre poste doit apparaître comme telle.

import { useState } from "react";
import { initCaisseGenerale, ouvrirCaisseGlobale } from "@/lib/api/paiements";
import { updateMonRestaurant, type ConfigurationRestaurant } from "@/lib/api/company";
import { apiErrorMessage } from "@/lib/apiErrors";
import { cssVar, typography, radius, spacing, modalCard } from "@/theme/theme";
import MapPicker from "@/components/map/MapPicker";
import { Check, Banknote, MapPin, Wallet, X } from "lucide-react";

type Etape = "coffre" | "position" | "caisse";

const LIBELLES: Record<Etape, { titre: string; aide: string; icone: React.ReactNode }> = {
    coffre: {
        titre: "Le solde de votre coffre",
        aide: "L'argent déjà présent dans le coffre du restaurant. Il alimente les caisses de vos comptables. Vous pouvez saisir 0 et le renseigner plus tard.",
        icone: <Banknote size={16} />,
    },
    position: {
        titre: "La position du restaurant",
        aide: "Placez le marqueur sur votre établissement. Elle sert à vérifier qu'un client scannant un QR code est bien sur place.",
        icone: <MapPin size={16} />,
    },
    caisse: {
        titre: "La caisse du jour",
        aide: "Elle centralise les paiements des tables. Elle s'ouvre ensuite automatiquement chaque matin à 5 h.",
        icone: <Wallet size={16} />,
    },
};

/** Ligne de titre d'une etape, avec sa pastille cochee ou non. */
function Etiquette({ etape, fait }: { etape: Etape; fait: boolean }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: spacing["2"], marginBottom: spacing["1"] }}>
            <span style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: fait ? "rgba(34,197,94,0.15)" : cssVar.bgSectionAlt,
                border: `1px solid ${fait ? "rgba(34,197,94,0.4)" : cssVar.borderSubtle}`,
                color: fait ? "#22c55e" : cssVar.textMuted,
            }}>
                {fait ? <Check size={13} /> : LIBELLES[etape].icone}
            </span>
            <p style={{
                margin: 0, fontSize: typography.sm, fontWeight: 700,
                color: fait ? cssVar.textMuted : cssVar.textPrimary,
                textDecoration: fait ? "line-through" : "none",
            }}>
                {LIBELLES[etape].titre}
            </p>
        </div>
    );
}

export default function ConfigurationInitiale({
    configuration,
    latitude,
    longitude,
    onTermine,
    onFermer,
}: {
    configuration: ConfigurationRestaurant;
    latitude: string | null;
    longitude: string | null;
    /** Appelé après chaque étape réussie, pour recharger l'état depuis l'API. */
    onTermine: () => void;
    onFermer: () => void;
}) {
    const [solde, setSolde] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
        latitude && longitude ? { lat: parseFloat(latitude), lng: parseFloat(longitude) } : null,
    );
    const [enCours, setEnCours] = useState<Etape | null>(null);
    const [erreur, setErreur] = useState<string | null>(null);

    const faites = [
        configuration.coffre_initialise,
        configuration.position_definie,
        configuration.caisse_du_jour_creee,
    ].filter(Boolean).length;

    const lancer = async (etape: Etape, action: () => Promise<{ success: boolean; message?: string; errors?: unknown }>) => {
        setEnCours(etape);
        setErreur(null);
        try {
            const res = await action();
            if (res.success) onTermine();
            else setErreur(apiErrorMessage(res as { message?: string }, "L'enregistrement a échoué."));
        } catch {
            setErreur("Serveur injoignable. Réessayez.");
        } finally {
            setEnCours(null);
        }
    };

    const aide = (etape: Etape) => (
        <p style={{ margin: `0 0 ${spacing["2"]}`, fontSize: "0.72rem", color: cssVar.textMuted, lineHeight: 1.5, paddingLeft: "1.9rem" }}>
            {LIBELLES[etape].aide}
        </p>
    );

    const bouton = (label: string, etape: Etape, onClick: () => void, actif = true) => (
        <button
            onClick={onClick}
            disabled={!actif || enCours !== null}
            style={{
                padding: "0.5rem 1rem", borderRadius: radius.lg, border: "none",
                background: actif ? "var(--gradient-btn)" : cssVar.bgSectionAlt,
                color: actif ? "#0c0a09" : cssVar.textMuted,
                fontWeight: 700, fontSize: typography.sm,
                cursor: !actif || enCours ? "not-allowed" : "pointer",
                opacity: enCours === etape ? 0.7 : 1,
            }}
        >
            {enCours === etape ? "En cours…" : label}
        </button>
    );

    return (
        <>
            <div style={{ position: "fixed", inset: 0, zIndex: 190, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }} />
            <div style={{ position: "fixed", inset: 0, zIndex: 191, display: "flex", alignItems: "center", justifyContent: "center", padding: spacing["4"] }}>
                <div style={{ ...modalCard, maxWidth: 520 }}>

                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: spacing["2"] }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: typography.lg, fontWeight: 800, color: cssVar.textPrimary }}>
                                Configurons votre restaurant
                            </h2>
                            <p style={{ margin: "4px 0 0", fontSize: typography.sm, color: cssVar.textMuted }}>
                                {faites} étape{faites > 1 ? "s" : ""} sur 3 terminée{faites > 1 ? "s" : ""}.
                            </p>
                        </div>
                        <button onClick={onFermer} title="Plus tard" className="rp-icon-btn" style={{
                            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: radius.md, background: cssVar.bgSectionAlt,
                            border: `1px solid ${cssVar.borderSubtle}`, cursor: "pointer",
                            color: cssVar.textMuted, flexShrink: 0, padding: 0,
                        }}>
                            <X size={14} />
                        </button>
                    </div>

                    {erreur && (
                        <div style={{ padding: "0.6rem 0.8rem", borderRadius: radius.lg, marginBottom: spacing["3"], background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", fontSize: typography.sm, whiteSpace: "pre-line" }}>
                            {erreur}
                        </div>
                    )}

                    {/* 1. Coffre */}
                    <div style={{ marginBottom: spacing["4"] }}>
                        <Etiquette etape="coffre" fait={configuration.coffre_initialise} />
                        {!configuration.coffre_initialise && (
                            <>
                                {aide("coffre")}
                                <div style={{ display: "flex", gap: spacing["2"], paddingLeft: "1.9rem" }}>
                                    <input
                                        type="number" min="0" value={solde} placeholder="0"
                                        onChange={(e) => setSolde(e.target.value)}
                                        style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: radius.lg, border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt, color: cssVar.textPrimary, fontSize: typography.sm, boxSizing: "border-box" }}
                                    />
                                    {bouton("Enregistrer", "coffre", () =>
                                        lancer("coffre", () => initCaisseGenerale({ solde_initial: parseFloat(solde) || 0 })),
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* 2. Position */}
                    <div style={{ marginBottom: spacing["4"] }}>
                        <Etiquette etape="position" fait={configuration.position_definie} />
                        {!configuration.position_definie && (
                            <>
                                {aide("position")}
                                <div style={{ paddingLeft: "1.9rem" }}>
                                    <MapPicker
                                        lat={coords?.lat ?? null}
                                        lng={coords?.lng ?? null}
                                        onChange={(lat, lng) => setCoords({ lat, lng })}
                                        height={180}
                                        showLocateButton
                                        caption="Cliquez sur la carte ou utilisez « Me localiser »."
                                    />
                                    <div style={{ marginTop: spacing["2"] }}>
                                        {bouton("Enregistrer la position", "position", () =>
                                            lancer("position", () =>
                                                updateMonRestaurant({ latitude: coords!.lat, longitude: coords!.lng }),
                                            ),
                                        !!coords)}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* 3. Caisse du jour */}
                    <div style={{ marginBottom: spacing["4"] }}>
                        <Etiquette etape="caisse" fait={configuration.caisse_du_jour_creee} />
                        {!configuration.caisse_du_jour_creee && (
                            <>
                                {aide("caisse")}
                                <div style={{ paddingLeft: "1.9rem" }}>
                                    {bouton("Ouvrir la caisse du jour", "caisse", () =>
                                        lancer("caisse", () => ouvrirCaisseGlobale()),
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <button onClick={onFermer} style={{
                        width: "100%", padding: "0.6rem", borderRadius: radius.lg,
                        border: `1px solid ${cssVar.borderSubtle}`, background: cssVar.bgSectionAlt,
                        color: cssVar.textSecondary, fontWeight: 700, fontSize: typography.sm, cursor: "pointer",
                    }}>
                        Plus tard
                    </button>
                </div>
            </div>
        </>
    );
}
