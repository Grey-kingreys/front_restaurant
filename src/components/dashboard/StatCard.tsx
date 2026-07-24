"use client";
// src/components/dashboard/StatCard.tsx

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        isUp: boolean;
    };
    color?: string;
    description?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, color = "var(--amber-glow)", description }: StatCardProps) {
    return (
        <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "var(--radius-2xl)",
            padding: "clamp(0.875rem, 3vw, 1.25rem)",
            display: "flex",
            flexDirection: "column",
            gap: "0.625rem",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.2s ease",
            boxShadow: "var(--shadow-card)",
        }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = color;
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-subtle)";
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            }}
        >
            {/* Décoration de fond */}
            <div style={{
                position: "absolute",
                top: "-1rem",
                right: "-1rem",
                width: "4rem",
                height: "4rem",
                background: color,
                opacity: 0.05,
                borderRadius: "50%",
                filter: "blur(20px)",
            }} />

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: 700, 
                    color: "var(--text-muted)", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.05em" 
                }}>
                    {title}
                </span>
                <div style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--bg-section-alt)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: color,
                }}>
                    <Icon size={20} />
                </div>
            </div>

            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", flexWrap: "wrap" }}>
                <span style={{ 
                    fontSize: "clamp(1.25rem, 3.5vw, 1.75rem)", 
                    fontWeight: 800, 
                    color: "var(--text-primary)",
                    fontFamily: "var(--font-playfair), serif",
                    lineHeight: 1.1,
                    wordBreak: "break-all",
                }}>
                    {value}
                </span>
                {trend && (
                    <span style={{ 
                        fontSize: "0.7rem", 
                        fontWeight: 700, 
                        color: trend.isUp ? "#22c55e" : "#ef4444",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.1rem"
                    }}>
                        {trend.isUp ? "↑" : "↓"} {trend.value}%
                    </span>
                )}
            </div>

            {description && (
                <p style={{ fontSize: "0.65rem", color: "var(--text-muted)", margin: 0 }}>
                    {description}
                </p>
            )}
        </div>
    );
}
