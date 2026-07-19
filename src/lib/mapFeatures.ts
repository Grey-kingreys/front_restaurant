// src/lib/mapFeatures.ts
// Helpers appliqués sur une instance de carte Mapbox (3D, continents, itinéraire).
// N'utilisent que des méthodes de `map` → pas besoin du module mapbox-gl.

import { continentColorExpression } from "@/lib/continents";
import { MAPBOX_TOKEN } from "@/lib/mapbox";

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyMap = any;

const DEM_SRC = "mapbox-dem";
const BUILDINGS = "rp-3d-buildings";
const CONTINENTS_SRC = "rp-countries";
const CONTINENTS_FILL = "rp-continents-fill";
const CONTINENTS_LINE = "rp-continents-line";
const ROUTE_SRC = "rp-route";
const ROUTE_LINE = "rp-route-line";

/** Active/désactive le relief 3D + les bâtiments 3D + l'inclinaison. */
export function apply3D(map: AnyMap, on: boolean): void {
    if (!map) return;
    if (on) {
        if (!map.getSource(DEM_SRC)) {
            map.addSource(DEM_SRC, { type: "raster-dem", url: "mapbox://mapbox.mapbox-terrain-dem-v1", tileSize: 512, maxzoom: 14 });
        }
        map.setTerrain({ source: DEM_SRC, exaggeration: 1.4 });
        if (map.getPitch() < 45) map.easeTo({ pitch: 60, duration: 600 });
        // Bâtiments 3D si la source vecteur existe (styles streets/satellite-streets)
        if (map.getSource("composite") && !map.getLayer(BUILDINGS)) {
            try {
                map.addLayer({
                    id: BUILDINGS, source: "composite", "source-layer": "building",
                    type: "fill-extrusion", minzoom: 14,
                    filter: ["==", ["get", "extrude"], "true"],
                    paint: {
                        "fill-extrusion-color": "#9ca3af",
                        "fill-extrusion-height": ["get", "height"],
                        "fill-extrusion-base": ["get", "min_height"],
                        "fill-extrusion-opacity": 0.6,
                    },
                });
            } catch { /* certaines styles n'ont pas la couche building */ }
        }
    } else {
        map.setTerrain(null);
        if (map.getLayer(BUILDINGS)) map.removeLayer(BUILDINGS);
        if (map.getPitch() > 0) map.easeTo({ pitch: 0, duration: 600 });
    }
}

// Zoom max d'affichage des continents colorés : visibles uniquement quand on
// est suffisamment dézoomé pour voir plusieurs continents.
const CONTINENTS_MAXZOOM = 3.5;

/**
 * Ajoute la couche des continents colorés (tileset country-boundaries).
 * La couche n'est visible qu'aux faibles niveaux de zoom (vue dézoomée).
 */
export function addContinents(map: AnyMap): void {
    if (!map || map.getLayer(CONTINENTS_FILL)) return;
    if (!map.getSource(CONTINENTS_SRC)) {
        map.addSource(CONTINENTS_SRC, { type: "vector", url: "mapbox://mapbox.country-boundaries-v1" });
    }
    // insérer sous le premier calque de libellés pour garder les noms lisibles
    const layers = map.getStyle()?.layers ?? [];
    const firstSymbol = layers.find((l: any) => l.type === "symbol")?.id;
    map.addLayer({
        id: CONTINENTS_FILL, type: "fill", source: CONTINENTS_SRC, "source-layer": "country_boundaries",
        maxzoom: CONTINENTS_MAXZOOM,
        paint: {
            "fill-color": continentColorExpression() as any,
            // fondu progressif : pleinement visible quand dézoomé, s'estompe en zoomant
            "fill-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.7, CONTINENTS_MAXZOOM - 0.5, 0.7, CONTINENTS_MAXZOOM, 0],
        },
    }, firstSymbol);
    map.addLayer({
        id: CONTINENTS_LINE, type: "line", source: CONTINENTS_SRC, "source-layer": "country_boundaries",
        maxzoom: CONTINENTS_MAXZOOM,
        paint: { "line-color": "rgba(255,255,255,0.35)", "line-width": 0.4 },
    }, firstSymbol);
}

export function removeContinents(map: AnyMap): void {
    if (!map) return;
    if (map.getLayer(CONTINENTS_LINE)) map.removeLayer(CONTINENTS_LINE);
    if (map.getLayer(CONTINENTS_FILL)) map.removeLayer(CONTINENTS_FILL);
}

export interface RouteInfo { distance: number; duration: number; }

/** Trace un itinéraire routier (Directions API) de `from` à `to`. [lng, lat]. */
export async function drawRoute(
    map: AnyMap, from: [number, number], to: [number, number]
): Promise<RouteInfo | null> {
    if (!map) return null;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from[0]},${from[1]};${to[0]},${to[1]}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
    let data: any;
    try {
        const res = await fetch(url);
        data = await res.json();
    } catch { return null; }
    const route = data?.routes?.[0];
    if (!route) return null;
    const geojson = { type: "Feature", properties: {}, geometry: route.geometry };
    const src = map.getSource(ROUTE_SRC);
    if (src) src.setData(geojson);
    else {
        map.addSource(ROUTE_SRC, { type: "geojson", data: geojson });
        map.addLayer({
            id: ROUTE_LINE, type: "line", source: ROUTE_SRC,
            layout: { "line-join": "round", "line-cap": "round" },
            paint: { "line-color": "#3b82f6", "line-width": 5, "line-opacity": 0.85 },
        });
    }
    // cadrer sur l'itinéraire
    const coords: [number, number][] = route.geometry.coordinates;
    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    for (const [ln, la] of coords) {
        minLng = Math.min(minLng, ln); maxLng = Math.max(maxLng, ln);
        minLat = Math.min(minLat, la); maxLat = Math.max(maxLat, la);
    }
    map.fitBounds([[minLng, minLat], [maxLng, maxLat]], { padding: 70, duration: 700 });
    return { distance: route.distance, duration: route.duration };
}

export function clearRoute(map: AnyMap): void {
    if (!map) return;
    if (map.getLayer(ROUTE_LINE)) map.removeLayer(ROUTE_LINE);
    if (map.getSource(ROUTE_SRC)) map.removeSource(ROUTE_SRC);
}
