"use client";
// src/components/map/MapPicker.tsx
// Carte interactive pour choisir une position (marqueur déplaçable).
// Options : style (Plan / Satellite / Monde), 3D, géolocalisation.

import { useEffect, useRef, useState } from "react";
import type { Map as MbMap, Marker as MbMarker, GeoJSONSource, LngLat } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useTheme } from "@/contexts/ThemeContext";
import {
    MAPBOX_TOKEN, mapboxAvailable, CONAKRY, circlePolygon, styleFor, type MapStyleMode,
} from "@/lib/mapbox";
import { apply3D, addContinents, removeContinents } from "@/lib/mapFeatures";
import MapControls from "./MapControls";
import { MapPin, LocateFixed } from "lucide-react";

interface MapPickerProps {
    lat: number | null;
    lng: number | null;
    onChange: (lat: number, lng: number) => void;
    radiusMetres?: number;
    height?: number | string;
    /** Légende sous la carte (par défaut : contexte restaurant). */
    caption?: string;
    /** Affiche un bouton « Me localiser » qui pose le marqueur sur la position GPS et remonte les coordonnées. */
    showLocateButton?: boolean;
}

const CIRCLE_SRC = "rp-radius";

export default function MapPicker({ lat, lng, onChange, radiusMetres, height = 320, caption, showLocateButton = false }: MapPickerProps) {
    const { isDark } = useTheme();
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<MbMap | null>(null);
    const markerRef = useRef<MbMarker | null>(null);

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const radiusRef = useRef(radiusMetres);
    radiusRef.current = radiusMetres;

    const [styleMode, setStyleMode] = useState<MapStyleMode>("plan");
    const [is3D, setIs3D] = useState(false);
    const [locating, setLocating] = useState(false);
    const [locateError, setLocateError] = useState<string | null>(null);
    const styleModeRef = useRef(styleMode); styleModeRef.current = styleMode;
    const is3DRef = useRef(is3D); is3DRef.current = is3D;

    // « Me localiser » : récupère la position GPS, pose le marqueur, centre la carte
    // et remonte les coordonnées (contrairement au contrôle Mapbox qui ne fait que centrer).
    const locateMe = () => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setLocateError("La géolocalisation n'est pas disponible sur cet appareil.");
            return;
        }
        setLocating(true);
        setLocateError(null);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const la = Number(pos.coords.latitude.toFixed(6));
                const ln = Number(pos.coords.longitude.toFixed(6));
                const map = mapRef.current, marker = markerRef.current;
                if (map && marker) {
                    marker.setLngLat([ln, la]).addTo(map);
                    map.flyTo({ center: [ln, la], zoom: 16 });
                }
                onChangeRef.current(la, ln);
                drawRadius.current();
                setLocating(false);
            },
            () => {
                setLocating(false);
                setLocateError("Localisation impossible. Autorisez l'accès à votre position.");
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    };

    // Dessine / met à jour le cercle de rayon
    const drawRadius = useRef(() => {
        const map = mapRef.current, marker = markerRef.current;
        if (!map || !marker || !radiusRef.current) return;
        const pos = marker.getLngLat();
        if (!pos) return; // Marker n'a pas de position encore
        const data = circlePolygon([pos.lng, pos.lat], radiusRef.current);
        const src = map.getSource(CIRCLE_SRC) as GeoJSONSource | undefined;
        if (src) { src.setData(data); return; }
        if (!map.isStyleLoaded()) return;
        map.addSource(CIRCLE_SRC, { type: "geojson", data });
        map.addLayer({ id: `${CIRCLE_SRC}-fill`, type: "fill", source: CIRCLE_SRC, paint: { "fill-color": "#f59e0b", "fill-opacity": 0.12 } });
        map.addLayer({ id: `${CIRCLE_SRC}-line`, type: "line", source: CIRCLE_SRC, paint: { "line-color": "#f59e0b", "line-width": 1.5 } });
    });

    const applyStyleExtras = (mode: MapStyleMode) => {
        const map = mapRef.current;
        if (!map) return;
        // Continents colorés en mode Plan uniquement (visibles seulement dézoomé).
        if (mode === "plan") addContinents(map); else removeContinents(map);
        apply3D(map, is3DRef.current);
        drawRadius.current();
    };

    // Init (chargement dynamique de mapbox-gl)
    useEffect(() => {
        let cancelled = false;
        if (!mapboxAvailable() || !containerRef.current || mapRef.current) return;
        const startLat = lat, startLng = lng;
        import("mapbox-gl").then((mod) => {
            const mapboxgl = mod.default;
            if (cancelled || !containerRef.current) return;
            mapboxgl.accessToken = MAPBOX_TOKEN;
            const hasPos = startLng != null && startLat != null;
            const map = new mapboxgl.Map({
                container: containerRef.current,
                style: styleFor("plan", isDark),
                center: hasPos ? [startLng!, startLat!] : CONAKRY,
                zoom: hasPos ? 15 : 12,
                attributionControl: false,
            });
            mapRef.current = map;
            map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");
            map.addControl(new mapboxgl.GeolocateControl({
                positionOptions: { enableHighAccuracy: true }, trackUserLocation: false,
            }), "top-right");

            const marker = new mapboxgl.Marker({ color: "#f59e0b", draggable: true });
            markerRef.current = marker;
            if (hasPos) marker.setLngLat([startLng!, startLat!]).addTo(map);

            const emit = (ll: LngLat) => {
                onChangeRef.current(Number(ll.lat.toFixed(6)), Number(ll.lng.toFixed(6)));
                drawRadius.current();
            };
            marker.on("dragend", () => emit(marker.getLngLat()));
            map.on("click", (e: { lngLat: LngLat }) => { marker.setLngLat(e.lngLat).addTo(map); emit(e.lngLat); });
            map.on("load", () => applyStyleExtras("plan"));
        });
        return () => { cancelled = true; mapRef.current?.remove(); mapRef.current = null; markerRef.current = null; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { drawRadius.current(); }, [radiusMetres]);

    useEffect(() => {
        const map = mapRef.current, marker = markerRef.current;
        if (!map || !marker || lat == null || lng == null) return;
        marker.setLngLat([lng, lat]).addTo(map);
        drawRadius.current();
    }, [lat, lng]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        map.setStyle(styleFor(styleModeRef.current, isDark));
        map.once("style.load", () => applyStyleExtras(styleModeRef.current));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDark]);

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

    if (!mapboxAvailable()) {
        return (
            <div style={{ height, borderRadius: "var(--radius-lg)", border: "1px dashed var(--border-subtle)", background: "var(--bg-section-alt)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem", padding: "1rem" }}>
                <div>
                    <MapPin size={22} style={{ opacity: 0.5, marginBottom: 6 }} />
                    <p style={{ margin: 0 }}>Carte indisponible — token Mapbox manquant (<code>NEXT_PUBLIC_MAPBOX_TOKEN</code>).</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ position: "relative", height, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
                <MapControls styleMode={styleMode} onStyleChange={handleStyleChange} is3D={is3D} onToggle3D={handleToggle3D} />
                {showLocateButton && (
                    <button type="button" onClick={locateMe} disabled={locating}
                        aria-label="Me localiser"
                        style={{ position: "absolute", left: 10, bottom: 30, display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", background: "var(--bg-card)", color: "#f59e0b", fontWeight: 700, fontSize: "0.78rem", cursor: locating ? "wait" : "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
                        <LocateFixed size={14} />
                        {locating ? "Localisation…" : "Me localiser"}
                    </button>
                )}
            </div>
            <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: locateError ? "#ef4444" : "var(--text-muted)" }}>
                {locateError ?? caption ?? "Cliquez sur la carte ou déplacez le marqueur pour définir l'emplacement exact de votre restaurant."}
            </p>
        </div>
    );
}
