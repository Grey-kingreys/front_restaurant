"use client";
// src/components/menu/PlatCard.tsx

import Link from "next/link";
import type { Plat } from "@/lib/api/menu";
import { CATEGORIES } from "@/hooks/useMenu";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "http://localhost:8000";

function formatPrix(prix: string) {
    return Number(prix).toLocaleString("fr-FR").replace(/\s/g, " ") + " GNF";
}

function getCatInfo(cat: string) {
    return CATEGORIES.find((c) => c.value === cat) ?? { emoji: "🍽️", label: cat };
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
    const imgSrc = plat.image
        ? plat.image.startsWith("http")
            ? plat.image
            : `${API_BASE}${plat.image}`
        : null;

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
                    <img
                        src={imgSrc}
                        alt={plat.nom}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "3rem",
                    }}>
                        {cat.emoji}
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
                        {cat.emoji} {cat.label}
                    </span>
                    {plat.necessite_validation_cuisine && (
                        <span style={{
                            padding: "0.2rem 0.5rem", borderRadius: "9999px",
                            fontSize: "0.65rem", fontWeight: 700,
                            background: "rgba(249,115,22,0.85)", color: "#fff",
                        }}>
                            👨‍🍳 Cuisine
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
                            flex: 1, padding: "0.6rem",
                            textAlign: "center", fontSize: "0.75rem", fontWeight: 600,
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
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 13, height: 13 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" />
                        </svg>
                        Modifier
                    </Link>

                    <button
                        onClick={() => onToggle(plat.id)}
                        disabled={toggling}
                        style={{
                            flex: 1, padding: "0.6rem",
                            fontSize: "0.75rem", fontWeight: 600,
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 13, height: 13 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                                Désactiver
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 13, height: 13 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                </svg>
                                Activer
                            </>
                        )}
                    </button>

                    {onDelete && (
                        <button
                            onClick={() => onDelete(plat.id)}
                            style={{
                                flex: 0, padding: "0.6rem 0.75rem",
                                fontSize: "0.75rem", fontWeight: 600,
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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
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
    const imgSrc = plat.image
        ? plat.image.startsWith("http")
            ? plat.image
            : `${API_BASE}${plat.image}`
        : null;

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
                    <img
                        src={imgSrc}
                        alt={plat.nom}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <div style={{
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "2.5rem",
                    }}>
                        {cat.emoji}
                    </div>
                )}

                {/* Catégorie */}
                <span style={{
                    position: "absolute", bottom: "0.4rem", left: "0.4rem",
                    padding: "0.15rem 0.45rem", borderRadius: "9999px",
                    fontSize: "0.65rem", fontWeight: 700,
                    background: "rgba(0,0,0,0.6)", color: "#fff",
                    backdropFilter: "blur(4px)",
                }}>
                    {cat.emoji} {cat.label}
                </span>

                {/* Badge quantité dans panier */}
                {quantiteInCart > 0 && (
                    <div style={{
                        position: "absolute", top: "0.4rem", right: "0.4rem",
                        width: 22, height: 22, borderRadius: "50%",
                        background: "var(--gradient-btn)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.7rem", fontWeight: 800, color: "#0c0a09",
                    }}>
                        {quantiteInCart}
                    </div>
                )}
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
                                width: 30, height: 30,
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
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 14, height: 14 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}