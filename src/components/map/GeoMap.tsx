"use client";
// src/components/map/GeoMap.tsx
// Carte d'affichage : marqueurs restaurants + position client.
// Options : style (Plan / Satellite / Monde), 3D, ma position, itinéraire.

import { useEffect, useRef, useState } from "react";
import type { Map as MbMap, Marker as MbMarker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "@/contexts/ThemeContext";
import {
    MAPBOX_TOKEN, mapboxAvailable, CONAKRY, styleFor, type MapStyleMode,
} from "@/lib/mapbox";
import { apply3D, addContinents, removeContinents, drawRoute, clearRoute, type RouteInfo } from "@/lib/mapFeatures";
import MapControls from "./MapControls";
import { MapPin, X } from "lucide-react";

export interface GeoPoint {
    id: string | number;
    lat: number;
    lng: number;
    title: string;
    subtitle?: string;
    href?: string;
}

interface GeoMapProps {
    points: GeoPoint[];
    userLocation?: { lat: number; lng: number } | null;
    height?: number | string;
    activeId?: string | number | null;
}

function esc(s: string): string {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Mb = any;

export default function GeoMap({ points, userLocation, height = 360, activeId }: GeoMapProps) {
    const { isDark } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MbMap | null>(null);
    const mbRef = useRef<Mb>(null);
    const markersRef = useRef<MbMarker[]>([]);
    const [ready, setReady] = useState(false);

    const [styleMode, setStyleMode] = useState<MapStyleMode>("plan");
    const [is3D, setIs3D] = useState(false);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

    // refs miroir pour les callbacks (closures stables)
    const styleModeRef = useRef(styleMode); styleModeRef.current = styleMode;
    const is3DRef = useRef(is3D); is3DRef.current = is3D;
    const userLocRef = useRef(userLocation); userLocRef.current = userLocation;
    const routeTargetRef = useRef<[number, number] | null>(null);

    // Réapplique les éléments liés au style après un setStyle()
    const applyStyleExtras = (mode: MapStyleMode) => {
        const map = mapRef.current;
        if (!map) return;
        // Continents colorés en mode Plan uniquement (visibles seulement dézoomé) ;
        // jamais en satellite.
        if (mode === "plan") addContinents(map); else removeContinents(map);
        apply3D(map, is3DRef.current);
        if (routeTargetRef.current && userLocRef.current) {
            const u = userLocRef.current;
            drawRoute(map, [u.lng, u.lat], routeTargetRef.current).then(setRouteInfo);
        }
    };

    // Résout l'origine (position du client) au moment du clic « Itinéraire »
    const resolveOrigin = (): Promise<[number, number] | null> => {
        if (userLocRef.current) return Promise.resolve([userLocRef.current.lng, userLocRef.current.lat]);
        return new Promise((res) => {
            if (typeof navigator === "undefined" || !navigator.geolocation) return res(null);
            navigator.geolocation.getCurrentPosition(
                (p) => res([p.coords.longitude, p.coords.latitude]),
                () => res(null),
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    };

    // Init (chargement dynamique de mapbox-gl)
    useEffect(() => {
        let cancelled = false;
        if (!mapboxAvailable() || !containerRef.current || mapRef.current) return;
        import("mapbox-gl").then((mod) => {
            const mapboxgl = mod.default;
            if (cancelled || !containerRef.current) return;
            mbRef.current = mapboxgl;
            mapboxgl.accessToken = MAPBOX_TOKEN;
            const map = new mapboxgl.Map({
                container: containerRef.current,
                style: styleFor("plan", isDark),
                center: CONAKRY,
                zoom: 11,
                attributionControl: false,
            });
            mapRef.current = map;
            map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
            map.addControl(new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true, showUserHeading: true,
            }), "top-right");
            map.on("load", () => {
                if (cancelled) return;
                applyStyleExtras("plan");
                setReady(true);
            });

            // Délégation des clics « Itinéraire » dans les popups
            const onClick = (e: MouseEvent) => {
                const el = (e.target as HTMLElement)?.closest?.("[data-route]") as HTMLElement | null;
                if (!el) return;
                e.preventDefault();
                const [ln, la] = (el.getAttribute("data-route") || "").split(",").map(Number);
                if (!Number.isFinite(ln) || !Number.isFinite(la)) return;
                resolveOrigin().then((origin) => {
                    if (!origin) { window.alert("Activez votre position pour calculer un itinéraire."); return; }
                    routeTargetRef.current = [ln, la];
                    drawRoute(map, origin, [ln, la]).then(setRouteInfo);
                });
            };
            containerRef.current.addEventListener("click", onClick);
            (map as any).__rpOnClick = onClick;
        });
        return () => {
            cancelled = true;
            const c = containerRef.current; const m = mapRef.current as any;
            if (c && m?.__rpOnClick) c.removeEventListener("click", m.__rpOnClick);
            mapRef.current?.remove();
            mapRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // (Re)dessine les marqueurs
    useEffect(() => {
        const map = mapRef.current, mapboxgl = mbRef.current;
        if (!map || !mapboxgl || !ready) return;

        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];

        const bounds = new mapboxgl.LngLatBounds();
        let count = 0;

        points.forEach((p) => {
            const routeBtn = `<button data-route="${p.lng},${p.lat}" style="margin-top:6px;display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:none;border-radius:6px;background:#3b82f6;color:#fff;font-size:12px;font-weight:700;cursor:pointer">Itinéraire</button>`;
            const popup = new mapboxgl.Popup({ offset: 24, closeButton: false }).setHTML(
                `<div style="font-family:system-ui;min-width:150px">
                    <div style="font-weight:700;font-size:13px;color:#111">${esc(p.title)}</div>
                    ${p.subtitle ? `<div style="font-size:11px;color:#666;margin-top:2px">${esc(p.subtitle)}</div>` : ""}
                    <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
                      ${p.href ? `<a href="${esc(p.href)}" style="display:inline-block;margin-top:6px;font-size:12px;font-weight:700;color:#d97706;text-decoration:none">Voir le menu →</a>` : ""}
                      ${routeBtn}
                    </div>
                 </div>`
            );
            const marker = new mapboxgl.Marker({ color: "#f59e0b" })
                .setLngLat([p.lng, p.lat]).setPopup(popup).addTo(map);
            markersRef.current.push(marker);
            bounds.extend([p.lng, p.lat]);
            count++;
        });

        if (userLocation) {
            const el = document.createElement("div");
            el.style.cssText = "width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 2px rgba(59,130,246,0.4)";
            const marker = new mapboxgl.Marker({ element: el })
                .setLngLat([userLocation.lng, userLocation.lat])
                .setPopup(new mapboxgl.Popup({ offset: 16, closeButton: false }).setHTML('<div style="font-family:system-ui;font-size:12px;font-weight:700;color:#111">Vous êtes ici</div>'))
                .addTo(map);
            markersRef.current.push(marker);
            bounds.extend([userLocation.lng, userLocation.lat]);
            count++;
        }

        if (count > 1) map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 0 });
        else if (count === 1) { map.setCenter(bounds.getCenter()); map.setZoom(14); }
    }, [points, userLocation, ready]);

    // Centre sur le point actif
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready || activeId == null) return;
        const p = points.find((x) => x.id === activeId);
        if (p) map.flyTo({ center: [p.lng, p.lat], zoom: 15 });
    }, [activeId, points, ready]);

    // Thème → met à jour le style courant (plan/monde sont theme-aware)
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ready) return;
        map.setStyle(styleFor(styleModeRef.current, isDark));
        map.once("style.load", () => applyStyleExtras(styleModeRef.current));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDark, ready]);

    const handleStyleChange = (mode: MapStyleMode) => {
        const map = mapRef.current;
        if (!map || mode === styleMode) return;
        setStyleMode(mode);
        map.setStyle(styleFor(mode, isDark));
        map.once("style.load", () => applyStyleExtras(mode));
    };

    const handleToggle3D = () => {
        const map = mapRef.current;
        if (!map) return;
        const next = !is3D;
        setIs3D(next);
        apply3D(map, next);
    };

    const handleClearRoute = () => {
        const map = mapRef.current;
        if (!map) return;
        routeTargetRef.current = null;
        clearRoute(map);
        setRouteInfo(null);
    };

    if (!mapboxAvailable()) {
        return (
            <div style={{ height, borderRadius: "0.9rem", border: "1px dashed var(--border-subtle)", background: "var(--bg-section-alt)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem", padding: "1rem" }}>
                <div>
                    <MapPin size={22} style={{ opacity: 0.5, marginBottom: 6 }} />
                    <p style={{ margin: 0 }}>Carte indisponible — token Mapbox manquant.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: "relative", height, borderRadius: "0.9rem", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
            <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
            <MapControls styleMode={styleMode} onStyleChange={handleStyleChange} is3D={is3D} onToggle3D={handleToggle3D} />
            {routeInfo && (
                <div style={{ position: "absolute", bottom: 10, left: 10, zIndex: 2, display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, background: "rgba(255,255,255,0.96)", boxShadow: "0 2px 10px rgba(0,0,0,0.25)", fontSize: 13, color: "#1f2937", fontWeight: 700 }}>
                    <span>🚗 {(routeInfo.distance / 1000).toFixed(1)} km · {Math.round(routeInfo.duration / 60)} min</span>
                    <button onClick={handleClearRoute} style={{ display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#6b7280" }} title="Effacer l'itinéraire"><X size={15} /></button>
                </div>
            )}
        </div>
    );
}
