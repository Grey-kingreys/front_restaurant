"use client";
// src/components/map/MapControls.tsx - panneau overlay (style + 3D) sur une carte.

import type { MapStyleMode } from "@/lib/mapbox";
import { Map as MapIcon, Satellite, Box } from "lucide-react";

interface MapControlsProps {
    styleMode: MapStyleMode;
    onStyleChange: (m: MapStyleMode) => void;
    is3D: boolean;
    onToggle3D: () => void;
}

const STYLES: { value: MapStyleMode; label: string; icon: React.ReactNode }[] = [
    { value: "plan", label: "Plan", icon: <MapIcon size={13} /> },
    { value: "satellite", label: "Satellite", icon: <Satellite size={13} /> },
];

export default function MapControls({ styleMode, onStyleChange, is3D, onToggle3D }: MapControlsProps) {
    const wrap: React.CSSProperties = {
        position: "absolute", top: 10, left: 10, zIndex: 2,
        display: "flex", gap: 6, flexWrap: "wrap",
    };
    const group: React.CSSProperties = {
        display: "flex", borderRadius: 8, overflow: "hidden",
        boxShadow: "0 2px 8px rgba(0,0,0,0.25)", border: "1px solid rgba(0,0,0,0.1)",
    };
    const btn = (active: boolean): React.CSSProperties => ({
        display: "flex", alignItems: "center", gap: 4,
        padding: "6px 10px", border: "none", cursor: "pointer",
        background: active ? "#f59e0b" : "rgba(255,255,255,0.95)",
        color: active ? "#0c0a09" : "#1f2937",
        fontSize: 12, fontWeight: 700,
    });

    return (
        <div style={wrap}>
            <div style={group}>
                {STYLES.map((s) => (
                    <button key={s.value} type="button" onClick={() => onStyleChange(s.value)} style={btn(styleMode === s.value)} title={s.label}>
                        {s.icon}<span className="rp-mc-label">{s.label}</span>
                    </button>
                ))}
            </div>
            <div style={group}>
                <button type="button" onClick={onToggle3D} style={btn(is3D)} title="Vue 3D">
                    <Box size={13} /><span className="rp-mc-label">3D</span>
                </button>
            </div>
            <style>{`@media (max-width: 520px){ .rp-mc-label{ display:none; } }`}</style>
        </div>
    );
}
