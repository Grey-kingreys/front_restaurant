"use client";
// src/hooks/useTableGeoCheck.ts
// Vérification périodique de position GPS pour les sessions table (Rtable).
// Appelé toutes les 60 secondes ; gère la déconnexion automatique et le compte à rebours post-paiement.

import { useEffect, useRef, useCallback } from "react";
import { checkPosition } from "@/lib/api/restaurant";
import type { CheckPositionStatus } from "@/lib/api/restaurant";

export interface GeoCheckCallbacks {
    onOutOfRange: (strikes: number, message: string) => void;
    onDisconnect: (reason: CheckPositionStatus) => void;
    onAllPaid: (paidAt: string) => void;
    onExpiredWarn: () => void;
}

const CHECK_INTERVAL_MS = 60_000;

export function useTableGeoCheck(active: boolean, callbacks: GeoCheckCallbacks) {
    const posRef      = useRef<{ lat: number; lng: number } | null>(null);
    const watchIdRef  = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const cbRef       = useRef(callbacks);
    cbRef.current = callbacks; // toujours à jour sans re-déclencher useEffect

    const doCheck = useCallback(async () => {
        const pos = posRef.current;
        try {
            const res = await checkPosition(pos?.lat, pos?.lng);
            if (!res.success || !res.data) return;
            const { status, disconnect, strikes, message, paid_at } = res.data;

            if (status === "out_of_range") {
                cbRef.current.onOutOfRange(strikes ?? 0, message ?? "Hors zone");
                if (disconnect) cbRef.current.onDisconnect("out_of_range");

            } else if (status === "expired" || (status === "all_paid" && paid_at)) {
                cbRef.current.onAllPaid(paid_at ?? new Date().toISOString());

            } else if (status === "expired_warn") {
                cbRef.current.onExpiredWarn();

            } else if (status === "no_session") {
                cbRef.current.onDisconnect("no_session");
            }
        } catch {
            // Ignore les erreurs réseau transitoires
        }
    }, []);

    useEffect(() => {
        if (!active) return;

        // Démarrer watchPosition
        if (navigator.geolocation) {
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    posRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                },
                () => { posRef.current = null; },
                { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 }
            );
        }

        // Garder l'écran allumé si l'API est disponible
        let wakeLock: WakeLockSentinel | null = null;
        if ("wakeLock" in navigator) {
            (navigator.wakeLock as WakeLock).request("screen").then((wl) => { wakeLock = wl; }).catch(() => {});
        }

        // Premier check immédiat puis toutes les 60s
        doCheck();
        intervalRef.current = setInterval(doCheck, CHECK_INTERVAL_MS);

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation?.clearWatch(watchIdRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
            wakeLock?.release().catch(() => {});
        };
    }, [active, doCheck]);
}
