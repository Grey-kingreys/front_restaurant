"use client";
// src/hooks/useGeolocation.ts — géolocalisation navigateur (sur demande)

import { useState, useCallback } from "react";

export type GeoStatus = "idle" | "loading" | "granted" | "denied" | "unavailable";

export interface GeoState {
    location: { lat: number; lng: number } | null;
    status: GeoStatus;
    request: () => void;
}

export function useGeolocation(): GeoState {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [status, setStatus] = useState<GeoStatus>("idle");

    const request = useCallback(() => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setStatus("unavailable");
            return;
        }
        setStatus("loading");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setStatus("granted");
            },
            () => setStatus("denied"),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
    }, []);

    return { location, status, request };
}
