"use client";
// src/app/client/plats/page.tsx — Tous les plats de tous les restaurants (Rclient)

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Search, Utensils, MapPin, AlertCircle, Store, LocateFixed } from "lucide-react";
import { listTousPlats, type PlatGlobal } from "@/lib/api/public";
import { useGeolocation } from "@/hooks/useGeolocation";
import { parseCoord, distanceMetres, formatDistance } from "@/lib/mapbox";

type SortBy = "pertinence" | "prix_asc" | "prix_desc" | "distance";

const CATEGORIES: { value: string; label: string }[] = [
    { value: "", label: "Toutes" },
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

export default function TousLesPlatsPage() {
    const [plats, setPlats] = useState<PlatGlobal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [categorie, setCategorie] = useState("");
    const [sortBy, setSortBy] = useState<SortBy>("pertinence");
    const [maxPrix, setMaxPrix] = useState("");
    const { location, status, request } = useGeolocation();

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await listTousPlats();
            if (res.success && res.data) setPlats(res.data.plats);
            else setError("Impossible de charger les plats.");
        } catch {
            setError("Serveur indisponible. Réessayez.");
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const platDist = useCallback((p: PlatGlobal): number | null => {
        const la = parseCoord(p.restaurant.latitude), ln = parseCoord(p.restaurant.longitude);
        if (la == null || ln == null || !location) return null;
        return distanceMetres(location.lat, location.lng, la, ln);
    }, [location]);

    const filtered = useMemo(() => {
        const maxP = maxPrix.trim() ? parseFloat(maxPrix.trim()) : null;
        const base = plats.filter((p) => {
            if (categorie && p.categorie !== categorie) return false;
            if (maxP != null && Number(p.prix_unitaire) > maxP) return false;
            if (search) {
                const q = search.toLowerCase();
                if (!p.nom.toLowerCase().includes(q)
                    && !(p.description ?? "").toLowerCase().includes(q)
                    && !p.restaurant.nom.toLowerCase().includes(q)) return false;
            }
            return true;
        });

        if (sortBy === "prix_asc") base.sort((a, b) => Number(a.prix_unitaire) - Number(b.prix_unitaire));
        else if (sortBy === "prix_desc") base.sort((a, b) => Number(b.prix_unitaire) - Number(a.prix_unitaire));
        else if (sortBy === "distance" && location) {
            base.sort((a, b) => {
                const da = platDist(a), db = platDist(b);
                if (da == null) return 1;
                if (db == null) return -1;
                return da - db;
            });
        }
        return base;
    }, [plats, categorie, search, maxPrix, sortBy, location, platDist]);

    const handleSort = (v: SortBy) => {
        setSortBy(v);
        if (v === "distance" && !location) request();
    };

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(1rem, 4vw, 2rem)" }}>
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ margin: "0 0 0.25rem", fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 900, color: "var(--text-primary)" }}>Tous les plats</h1>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>Explorez les plats de tous les restaurants. Cliquez sur un plat pour aller au restaurant.</p>
            </div>

            {/* Recherche + catégories */}
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem", alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
                    <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un plat ou un restaurant…"
                        style={{ width: "100%", padding: "0.65rem 0.85rem 0.65rem 2.2rem", borderRadius: "0.75rem", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }} />
                </div>
                {CATEGORIES.map((c) => (
                    <button key={c.value} onClick={() => setCategorie(c.value)}
                        style={{ padding: "0.5rem 0.9rem", borderRadius: "99px", cursor: "pointer", border: `1px solid ${categorie === c.value ? "#f59e0b" : "var(--border-subtle)"}`, background: categorie === c.value ? "rgba(245,158,11,0.12)" : "transparent", color: categorie === c.value ? "#f59e0b" : "var(--text-muted)", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Tri + filtre prix + distance */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.25rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Trier&nbsp;:
                    <select value={sortBy} onChange={(e) => handleSort(e.target.value as SortBy)}
                        style={{ padding: "0.5rem 0.7rem", borderRadius: "0.65rem", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.82rem", cursor: "pointer" }}>
                        <option value="pertinence">Pertinence</option>
                        <option value="prix_asc">Prix croissant</option>
                        <option value="prix_desc">Prix décroissant</option>
                        <option value="distance">Distance</option>
                    </select>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    Prix max&nbsp;:
                    <input type="number" min={0} step={1000} value={maxPrix} onChange={(e) => setMaxPrix(e.target.value)} placeholder="GNF"
                        style={{ width: 110, padding: "0.5rem 0.7rem", borderRadius: "0.65rem", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.82rem", boxSizing: "border-box" }} />
                </label>

                <button onClick={request} disabled={status === "loading"}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.85rem", borderRadius: "0.65rem", border: `1px solid ${location ? "rgba(59,130,246,0.4)" : "var(--border-subtle)"}`, background: location ? "rgba(59,130,246,0.08)" : "var(--bg-card)", color: location ? "#3b82f6" : "var(--text-primary)", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer" }}>
                    <LocateFixed size={13} />{status === "loading" ? "Localisation…" : location ? "Position active" : "Activer ma position"}
                </button>
            </div>

            {sortBy === "distance" && !location && status !== "loading" && (
                <p style={{ margin: "-0.5rem 0 1rem", fontSize: "0.76rem", color: "#ef4444" }}>
                    {status === "denied" ? "Localisation refusée — le tri par distance est indisponible." : "Activez votre position pour trier par distance."}
                </p>
            )}

            {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", color: "var(--text-muted)", gap: "0.75rem" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid var(--border-subtle)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                    Chargement…
                    <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
                </div>
            ) : error ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "3rem", color: "var(--text-muted)" }}>
                    <AlertCircle size={30} style={{ opacity: 0.4 }} />
                    <p style={{ margin: 0 }}>{error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Aucun plat trouvé.</div>
            ) : (
                <>
                    <p style={{ margin: "0 0 1rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>{filtered.length} plat{filtered.length > 1 ? "s" : ""}</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "1.1rem" }}>
                        {filtered.map((p) => {
                            const color = CATEGORIE_COLOR[p.categorie] ?? "#f59e0b";
                            return (
                                <Link key={`${p.restaurant.slug}-${p.id}`} href={`/restaurant/${p.restaurant.slug}`} style={{ textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "1rem", overflow: "hidden", display: "flex", flexDirection: "column", transition: "transform .15s, box-shadow .15s" }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.22)"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "none"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}>
                                    {/* Image */}
                                    <div style={{ height: 150, background: "var(--bg-section-alt)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {p.image_url ? (
                                            <img src={p.image_url} alt={p.nom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                        ) : (
                                            <Utensils size={34} style={{ opacity: 0.2, color: "var(--text-muted)" }} />
                                        )}
                                        <span style={{ position: "absolute", top: "0.5rem", left: "0.5rem", padding: "2px 8px", borderRadius: "99px", background: `${color}22`, border: `1px solid ${color}44`, color, fontSize: "0.68rem", fontWeight: 700 }}>
                                            {CATEGORIES.find((c) => c.value === p.categorie)?.label ?? p.categorie}
                                        </span>
                                    </div>
                                    {/* Infos */}
                                    <div style={{ padding: "0.875rem", flex: 1, display: "flex", flexDirection: "column" }}>
                                        <h3 style={{ margin: "0 0 0.2rem", fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>{p.nom}</h3>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.74rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                                            <Store size={11} style={{ flexShrink: 0 }} />
                                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.restaurant.nom}</span>
                                            {(() => { const d = platDist(p); return d != null ? <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "0.15rem", color: "#3b82f6", fontWeight: 700 }}><LocateFixed size={10} />{formatDistance(d)}</span> : null; })()}
                                        </div>
                                        {p.description && <p style={{ margin: "0 0 0.6rem", fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>}
                                        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span style={{ fontWeight: 800, fontSize: "1rem", color: "#f59e0b" }}>{Number(p.prix_unitaire).toLocaleString("fr-FR")} GNF</span>
                                            {p.restaurant.adresse && (
                                                <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
                                                    <MapPin size={10} />
                                                    <span style={{ maxWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.restaurant.adresse}</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
