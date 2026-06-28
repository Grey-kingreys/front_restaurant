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
import { MapPin } from "lucide-react";

interface MapPickerProps {
    lat: number | null;
    lng: number | null;
    onChange: (lat: number, lng: number) => void;
    radiusMetres?: number;
    height?: number | string;
}

const CIRCLE_SRC = "rp-radius";

export default function MapPicker({ lat, lng, onChange, radiusMetres, height = 320 }: MapPickerProps) {
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
    const styleModeRef = useRef(styleMode); styleModeRef.current = styleMode;
    const is3DRef = useRef(is3D); is3DRef.current = is3D;

    // Dessine / met à jour le cercle de rayon
    const drawRadius = useRef(() => {
        const map = mapRef.current, marker = markerRef.current;
        if (!map || !marker || !radiusRef.current) return;
        const pos = marker.getLngLat();
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
            <div style={{ height, borderRadius: "0.75rem", border: "1px dashed var(--border-subtle)", background: "var(--bg-section-alt)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "var(--text-muted)", fontSize: "0.82rem", padding: "1rem" }}>
                <div>
                    <MapPin size={22} style={{ opacity: 0.5, marginBottom: 6 }} />
                    <p style={{ margin: 0 }}>Carte indisponible — token Mapbox manquant (<code>NEXT_PUBLIC_MAPBOX_TOKEN</code>).</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div style={{ position: "relative", height, borderRadius: "0.75rem", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
                <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
                <MapControls styleMode={styleMode} onStyleChange={handleStyleChange} is3D={is3D} onToggle3D={handleToggle3D} />
            </div>
            <p style={{ margin: "0.4rem 0 0", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Cliquez sur la carte ou déplacez le marqueur pour définir l'emplacement exact de votre restaurant.
            </p>
        </div>
    );
}
