"use client";
// src/app/client/restaurants/page.tsx — Parcourir les restaurants (Rclient)

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Search, Truck, ShoppingBag, ChefHat, MapPin, AlertCircle, Map as MapIcon, List, LocateFixed } from "lucide-react";
import { listRestaurantsPublics, type RestaurantPublic } from "@/lib/api/public";
import GeoMap, { type GeoPoint } from "@/components/map/GeoMap";
import { useGeolocation } from "@/hooks/useGeolocation";
import { parseCoord, distanceMetres, formatDistance } from "@/lib/mapbox";

export default function ClientRestaurantsPage() {
    const [restos, setRestos] = useState<RestaurantPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [view, setView] = useState<"list" | "map">("list");
    const { location, status, request } = useGeolocation();

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const res = await listRestaurantsPublics();
            if (res.success && res.data) setRestos(res.data.restaurants);
            else setError("Impossible de charger les restaurants.");
        } catch {
            setError("Serveur indisponible. Réessayez.");
        }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = useMemo(() => {
        const base = restos.filter((r) =>
            !search || r.nom.toLowerCase().includes(search.toLowerCase()) || (r.adresse ?? "").toLowerCase().includes(search.toLowerCase())
        );
        if (!location) return base;
        // Tri par distance si la position du client est connue
        return [...base].sort((a, b) => {
            const da = dist(a), db = dist(b);
            if (da == null) return 1;
            if (db == null) return -1;
            return da - db;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [restos, search, location]);

    function dist(r: RestaurantPublic): number | null {
        const la = parseCoord(r.latitude), ln = parseCoord(r.longitude);
        if (la == null || ln == null || !location) return null;
        return distanceMetres(location.lat, location.lng, la, ln);
    }

    const points: GeoPoint[] = filtered
        .map((r): GeoPoint | null => {
            const la = parseCoord(r.latitude), ln = parseCoord(r.longitude);
            if (la == null || ln == null) return null;
            return { id: r.id, lat: la, lng: ln, title: r.nom, subtitle: r.adresse ?? undefined, href: `/restaurant/${r.slug}` };
        })
        .filter((p): p is GeoPoint => p !== null);

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "clamp(1rem, 4vw, 2rem)" }}>
            <div style={{ marginBottom: "1.5rem" }}>
                <h1 style={{ margin: "0 0 0.25rem", fontSize: "clamp(1.4rem,4vw,1.9rem)", fontWeight: 900, color: "var(--text-primary)" }}>Les restaurants</h1>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-muted)" }}>Choisissez un restaurant pour découvrir son menu.</p>
            </div>

            {/* Barre d'outils : recherche + près de moi + bascule vue */}
            <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.5rem" }}>
                <div style={{ position: "relative", flex: 1, minWidth: 220, maxWidth: 420 }}>
                    <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un restaurant…"
                        style={{ width: "100%", padding: "0.65rem 0.85rem 0.65rem 2.2rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "var(--text-primary)", fontSize: "0.9rem", boxSizing: "border-box", outline: "none" }} />
                </div>

                <button onClick={request} disabled={status === "loading"}
                    style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 0.9rem", borderRadius: "var(--radius-lg)", border: `1px solid ${location ? "rgba(59,130,246,0.4)" : "var(--border-subtle)"}`, background: location ? "rgba(59,130,246,0.08)" : "var(--bg-card)", color: location ? "#3b82f6" : "var(--text-primary)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
                    <LocateFixed size={14} />{status === "loading" ? "Localisation…" : location ? "Trié par distance" : "Près de moi"}
                </button>

                <div style={{ display: "flex", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
                    {(["list", "map"] as const).map((v) => (
                        <button key={v} onClick={() => setView(v)}
                            style={{ display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.6rem 0.85rem", border: "none", background: view === v ? "var(--bg-section-alt)" : "var(--bg-card)", color: view === v ? "#f59e0b" : "var(--text-muted)", fontSize: "0.82rem", fontWeight: 700, cursor: "pointer" }}>
                            {v === "list" ? <List size={14} /> : <MapIcon size={14} />}{v === "list" ? "Liste" : "Carte"}
                        </button>
                    ))}
                </div>
            </div>

            {status === "denied" && (
                <p style={{ margin: "-0.75rem 0 1rem", fontSize: "0.76rem", color: "#ef4444" }}>Localisation refusée — activez-la pour trier par distance.</p>
            )}

            {loading ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "40vh", color: "var(--text-muted)", gap: "0.75rem" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", border: "3px solid var(--border-amber)", borderTopColor: "var(--amber-glow)", animation: "spin .75s linear infinite" }} />
                    Chargement…
                    <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
                </div>
            ) : error ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", padding: "3rem", color: "var(--text-muted)" }}>
                    <AlertCircle size={30} style={{ opacity: 0.4 }} />
                    <p style={{ margin: 0 }}>{error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Aucun restaurant trouvé.</div>
            ) : view === "map" ? (
                points.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>Aucun restaurant géolocalisé pour le moment.</div>
                ) : (
                    <GeoMap points={points} userLocation={location} height={520} />
                )
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1.25rem" }}>
                    {filtered.map((r) => {
                        const d = dist(r);
                        return (
                        <Link key={r.id} href={`/restaurant/${r.slug}`} style={{ textDecoration: "none", background: "var(--bg-card)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-xl)", overflow: "hidden", transition: "transform .15s, box-shadow .15s" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.25)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "none"; (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}>
                            <div style={{ height: 110, background: "var(--bg-section-alt)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <ChefHat size={36} style={{ color: "#f59e0b", opacity: 0.7 }} />
                            </div>
                            <div style={{ padding: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                                    <h3 style={{ margin: "0 0 0.3rem", fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>{r.nom}</h3>
                                    {d != null && <span style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "0.2rem", fontSize: "0.72rem", fontWeight: 700, color: "#3b82f6" }}><LocateFixed size={11} />{formatDistance(d)}</span>}
                                </div>
                                {r.adresse && <p style={{ margin: "0 0 0.75rem", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.78rem", color: "var(--text-muted)" }}><MapPin size={12} />{r.adresse}</p>}
                                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                    {r.accept_livraison && <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "3px 9px", borderRadius: "var(--radius-full)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", color: "#8b5cf6", fontSize: "0.7rem", fontWeight: 700 }}><Truck size={11} />Livraison</span>}
                                    {r.accept_emporter && <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", padding: "3px 9px", borderRadius: "var(--radius-full)", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", color: "#f59e0b", fontSize: "0.7rem", fontWeight: 700 }}><ShoppingBag size={11} />À emporter</span>}
                                </div>
                            </div>
                        </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
