"use client";
// src/hooks/useTableDistanceCheck.ts
// Vérification périodique de DISTANCE pour une table connectée en login+password
// (sans session QR). N'applique QUE la restriction de distance — pas d'expiration
// de session ni de déconnexion post-paiement (celles-ci restent spécifiques au QR).

import { useEffect, useRef, useCallback } from "react";
import { checkTableDistance } from "@/lib/api/restaurant";

const CHECK_INTERVAL_MS = 60_000;
const MAX_STRIKES = 3;

export interface DistanceCheckCallbacks {
    onOutOfRange: (strikes: number, message: string) => void;
    onDisconnect: () => void;
}

export function useTableDistanceCheck(active: boolean, callbacks: DistanceCheckCallbacks) {
    const posRef      = useRef<{ lat: number; lng: number } | null>(null);
    const watchIdRef  = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const strikesRef  = useRef(0);
    const cbRef       = useRef(callbacks);
    useEffect(() => { cbRef.current = callbacks; });

    const doCheck = useCallback(async () => {
        const pos = posRef.current;
        try {
            const res = await checkTableDistance(pos?.lat, pos?.lng);
            if (!res.success || !res.data) return;
            if (res.data.in_range) {
                strikesRef.current = 0;
                return;
            }
            strikesRef.current += 1;
            if (strikesRef.current >= MAX_STRIKES) {
                cbRef.current.onDisconnect();
            } else {
                cbRef.current.onOutOfRange(strikesRef.current, res.data.message ?? "Hors zone");
            }
        } catch {
            // Ignore les erreurs réseau transitoires
        }
    }, []);

    useEffect(() => {
        if (!active) return;
        strikesRef.current = 0;

        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => { posRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude }; },
                () => { posRef.current = null; },
                { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 }
            );
        }

        doCheck();
        intervalRef.current = setInterval(doCheck, CHECK_INTERVAL_MS);

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation?.clearWatch(watchIdRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [active, doCheck]);
}
