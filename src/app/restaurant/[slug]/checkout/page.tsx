"use client";
// src/app/restaurant/[slug]/checkout/page.tsx
// Page de validation de commande (livraison / emporter) + choix paiement

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Trash2, Plus, Minus, MapPin, Phone, Truck, ShoppingBag, Banknote, Smartphone, CreditCard, Globe, ChevronDown, type LucideIcon } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { commander, MODES_PAIEMENT, type TypeCommande, type ModePaiement } from "@/lib/api/public";
import { getRestaurantPublic, type RestaurantPublic } from "@/lib/api/public";
import { listAdresses, createAdresse } from "@/lib/api/adresses";
import type { AdresseClient } from "@/types";
import MapPicker from "@/components/map/MapPicker";
import { apiErrorMessage } from "@/lib/apiErrors";

const PAYMENT_ICONS: Record<string, LucideIcon> = {
    "banknote":    Banknote,
    "smartphone":  Smartphone,
    "credit-card": CreditCard,
    "globe":       Globe,
};

export default function CheckoutPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const slug = params?.slug as string ?? "";

    const { items, total, updateQuantite, removeItem, clearCart } = useCart();
    const { isAuthenticated, user } = useAuth();

    const [resto, setResto] = useState<RestaurantPublic | null>(null);
    const [typeCommande, setTypeCommande] = useState<TypeCommande>(
        (searchParams?.get("mode") as TypeCommande) ?? "livraison"
    );
    const [modePaiement, setModePaiement] = useState<ModePaiement>("livraison");
    const [adresse, setAdresse] = useState("");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [telephone, setTelephone] = useState(user?.telephone ?? "");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Carnet d'adresses (clients connectés) : sélection d'une adresse enregistrée
    // ou saisie d'une nouvelle, avec option d'enregistrement dans le carnet.
    const [savedAdresses, setSavedAdresses] = useState<AdresseClient[]>([]);
    const [adresseChoice, setAdresseChoice] = useState<number | "new">("new");
    const [saveToCarnet, setSaveToCarnet] = useState(true);
    const [carnetLibelle, setCarnetLibelle] = useState("");

    const applyAdresse = (a: AdresseClient) => {
        setAdresseChoice(a.id);
        setAdresse(a.description);
        setCoords(a.latitude != null && a.longitude != null ? { lat: Number(a.latitude), lng: Number(a.longitude) } : null);
        setTelephone((t) => t || a.telephone || "");
        setErrors((e) => ({ ...e, adresse: "" }));
    };
    const selectNewAdresse = () => {
        setAdresseChoice("new");
        setAdresse("");
        setCoords(null);
    };

    useEffect(() => {
        getRestaurantPublic(slug)
            .then((res) => {
                if (res.success && res.data) {
                    const r = res.data.restaurant;
                    setResto(r);
                    // Cale le type sur un mode réellement proposé par le restaurant
                    setTypeCommande((cur) => {
                        if (cur === "livraison" && r.accept_livraison) return cur;
                        if (cur === "emporter" && r.accept_emporter) return cur;
                        return r.accept_livraison ? "livraison" : "emporter";
                    });
                }
            })
            .catch(() => {});
    }, [slug]);

    useEffect(() => {
        if (user?.telephone) setTelephone(user.telephone);
    }, [user]);

    // Charge le carnet d'adresses et pré-sélectionne l'adresse par défaut.
    useEffect(() => {
        if (!isAuthenticated || user?.role !== "Rclient") return;
        listAdresses()
            .then((res) => {
                if (res.success && res.data && res.data.length > 0) {
                    setSavedAdresses(res.data);
                    const def = res.data.find((a) => a.is_default) ?? res.data[0];
                    applyAdresse(def);
                }
            })
            .catch(() => {});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user]);

    // Les frais de livraison n'entrent pas dans le total : ils varient avec la
    // distance et se règlent directement avec le livreur.

    const validate = () => {
        const e: Record<string, string> = {};
        if (!telephone.trim()) e.telephone = "Le numéro est obligatoire.";
        if (typeCommande === "livraison" && !adresse.trim()) e.adresse = "L'adresse de livraison est obligatoire.";
        if (items.length === 0) e.items = "Votre panier est vide.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async () => {
        if (!isAuthenticated || user?.role !== "Rclient") {
            router.push(`/auth/login?next=/restaurant/${slug}/checkout?mode=${typeCommande}`);
            return;
        }
        if (!validate()) return;

        setSubmitting(true);
        try {
            const res = await commander(slug, {
                type_commande: typeCommande,
                mode_paiement: modePaiement,
                adresse_livraison: typeCommande === "livraison" ? adresse : undefined,
                latitude: typeCommande === "livraison" ? coords?.lat : undefined,
                longitude: typeCommande === "livraison" ? coords?.lng : undefined,
                telephone,
                items: items.map((i) => ({ plat_id: i.platId, quantite: i.quantite })),
            });
            if (res.success && res.data) {
                // Enregistre la nouvelle adresse dans le carnet si le client l'a demandé
                // (best-effort : n'empêche pas la confirmation de la commande en cas d'échec).
                if (typeCommande === "livraison" && adresseChoice === "new" && saveToCarnet && adresse.trim()) {
                    try {
                        await createAdresse({
                            libelle: carnetLibelle.trim() || "Mon adresse",
                            description: adresse.trim(),
                            telephone: telephone.trim() || null,
                            latitude: coords?.lat ?? null,
                            longitude: coords?.lng ?? null,
                        });
                    } catch { /* ignore */ }
                }
                clearCart();
                router.push(`/restaurant/${slug}/confirmation/${res.data.cle_suivi}`);
            } else {
                setErrors({ submit: apiErrorMessage(res, "Une erreur s'est produite.") });
                setSubmitting(false);
            }
        } catch (e: unknown) {
            const msg = (e as { message?: string })?.message || "Une erreur s'est produite.";
            setErrors({ submit: msg });
            setSubmitting(false);
        }
    };

    if (items.length === 0 && !submitting) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "1rem" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Votre panier est vide.</p>
                <button onClick={() => router.push(`/restaurant/${slug}`)} style={{ padding: "0.625rem 1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", background: "none", color: "var(--text-secondary)", cursor: "pointer", fontWeight: 600 }}>
                    ← Retour au menu
                </button>
            </div>
        );
    }

    const inputStyle = (hasError?: boolean) => ({
        width: "100%", padding: "0.75rem 1rem", borderRadius: "var(--radius-lg)",
        border: `1px solid ${hasError ? "rgba(239,68,68,0.6)" : "var(--border-subtle)"}`,
        background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.9rem",
        boxSizing: "border-box" as const, outline: "none",
    });

    return (
        <>
            <style>{`input::placeholder,textarea::placeholder{color:var(--text-muted)}`}</style>
            <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1rem 8rem" }}>

                {/* En-tête */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
                    <button onClick={() => router.back()} style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ArrowLeft size={16} />
                    </button>
                    <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>Votre commande</h1>
                </div>

                {/* Mode livraison / emporter — modes réellement proposés par le restaurant */}
                {resto && (() => {
                    const modes: TypeCommande[] = [
                        ...(resto.accept_livraison ? (["livraison"] as TypeCommande[]) : []),
                        ...(resto.accept_emporter ? (["emporter"] as TypeCommande[]) : []),
                    ];
                    if (modes.length === 0) return null;
                    return (
                        <div style={{ display: "flex", gap: "0.625rem", marginBottom: "1.5rem" }}>
                            {modes.map((mode) => (
                                <button key={mode} onClick={() => setTypeCommande(mode)}
                                    style={{ flex: 1, padding: "0.75rem", borderRadius: "var(--radius-lg)", border: `2px solid ${typeCommande === mode ? "#f59e0b" : "var(--border-subtle)"}`, background: typeCommande === mode ? "var(--bg-section-alt)" : "var(--bg-card)", color: typeCommande === mode ? "#f59e0b" : "var(--text-muted)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}>
                                    {mode === "livraison" ? <Truck size={15} /> : <ShoppingBag size={15} />}
                                    {mode === "livraison" ? "Livraison" : "À emporter"}
                                </button>
                            ))}
                        </div>
                    );
                })()}

                {/* Récapitulatif articles */}
                <section style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Articles</h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                        {items.map((item) => (
                            <div key={item.platId} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem", borderRadius: "var(--radius-xl)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.88rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.nom}</div>
                                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>{item.prix_unitaire.toLocaleString("fr-FR")} GNF × {item.quantite}</div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                                    <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: "0.88rem", minWidth: 80, textAlign: "right" }}>
                                        {(item.prix_unitaire * item.quantite).toLocaleString("fr-FR")} GNF
                                    </span>
                                    <button onClick={() => updateQuantite(item.platId, item.quantite - 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "1px solid var(--border-subtle)", background: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {item.quantite === 1 ? <Trash2 size={10} /> : <Minus size={10} />}
                                    </button>
                                    <span style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontWeight: 700, minWidth: 18, textAlign: "center" }}>{item.quantite}</span>
                                    <button onClick={() => updateQuantite(item.platId, item.quantite + 1)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: "#f59e0b", color: "#0c0a09", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Plus size={10} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Infos livraison */}
                <section style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {typeCommande === "livraison" ? "Adresse de livraison" : "Vos coordonnées"}
                    </h2>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                                <Phone size={13} style={{ color: "var(--text-muted)" }} />
                                <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Téléphone</label>
                            </div>
                            <input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+224 6XX XXX XXX" style={inputStyle(!!errors.telephone)} />
                            {errors.telephone && <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>{errors.telephone}</p>}
                        </div>
                        {typeCommande === "livraison" && (
                            <>
                            {/* Adresses enregistrées : sélection rapide */}
                            {savedAdresses.length > 0 && (
                                <div>
                                    <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "block", marginBottom: "0.5rem" }}>Livrer à</label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        {savedAdresses.map((a) => {
                                            const active = adresseChoice === a.id;
                                            return (
                                                <button key={a.id} type="button" onClick={() => applyAdresse(a)}
                                                    style={{ textAlign: "left", padding: "0.7rem 0.85rem", borderRadius: "var(--radius-lg)", border: `2px solid ${active ? "#f59e0b" : "var(--border-subtle)"}`, background: active ? "var(--bg-section-alt)" : "var(--bg-card)", cursor: "pointer", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                                                    <MapPin size={15} style={{ color: active ? "#f59e0b" : "var(--text-muted)", marginTop: 2, flexShrink: 0 }} />
                                                    <span style={{ minWidth: 0 }}>
                                                        <span style={{ display: "flex", gap: "0.4rem", alignItems: "center", flexWrap: "wrap" }}>
                                                            <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>{a.libelle}</span>
                                                            {a.is_default && <span style={{ fontSize: "0.65rem", color: "#f59e0b" }}>★ défaut</span>}
                                                        </span>
                                                        <span style={{ display: "block", fontSize: "0.76rem", color: "var(--text-muted)", marginTop: 2, lineHeight: 1.4 }}>{a.description}</span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        <button type="button" onClick={selectNewAdresse}
                                            style={{ textAlign: "left", padding: "0.7rem 0.85rem", borderRadius: "var(--radius-lg)", border: `2px dashed ${adresseChoice === "new" ? "#f59e0b" : "var(--border-subtle)"}`, background: "transparent", cursor: "pointer", display: "flex", gap: "0.6rem", alignItems: "center", color: adresseChoice === "new" ? "#f59e0b" : "var(--text-muted)", fontWeight: 600, fontSize: "0.82rem" }}>
                                            <Plus size={15} /> Utiliser une nouvelle adresse
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Saisie d'une nouvelle adresse (ou aucun carnet) */}
                            {(adresseChoice === "new" || savedAdresses.length === 0) && (
                                <>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                                        <MapPin size={13} style={{ color: "var(--text-muted)" }} />
                                        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Adresse de livraison</label>
                                    </div>
                                    <textarea value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="Quartier, rue, repère…" rows={3}
                                        style={{ ...inputStyle(!!errors.adresse), resize: "none", fontFamily: "inherit" }} />
                                    {errors.adresse && <p style={{ margin: "0.25rem 0 0", fontSize: "0.75rem", color: "#ef4444" }}>{errors.adresse}</p>}
                                </div>
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.4rem" }}>
                                        <MapPin size={13} style={{ color: "var(--text-muted)" }} />
                                        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Votre position sur la carte (facultatif)</label>
                                    </div>
                                    <MapPicker lat={coords?.lat ?? null} lng={coords?.lng ?? null} onChange={(la, ln) => setCoords({ lat: la, lng: ln })} height={220} showLocateButton
                                        caption="Cliquez sur la carte ou déplacez le marqueur pour situer précisément votre adresse de livraison." />
                                    <p style={{ margin: "0.4rem 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        {coords
                                            ? `Position choisie : ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`
                                            : "Touchez la carte pour placer votre position — ça aide le livreur à vous trouver."}
                                    </p>
                                </div>

                                {/* Enregistrer dans le carnet (clients connectés) */}
                                {isAuthenticated && user?.role === "Rclient" && adresse.trim() && (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                                            <input type="checkbox" checked={saveToCarnet} onChange={(e) => setSaveToCarnet(e.target.checked)} style={{ accentColor: "#f59e0b", width: 15, height: 15 }} />
                                            Enregistrer cette adresse dans mon carnet
                                        </label>
                                        {saveToCarnet && (
                                            <input value={carnetLibelle} onChange={(e) => setCarnetLibelle(e.target.value)} placeholder="Nom de l'adresse (ex. Maison)"
                                                style={{ ...inputStyle(false), maxWidth: 260 }} />
                                        )}
                                    </div>
                                )}
                                </>
                            )}
                            </>
                        )}
                    </div>
                </section>

                {/* Mode de paiement */}
                <section style={{ marginBottom: "1.5rem" }}>
                    <h2 style={{ margin: "0 0 0.75rem", fontSize: "0.85rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Mode de paiement</h2>
                    {(() => {
                        const selected = MODES_PAIEMENT.find((mp) => mp.value === modePaiement) ?? MODES_PAIEMENT[0];
                        const Icon = PAYMENT_ICONS[selected.icon];
                        return (
                            <div style={{
                                display: "flex", alignItems: "center", gap: "0.875rem", padding: "0 1rem", borderRadius: "var(--radius-xl)",
                                border: "2px solid var(--border-subtle)", background: "var(--bg-section-alt)",
                            }}>
                                <Icon size={20} style={{ flexShrink: 0, color: "#f59e0b" }} />
                                <select value={modePaiement} onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
                                    aria-label="Mode de paiement"
                                    style={{
                                        flex: 1, minWidth: 0, padding: "0.875rem 0", border: "none", outline: "none",
                                        background: "transparent", color: "#f59e0b", fontWeight: 600, fontSize: "0.88rem",
                                        cursor: "pointer", appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
                                    }}>
                                    {MODES_PAIEMENT.map((mp) => (
                                        <option key={mp.value} value={mp.value} disabled={!mp.disponible}
                                            style={{ color: "var(--text-primary)", background: "var(--bg-card)" }}>
                                            {mp.label}{mp.disponible ? "" : " — bientôt"}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={18} style={{ flexShrink: 0, color: "#f59e0b" }} />
                            </div>
                        );
                    })()}
                    <p style={{ margin: "0.5rem 0 0", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        Les autres moyens (Mobile Money, carte bancaire, PayDunya) arrivent bientôt.
                    </p>
                </section>

                {/* Récapitulatif montants */}
                <section style={{ padding: "1rem", borderRadius: "var(--radius-xl)", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", marginBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        <span>Sous-total</span>
                        <span>{total.toLocaleString("fr-FR")} GNF</span>
                    </div>
                    {typeCommande === "livraison" && (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            <span>Frais de livraison</span>
                            <span>À convenir avec le livreur</span>
                        </div>
                    )}
                    <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#f59e0b", fontSize: "1rem" }}>
                        <span>Total</span>
                        <span>{total.toLocaleString("fr-FR")} GNF</span>
                    </div>
                </section>

                {errors.submit && <p style={{ color: "#ef4444", fontSize: "0.82rem", marginBottom: "0.75rem", padding: "0.75rem", borderRadius: "var(--radius-lg)", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>{errors.submit}</p>}

                {/* Bouton commander / connexion */}
                {!isAuthenticated || user?.role !== "Rclient" ? (
                    <div style={{ background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", padding: "1rem", textAlign: "center" }}>
                        <p style={{ margin: "0 0 0.75rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>Connectez-vous pour finaliser votre commande.</p>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                            <button onClick={() => router.push(`/auth/login?next=/restaurant/${slug}/checkout?mode=${typeCommande}`)} style={{ padding: "0.625rem 1.25rem", borderRadius: "var(--radius-lg)", border: "none", background: "#f59e0b", color: "#0c0a09", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                                Se connecter
                            </button>
                            <button onClick={() => router.push(`/auth/client/register?next=/restaurant/${slug}/checkout?mode=${typeCommande}`)} style={{ padding: "0.625rem 1.25rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", background: "none", color: "var(--text-secondary)", fontWeight: 600, cursor: "pointer", fontSize: "0.85rem" }}>
                                Créer un compte
                            </button>
                        </div>
                    </div>
                ) : (
                    <button onClick={handleSubmit} disabled={submitting} style={{ width: "100%", padding: "1rem", borderRadius: "var(--radius-xl)", border: "none", background: submitting ? "rgba(245,158,11,0.5)" : "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0c0a09", fontWeight: 800, fontSize: "1rem", cursor: submitting ? "not-allowed" : "pointer" }}>
                        {submitting ? "Envoi en cours…" : `Confirmer la commande • ${total.toLocaleString("fr-FR")} GNF`}
                    </button>
                )}
            </div>
        </>
    );
}
