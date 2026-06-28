"use client";
// src/app/auth/qr/[token]/page.tsx
// Connexion automatique via QR Code — demande GPS avant connexion

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { loginViaQR } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { QrCode, XCircle, MapPin, Loader2 } from "lucide-react";

type Phase = "requesting_gps" | "connecting" | "error";

function requestGPS(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) { resolve(null); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 10_000, maximumAge: 0 }
        );
    });
}

export default function QRLoginPage() {
    const params  = useParams();
    const router  = useRouter();
    const { refreshUser } = useAuth();
    const [phase, setPhase] = useState<Phase>("requesting_gps");
    const [error, setError] = useState<string | null>(null);
    const called = useRef(false);

    useEffect(() => {
        if (called.current) return;
        called.current = true;

        const token = params?.token as string;
        if (!token) { setError("Token manquant."); return; }

        (async () => {
            // 1. Demande de position GPS
            const coords = await requestGPS();

            // 2. Connexion
            setPhase("connecting");
            try {
                const res = await loginViaQR(token, coords ?? undefined);
                if (res.success && res.data) {
                    await refreshUser();
                    router.replace("/dashboard");
                } else {
                    setError(res.message || "QR Code invalide ou expiré.");
                    setPhase("error");
                }
            } catch (e: unknown) {
                const err = e as { message?: string };
                setError(err?.message || "Erreur lors de la connexion via QR Code.");
                setPhase("error");
            }
        })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const amber = "var(--amber-glow, #f59e0b)";

    return (
        <>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
                body { margin: 0; background: #0c0a09; }
            `}</style>
            <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c0a09", padding: "1rem" }}>
                <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>

                    {/* Icône */}
                    <div style={{
                        width: 56, height: 56, borderRadius: "1rem",
                        background: phase === "error" ? "rgba(239,68,68,0.1)" : phase === "requesting_gps" ? "rgba(59,130,246,0.1)" : "rgba(245,158,11,0.1)",
                        border: `1px solid ${phase === "error" ? "rgba(239,68,68,0.25)" : phase === "requesting_gps" ? "rgba(59,130,246,0.25)" : "rgba(245,158,11,0.25)"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        margin: "0 auto 1.5rem",
                        color: phase === "error" ? "#ef4444" : phase === "requesting_gps" ? "#3b82f6" : amber,
                    }}>
                        {phase === "error" ? <XCircle size={26} /> : phase === "requesting_gps" ? <MapPin size={26} style={{ animation: "pulse 1.5s ease-in-out infinite" }} /> : <QrCode size={26} />}
                    </div>

                    {phase === "requesting_gps" && (
                        <>
                            <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>Localisation en cours…</h1>
                            <p style={{ margin: "0 0 1rem", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                                Autorisez la géolocalisation pour vérifier que vous êtes bien dans le restaurant.
                            </p>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(59,130,246,0.25)", borderTopColor: "#3b82f6", animation: "spin .75s linear infinite", margin: "0 auto" }} />
                        </>
                    )}

                    {phase === "connecting" && (
                        <>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid rgba(245,158,11,0.25)", borderTopColor: amber, animation: "spin .75s linear infinite", margin: "0 auto 1rem" }} />
                            <h1 style={{ margin: "0 0 0.375rem", fontSize: "1.125rem", fontWeight: 700, color: "#fff" }}>Connexion en cours…</h1>
                            <p style={{ margin: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>Vous allez être redirigé vers le tableau de bord.</p>
                        </>
                    )}

                    {phase === "error" && (
                        <>
                            <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.25rem", fontWeight: 800, color: "#fff" }}>Connexion refusée</h1>
                            <p style={{ margin: "0 0 1.5rem", fontSize: "0.875rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>{error}</p>
                            <button
                                onClick={() => router.replace("/auth/login")}
                                style={{ padding: "0.7rem 1.75rem", borderRadius: "0.75rem", border: `1px solid rgba(245,158,11,0.3)`, background: "transparent", color: amber, fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
                            >
                                Aller à la connexion
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
