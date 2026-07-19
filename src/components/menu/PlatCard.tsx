"use client";
// src/components/menu/PlatCard.tsx

import Link from "next/link";
import Image from "next/image";
import type { Plat } from "@/lib/api/menu";
import { CATEGORIES } from "@/hooks/useMenu";
import { 
    Utensils, 
    ChefHat, 
    Eye, 
    EyeOff, 
    Pencil, 
    Trash2, 
    Check, 
    Plus,
    Zap
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:8000";

function formatPrix(prix: string) {
    return Number(prix).toLocaleString("fr-FR").replace(/\s/g, " ") + " GNF";
}

function getCatInfo(cat: string) {
    const info = CATEGORIES.find((c) => c.value === cat);
    return info ?? { icon: Utensils, label: cat };
}

// ── Variante Staff (Admin / Chef / Manager) ────────────────────────────────

interface StaffCardProps {
    plat: Plat;
    canEdit: boolean;
    onToggle: (id: number) => void;
    onDelete?: (id: number) => void;
    toggling?: boolean;
}

export function PlatCardStaff({ plat, canEdit, onToggle, onDelete, toggling }: StaffCardProps) {
    const cat = getCatInfo(plat.categorie);
    const imgSrc = plat.image_url ?? null;

    return (
        <div style={{
            background: "var(--bg-card)",
            border: `1px solid ${plat.disponible ? "var(--border-subtle)" : "rgba(239,68,68,0.18)"}`,
            borderRadius: "1rem",
            overflow: "hidden",
            transition: "all 0.2s ease",
            opacity: plat.disponible ? 1 : 0.72,
            display: "flex",
            flexDirection: "column",
        }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-amber)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card-hover)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = plat.disponible ? "var(--border-subtle)" : "rgba(239,68,68,0.18)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
        >
            {/* Image */}
            <div style={{
                height: 160,
                background: imgSrc ? "none" : "var(--bg-section-alt)",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
            }}>
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={plat.nom}
                        fill
                        unoptimized
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "3rem",
                    }}>
                        <cat.icon size={48} style={{ opacity: 0.2 }} />
                    </div>
                )}

                {/* Badges overlay */}
                <div style={{
                    position: "absolute", top: "0.5rem", left: "0.5rem",
                    display: "flex", gap: "0.3rem", flexWrap: "wrap",
                }}>
                    <span style={{
                        padding: "0.2rem 0.5rem", borderRadius: "9999px",
                        fontSize: "0.65rem", fontWeight: 700,
                        background: "rgba(0,0,0,0.65)", color: "#fff",
                        backdropFilter: "blur(4px)",
                    }}>
                        <cat.icon size={10} /> {cat.label}
                    </span>
                    {plat.necessite_validation_cuisine && (
                        <span style={{
                            padding: "0.2rem 0.5rem", borderRadius: "9999px",
                            fontSize: "0.65rem", fontWeight: 700,
                            background: "rgba(249,115,22,0.85)", color: "#fff",
                        }}>
                            <ChefHat size={10} /> Cuisine
                        </span>
                    )}
                </div>

                {/* Statut dispo */}
                <div style={{
                    position: "absolute", top: "0.5rem", right: "0.5rem",
                }}>
                    <span style={{
                        padding: "0.2rem 0.5rem", borderRadius: "9999px",
                        fontSize: "0.65rem", fontWeight: 700,
                        background: plat.disponible ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)",
                        color: "#fff",
                    }}>
                        {plat.disponible ? "● Dispo" : "● Indispo"}
                    </span>
                </div>
            </div>

            {/* Contenu */}
            <div style={{ padding: "0.875rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <h3 style={{
                    margin: 0, fontSize: "0.95rem", fontWeight: 700,
                    color: "var(--text-primary)", fontFamily: "var(--font-playfair), serif",
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                }}>
                    {plat.nom}
                </h3>

                {plat.description && (
                    <p style={{
                        margin: 0, fontSize: "0.75rem", color: "var(--text-muted)",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}>
                        {plat.description}
                    </p>
                )}

                <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                    <span style={{
                        fontSize: "1.05rem", fontWeight: 800,
                        background: "var(--gradient-text)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "var(--font-playfair), serif",
                    }}>
                        {formatPrix(plat.prix_unitaire)}
                    </span>
                </div>
            </div>

            {/* Actions */}
            {canEdit && (
                <div style={{
                    borderTop: "1px solid var(--border-subtle)",
                    display: "flex", gap: 0,
                }}>
                    <Link
                        href={`/menu/${plat.id}/modifier`}
                        style={{
                            flex: 1, padding: "0.75rem 0.6rem", minHeight: "44px",
                            textAlign: "center", fontSize: "0.8rem", fontWeight: 600,
                            color: "var(--text-secondary)", textDecoration: "none",
                            background: "transparent",
                            borderRight: "1px solid var(--border-subtle)",
                            transition: "all 0.15s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--bg-section-alt)";
                            e.currentTarget.style.color = "var(--amber-glow)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--text-secondary)";
                        }}
                    >
                        <Pencil size={13} />
                        Modifier
                    </Link>

                    <button
                        onClick={() => onToggle(plat.id)}
                        disabled={toggling}
                        style={{
                            flex: 1, padding: "0.75rem 0.6rem", minHeight: "44px",
                            fontSize: "0.8rem", fontWeight: 600,
                            color: plat.disponible ? "#ef4444" : "#22c55e",
                            background: "transparent", border: "none", cursor: "pointer",
                            borderRight: onDelete ? "1px solid var(--border-subtle)" : "none",
                            transition: "all 0.15s",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.3rem",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-section-alt)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        }}
                    >
                        {plat.disponible ? (
                            <>
                                <EyeOff size={13} />
                                Désactiver
                            </>
                        ) : (
                            <>
                                <Eye size={13} />
                                Activer
                            </>
                        )}
                    </button>

                    {onDelete && (
                        <button
                            onClick={() => onDelete(plat.id)}
                            style={{
                                flex: 0, padding: "0.75rem", minHeight: "44px", minWidth: "44px",
                                fontSize: "0.8rem", fontWeight: 600,
                                color: "#ef4444",
                                background: "transparent", border: "none", cursor: "pointer",
                                transition: "all 0.15s",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                            }}
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Variante Table (menu client, lecture seule + ajout panier) ────────────

interface TableCardProps {
    plat: Plat;
    onAddToCart?: (plat: Plat) => void;
    quantiteInCart?: number;
    adding?: boolean;
}

export function PlatCardTable({ plat, onAddToCart, quantiteInCart = 0, adding }: TableCardProps) {
    const cat = getCatInfo(plat.categorie);
    const imgSrc = plat.image_url ?? null;

    return (
        <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "1.125rem",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.22s ease",
            cursor: "default",
        }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-amber)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--shadow-card-hover)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
            }}
        >
            {/* Image */}
            <div style={{
                height: 140,
                background: imgSrc ? "none" : "var(--bg-section-alt)",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
            }}>
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={plat.nom}
                        fill
                        unoptimized
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "2.5rem",
                    }}>
                        <cat.icon size={40} style={{ opacity: 0.2 }} />
                    </div>
                )}

                {/* Bas gauche : catégorie seulement */}
                <span style={{
                    position: "absolute", bottom: "0.4rem", left: "0.4rem",
                    padding: "0.15rem 0.45rem", borderRadius: "9999px",
                    fontSize: "0.62rem", fontWeight: 700,
                    display: "flex", alignItems: "center", gap: "0.2rem",
                    background: "rgba(0,0,0,0.6)", color: "#fff",
                    backdropFilter: "blur(4px)",
                    maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                    <cat.icon size={9} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cat.label}</span>
                </span>

                {/* Haut droite : cuisine + panier empilés */}
                <div style={{
                    position: "absolute", top: "0.4rem", right: "0.4rem",
                    display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem",
                }}>
                    {quantiteInCart > 0 && (
                        <div style={{
                            width: 22, height: 22, borderRadius: "50%",
                            background: "var(--gradient-btn)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: 800, color: "#0c0a09",
                        }}>
                            {quantiteInCart}
                        </div>
                    )}
                    <span style={{
                        padding: "0.18rem 0.45rem", borderRadius: "9999px",
                        fontSize: "0.6rem", fontWeight: 700,
                        display: "flex", alignItems: "center", gap: "0.2rem",
                        backdropFilter: "blur(4px)",
                        background: plat.necessite_validation_cuisine
                            ? "rgba(249,115,22,0.88)"
                            : "rgba(34,197,94,0.82)",
                        color: "#fff",
                        whiteSpace: "nowrap",
                    }}>
                        {plat.necessite_validation_cuisine
                            ? <><ChefHat size={8} /> Cuisine</>
                            : <><Zap size={8} /> Direct</>
                        }
                    </span>
                </div>
            </div>

            {/* Contenu */}
            <div style={{ padding: "0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <h3 style={{
                    margin: 0, fontSize: "0.875rem", fontWeight: 700,
                    color: "var(--text-primary)", fontFamily: "var(--font-playfair), serif",
                    lineHeight: 1.3,
                }}>
                    {plat.nom}
                </h3>

                {plat.description && (
                    <p style={{
                        margin: 0, fontSize: "0.72rem", color: "var(--text-muted)",
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}>
                        {plat.description}
                    </p>
                )}

                <div style={{
                    marginTop: "auto", paddingTop: "0.5rem",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <span style={{
                        fontSize: "0.95rem", fontWeight: 800,
                        background: "var(--gradient-text)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: "var(--font-playfair), serif",
                    }}>
                        {formatPrix(plat.prix_unitaire)}
                    </span>

                    {onAddToCart && (
                        <button
                            onClick={() => onAddToCart(plat)}
                            disabled={adding}
                            style={{
                                width: 44, height: 44,
                                borderRadius: "50%",
                                background: quantiteInCart > 0 ? "var(--gradient-btn)" : "var(--icon-bg)",
                                border: `1px solid ${quantiteInCart > 0 ? "transparent" : "var(--icon-border)"}`,
                                cursor: adding ? "not-allowed" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: quantiteInCart > 0 ? "#0c0a09" : "var(--icon-primary)",
                                transition: "all 0.2s",
                                flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                                if (!adding && quantiteInCart === 0) {
                                    (e.currentTarget as HTMLButtonElement).style.background = "var(--gradient-btn)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "#0c0a09";
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (quantiteInCart === 0) {
                                    (e.currentTarget as HTMLButtonElement).style.background = "var(--icon-bg)";
                                    (e.currentTarget as HTMLButtonElement).style.color = "var(--icon-primary)";
                                }
                            }}
                        >
                            {adding ? (
                                <div style={{
                                    width: 12, height: 12, borderRadius: "50%",
                                    border: "2px solid currentColor",
                                    borderTopColor: "transparent",
                                    animation: "spin 0.6s linear infinite",
                                }} />
                            ) : quantiteInCart > 0 ? (
                                <Check size={14} />
                            ) : (
                                <Plus size={14} />
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}