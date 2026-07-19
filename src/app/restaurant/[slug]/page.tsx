"use client";
// src/app/restaurant/[slug]/page.tsx
// Vitrine publique : menu + sélecteur mode + tiroir panier

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ShoppingCart, Search, Utensils, AlertCircle, MapPin } from "lucide-react";
import { getRestaurantPublic, type RestaurantPublic, type PlatPublic } from "@/lib/api/public";
import { useCart } from "@/contexts/CartContext";

const CATEGORIES: { value: string; label: string }[] = [
    { value: "", label: "Tous" },
    { value: "PLAT", label: "Plats" },
    { value: "ENTREE", label: "Entrées" },
    { value: "DESSERT", label: "Desserts" },
    { value: "BOISSON", label: "Boissons" },
    { value: "ACCOMPAGNEMENT", label: "Accompagnements" },
];

const CATEGORIE_COLOR: Record<string, string> = {
    PLAT: "#f59e0b", ENTREE: "#22c55e", DESSERT: "#ec4899",
    BOISSON: "#3b82f6", ACCOMPAGNEMENT: "#8b5cf6",
};

export default function RestaurantPublicPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string ?? "";

    const [resto, setResto] = useState<RestaurantPublic | null>(null);
    const [plats, setPlats] = useState<PlatPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categorie, setCategorie] = useState("");
    const [search, setSearch] = useState("");
    const [cartOpen, setCartOpen] = useState(false);

    const { items, count, total, addItem, removeItem, updateQuantite } = useCart();

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await getRestaurantPublic(slug);
            if (res.success && res.data) {
                setResto(res.data.restaurant);
                setPlats(res.data.plats);
            } else {
                setError("Restaurant introuvable.");
            }
        } catch {
            setError("Restaurant introuvable ou serveur indisponible.");
        }
        setLoading(false);
    }, [slug]);

    useEffect(() => { load(); }, [load]);

    const platsFiltrés = plats.filter((p) => {
        if (categorie && p.categorie !== categorie) return false;
        if (search && !p.nom.toLowerCase().includes(search.toLowerCase()) && !p.description?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleCommander = () => {
        if (count === 0) return;
        // Le type de commande (livraison / emporter) se choisit au panier
        router.push(`/restaurant/${slug}/checkout`);
    };

    if (loading) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--text-muted)", gap: "0.75rem" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid rgba(245,158,11,0.2)", borderTopColor: "#f59e0b", animation: "spin .75s linear infinite" }} />
            Chargement du menu…
            <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
        </div>
    );

    if (error || !resto) return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", flexDirection: "column", gap: "0.75rem" }}>
            <AlertCircle size={32} style={{ color: "var(--text-muted)" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "1rem", margin: 0 }}>{error || "Restaurant introuvable."}</p>
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes spin { to { transform:rotate(360deg); } }
                @keyframes slideIn { from { transform:translateX(100%); } to { transform:translateX(0); } }
                @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
                .plat-card { transition:transform .15s, box-shadow .15s; cursor:pointer; }
                .plat-card:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
                .cat-pill { transition:all .15s; cursor:pointer; }
                .add-btn { transition:all .15s; }
                .add-btn:hover { transform:scale(1.08); }
            `}</style>

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "1.5rem 1rem 6rem" }}>

                {/* Hero restaurant */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h1 style={{ margin: "0 0 0.25rem", fontSize: "clamp(1.5rem,4vw,2rem)", fontWeight: 900, color: "var(--text-primary)" }}>{resto.nom}</h1>
                    {resto.adresse && <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}><MapPin size={12} />{resto.adresse}</p>}
                </div>


                {/* Filtres */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem", alignItems: "center" }}>
                    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
                        <Search size={14} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                        <input
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un plat…"
                            style={{ width: "100%", padding: "0.55rem 0.75rem 0.55rem 2rem", borderRadius: "0.65rem", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.85rem", boxSizing: "border-box", outline: "none" }}
                        />
                    </div>
                    {CATEGORIES.map((c) => (
                        <button key={c.value} onClick={() => setCategorie(c.value)} className="cat-pill"
                            style={{ padding: "0.45rem 0.875rem", borderRadius: "99px", border: `1px solid ${categorie === c.value ? "#f59e0b" : "var(--border-subtle)"}`, background: categorie === c.value ? "rgba(245,158,11,0.12)" : "transparent", color: categorie === c.value ? "#f59e0b" : "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* Grille plats */}
                {platsFiltrés.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Aucun plat trouvé.</div>
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "1rem" }}>
                        {platsFiltrés.map((plat) => {
                            const inCart = items.find((i) => i.platId === plat.id);
                            const color = CATEGORIE_COLOR[plat.categorie] ?? "#f59e0b";
                            return (
                                <div key={plat.id} className="plat-card" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "1rem", overflow: "hidden" }}>
                                    {/* Image */}
                                    <div style={{ height: 160, background: "var(--bg-section-alt)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {plat.image_url ? (
                                            <img src={plat.image_url} alt={plat.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <Utensils size={36} style={{ opacity: 0.12, color: "var(--text-muted)" }} />
                                        )}
                                        <span style={{ position: "absolute", top: "0.5rem", left: "0.5rem", padding: "2px 8px", borderRadius: "99px", background: `${color}22`, border: `1px solid ${color}44`, color, fontSize: "0.7rem", fontWeight: 700 }}>
                                            {CATEGORIES.find(c => c.value === plat.categorie)?.label ?? plat.categorie}
                                        </span>
                                    </div>

                                    {/* Infos */}
                                    <div style={{ padding: "0.875rem" }}>
                                        <h3 style={{ margin: "0 0 0.25rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{plat.nom}</h3>
                                        {plat.description && <p style={{ margin: "0 0 0.75rem", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{plat.description}</p>}

                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#f59e0b" }}>{Number(plat.prix_unitaire).toLocaleString("fr-FR")} GNF</span>

                                            {inCart ? (
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                                    <button onClick={() => updateQuantite(plat.id, inCart.quantite - 1)} className="add-btn" style={{ width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(245,158,11,0.4)", background: "rgba(245,158,11,0.08)", color: "#f59e0b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        {inCart.quantite === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                                                    </button>
                                                    <span style={{ fontWeight: 700, color: "var(--text-primary)", minWidth: 20, textAlign: "center" }}>{inCart.quantite}</span>
                                                    <button onClick={() => updateQuantite(plat.id, inCart.quantite + 1)} className="add-btn" style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "#f59e0b", color: "#0c0a09", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => addItem({ platId: plat.id, nom: plat.nom, prix_unitaire: Number(plat.prix_unitaire), image_url: plat.image_url })} className="add-btn"
                                                    style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "#f59e0b", color: "#0c0a09", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                                                    <Plus size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Barre panier fixe en bas */}
            {count > 0 && (
                <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "0.875rem 1rem", background: "var(--bg-card)", borderTop: "1px solid rgba(245,158,11,0.2)", backdropFilter: "blur(12px)", zIndex: 50 }}>
                    <button onClick={handleCommander} style={{ width: "100%", maxWidth: 500, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.875rem 1.25rem", borderRadius: "0.875rem", border: "none", background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#0c0a09", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer" }}>
                        <span style={{ background: "rgba(0,0,0,0.15)", borderRadius: "0.4rem", padding: "0.2rem 0.6rem" }}>{count}</span>
                        <span>Passer la commande</span>
                        <span>{total.toLocaleString("fr-FR")} GNF</span>
                    </button>
                </div>
            )}
        </>
    );
}
