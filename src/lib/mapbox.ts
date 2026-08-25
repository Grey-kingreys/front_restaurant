// src/lib/mapbox.ts - Configuration et helpers Mapbox

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/** Vrai si un token Mapbox est configuré. */
export const mapboxAvailable = (): boolean => MAPBOX_TOKEN.startsWith("pk.");

/** Centre par défaut : Conakry, Guinée. */
export const CONAKRY: [number, number] = [-13.5784, 9.6412]; // [lng, lat]

/** Styles Mapbox utilisés (adaptés au thème). */
export const MAP_STYLE_DARK = "mapbox://styles/mapbox/dark-v11";
export const MAP_STYLE_LIGHT = "mapbox://styles/mapbox/streets-v12";

export const MAP_STYLE_SATELLITE = "mapbox://styles/mapbox/satellite-streets-v12";

export type MapStyleMode = "plan" | "satellite";

/** URL de style selon le mode choisi et le thème. */
export function styleFor(mode: MapStyleMode, isDark: boolean): string {
    if (mode === "satellite") return MAP_STYLE_SATELLITE;
    return isDark ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;
}

/** Distance haversine en mètres entre deux points (lat, lng). */
export function distanceMetres(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // rayon terrestre (m)
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

/** Formate une distance (m) en texte lisible. */
export function formatDistance(m: number): string {
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
}

/** Parse une coordonnée stockée en string → number, ou null. */
export function parseCoord(v: string | number | null | undefined): number | null {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : parseFloat(v);
    return Number.isFinite(n) ? n : null;
}

/**
 * Génère un polygone GeoJSON circulaire (pour visualiser un rayon en mètres).
 * center = [lng, lat].
 */
export function circlePolygon(
    center: [number, number],
    radiusMetres: number,
    points = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
    const [lng, lat] = center;
    const coords: [number, number][] = [];
    const distanceX = radiusMetres / (111320 * Math.cos((lat * Math.PI) / 180));
    const distanceY = radiusMetres / 110540;
    for (let i = 0; i < points; i++) {
        const theta = (i / points) * (2 * Math.PI);
        coords.push([lng + distanceX * Math.cos(theta), lat + distanceY * Math.sin(theta)]);
    }
    coords.push(coords[0]);
    return {
        type: "Feature",
        properties: {},
        geometry: { type: "Polygon", coordinates: [coords] },
    };
}
