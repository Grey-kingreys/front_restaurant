"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// Animated steam SVG component
function Steam({ delay = 0, x = 0 }: { delay?: number; x?: number }) {
    return (
        <div
            className="absolute bottom-full"
            style={{
                left: `calc(50% + ${x}px)`,
                animation: `steamRise 2.5s ease-in-out ${delay}s infinite`,
                opacity: 0,
            }}
        >
            <svg width="8" height="30" viewBox="0 0 8 30" fill="none">
                <path
                    d="M4 28 Q1 22 4 18 Q7 14 4 8 Q1 4 4 0"
                    stroke="rgba(245,158,11,0.3)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </div>
    );
}

export default function NotFound() {
    const plateRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Animate elements in
        const elements = document.querySelectorAll(".nf-anim");
        elements.forEach((el, i) => {
            (el as HTMLElement).style.opacity = "0";
            (el as HTMLElement).style.transform = "translateY(20px)";
            setTimeout(() => {
                (el as HTMLElement).style.transition = "opacity 0.6s ease, transform 0.6s ease";
                (el as HTMLElement).style.opacity = "1";
                (el as HTMLElement).style.transform = "translateY(0)";
            }, 200 + i * 120);
        });
    }, []);

    return (
        <>
            <style>{`
        @keyframes steamRise {
          0%   { opacity: 0; transform: translateY(0) scaleX(1); }
          20%  { opacity: 0.6; }
          80%  { opacity: 0.2; }
          100% { opacity: 0; transform: translateY(-40px) scaleX(1.5); }
        }
        @keyframes plateLift {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-6px) rotate(1deg); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          45%       { opacity: 0.95; }
          46%       { opacity: 0.6; }
          47%       { opacity: 0.95; }
          90%       { opacity: 0.9; }
          91%       { opacity: 0.5; }
          92%       { opacity: 0.9; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes errorGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(245,158,11,0.3); }
          50%       { text-shadow: 0 0 40px rgba(245,158,11,0.7), 0 0 80px rgba(245,158,11,0.2); }
        }
        .plate-float {
          animation: plateLift 4s ease-in-out infinite;
        }
        .candle-flicker {
          animation: flicker 3s linear infinite;
        }
        .error-number {
          animation: errorGlow 3s ease-in-out infinite;
        }
      `}</style>

            <main
                className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
                style={{ background: "var(--bg-dark)" }}
            >
                {/* Ambient radial glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,158,11,0.06) 0%, transparent 70%)",
                    }}
                />

                {/* Very subtle grid texture */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                        backgroundImage: `
              linear-gradient(var(--border-subtle) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)
            `,
                        backgroundSize: "60px 60px",
                    }}
                />

                {/* Table illustration area */}
                <div className="nf-anim relative flex flex-col items-center mb-8">

                    {/* Candle */}
                    <div className="relative mb-6" style={{ zIndex: 2 }}>
                        {/* Flame */}
                        <div className="candle-flicker flex justify-center mb-1">
                            <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
                                <ellipse cx="7" cy="19" rx="3" ry="3" fill="rgba(245,158,11,0.15)" />
                                <path
                                    d="M7 18 C4 14 3 10 5 7 C6 5 7 2 7 0 C7 2 8 5 9 7 C11 10 10 14 7 18Z"
                                    fill="url(#flameGrad)"
                                />
                                <defs>
                                    <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
                                        <stop offset="0%" stopColor="#fef9c3" />
                                        <stop offset="40%" stopColor="#f59e0b" />
                                        <stop offset="100%" stopColor="#d97706" stopOpacity="0.6" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>
                        {/* Candle body */}
                        <div
                            className="w-6 mx-auto rounded-sm"
                            style={{
                                height: 48,
                                background: "linear-gradient(180deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)",
                                boxShadow: "0 0 12px rgba(245,158,11,0.4)",
                            }}
                        />
                        {/* Wax pool */}
                        <div
                            className="w-8 h-2 rounded-full mx-auto -mt-1"
                            style={{ background: "rgba(253,230,138,0.6)" }}
                        />
                    </div>

                    {/* Plate with cloche — the main illustration */}
                    <div ref={plateRef} className="plate-float relative" style={{ zIndex: 1 }}>
                        {/* Steam wisps from under cloche */}
                        <div className="relative" style={{ height: 30 }}>
                            <Steam delay={0} x={-12} />
                            <Steam delay={0.8} x={0} />
                            <Steam delay={1.6} x={12} />
                        </div>

                        {/* Cloche (dome lid) */}
                        <div className="relative flex justify-center" style={{ marginBottom: -2 }}>
                            <svg width="180" height="80" viewBox="0 0 180 80" fill="none">
                                {/* Dome shadow */}
                                <ellipse cx="90" cy="76" rx="86" ry="6" fill="rgba(0,0,0,0.15)" />
                                {/* Dome body */}
                                <path
                                    d="M8 70 Q8 10 90 10 Q172 10 172 70 Z"
                                    fill="url(#clocheGrad)"
                                />
                                {/* Dome rim */}
                                <rect x="4" y="68" width="172" height="8" rx="4" fill="url(#rimGrad)" />
                                {/* Handle */}
                                <circle cx="90" cy="14" r="8" fill="url(#handleGrad)" />
                                <circle cx="90" cy="14" r="4" fill="rgba(255,255,255,0.2)" />
                                {/* Highlight on dome */}
                                <path
                                    d="M40 30 Q60 15 90 18 Q110 20 125 28"
                                    stroke="rgba(255,255,255,0.15)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    fill="none"
                                />
                                {/* 404 engraved on cloche */}
                                <text
                                    x="90"
                                    y="54"
                                    textAnchor="middle"
                                    fontFamily="serif"
                                    fontSize="22"
                                    fontWeight="700"
                                    fill="rgba(245,158,11,0.5)"
                                    letterSpacing="3"
                                >
                                    404
                                </text>
                                <defs>
                                    <linearGradient id="clocheGrad" x1="90" y1="10" x2="90" y2="70" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#44403c" />
                                        <stop offset="100%" stopColor="#292524" />
                                    </linearGradient>
                                    <linearGradient id="rimGrad" x1="0" y1="0" x2="180" y2="0" gradientUnits="userSpaceOnUse">
                                        <stop offset="0%" stopColor="#57534e" />
                                        <stop offset="50%" stopColor="#78716c" />
                                        <stop offset="100%" stopColor="#57534e" />
                                    </linearGradient>
                                    <radialGradient id="handleGrad" cx="50%" cy="30%" r="60%">
                                        <stop offset="0%" stopColor="#a8a29e" />
                                        <stop offset="100%" stopColor="#44403c" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Plate */}
                        <div className="flex justify-center">
                            <svg width="210" height="30" viewBox="0 0 210 30" fill="none">
                                <ellipse cx="105" cy="18" rx="100" ry="12" fill="url(#plateGrad)" />
                                <ellipse cx="105" cy="15" rx="96" ry="8" fill="url(#plateTopGrad)" />
                                <ellipse cx="105" cy="15" rx="70" ry="5" fill="rgba(255,255,255,0.06)" />
                                <defs>
                                    <radialGradient id="plateGrad" cx="50%" cy="30%" r="70%">
                                        <stop offset="0%" stopColor="#57534e" />
                                        <stop offset="100%" stopColor="#1c1917" />
                                    </radialGradient>
                                    <radialGradient id="plateTopGrad" cx="50%" cy="20%" r="80%">
                                        <stop offset="0%" stopColor="#78716c" />
                                        <stop offset="100%" stopColor="#44403c" />
                                    </radialGradient>
                                </defs>
                            </svg>
                        </div>

                        {/* Cutlery — fork & knife */}
                        <div className="absolute flex gap-36" style={{ top: 30, left: "50%", transform: "translateX(-50%)" }}>
                            {/* Fork */}
                            <svg width="16" height="80" viewBox="0 0 16 80" fill="none">
                                <rect x="6" y="0" width="2" height="20" rx="1" fill="#78716c" />
                                <rect x="3" y="0" width="2" height="15" rx="1" fill="#78716c" />
                                <rect x="9" y="0" width="2" height="15" rx="1" fill="#78716c" />
                                <rect x="6" y="18" width="2" height="50" rx="1" fill="#57534e" />
                                <rect x="4" y="65" width="6" height="12" rx="3" fill="#44403c" />
                            </svg>
                            {/* Knife */}
                            <svg width="16" height="80" viewBox="0 0 16 80" fill="none">
                                <path d="M8 0 Q12 5 12 20 L8 22 Z" fill="#78716c" />
                                <rect x="7" y="20" width="2" height="48" rx="1" fill="#57534e" />
                                <rect x="5" y="65" width="6" height="12" rx="3" fill="#44403c" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Text content */}
                <div className="nf-anim text-center max-w-lg relative z-10">
                    {/* Stamp / menu badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
                        style={{
                            background: "var(--icon-bg)",
                            border: "1px solid var(--icon-border)",
                            color: "var(--amber-glow)",
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                        </svg>
                        Ce plat n'est pas au menu
                    </div>

                    <h1
                        className="error-number text-6xl sm:text-7xl font-extrabold mb-3 text-gradient"
                        style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                        Table introuvable
                    </h1>

                    <p
                        className="text-lg mb-4 font-medium"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Cette page a quitté la salle.
                    </p>

                    <p
                        className="text-sm mb-10 leading-relaxed"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Le plat que vous cherchez n'existe pas, a été retiré du menu, ou la table a été libérée.
                        <br />
                        Retournez en cuisine — il reste de bonnes choses à découvrir.
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link href="/" className="btn-primary flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 relative z-10">
                                <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
                            </svg>
                            <span>Retour à l'accueil</span>
                        </Link>
                        <Link href="/#features" className="btn-outline flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
                            </svg>
                            Voir le menu
                        </Link>
                    </div>
                </div>

                {/* Bottom ambient line */}
                <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.2), transparent)" }} />
            </main>
        </>
    );
}