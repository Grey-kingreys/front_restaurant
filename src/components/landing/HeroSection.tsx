"use client";

import { useEffect, useRef } from "react";

export default function HeroSection() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const elements = document.querySelectorAll(".hero-anim");
    elements.forEach((el, i) => {
      (el as HTMLElement).style.opacity = "0";
      (el as HTMLElement).style.transform = "translateY(28px)";
      setTimeout(() => {
        (el as HTMLElement).style.transition = "opacity 0.7s ease, transform 0.7s ease";
        (el as HTMLElement).style.opacity = "1";
        (el as HTMLElement).style.transform = "translateY(0)";
      }, 150 + i * 150);
    });
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/hero_food.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div 
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(12, 10, 9, 0.6) 0%, rgba(12, 10, 9, 0.95) 100%)",
          }}
        />
      </div>

      {/* Background radial glow */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Orbiting decoration */}
      <div className="absolute top-32 left-1/2 -translate-x-1/2 pointer-events-none z-[1]" style={{ width: 500, height: 500 }}>
        <div
          className="orbit-ring"
          style={{ width: 420, height: 420, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        >
          <div className="orbit-dot" />
        </div>
        <div
          className="orbit-ring"
          style={{
            width: 300,
            height: 300,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animationDirection: "reverse",
            animationDuration: "15s",
            borderColor: "rgba(245,158,11,0.08)",
          }}
        />
      </div>

      {/* Badge */}
      <div className="hero-anim relative z-10 mb-6">
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
          style={{
            background: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.3)",
            color: "#fbbf24",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
          Plateforme SaaS de gestion restaurant
        </span>
      </div>

      {/* Title */}
      <h1
        ref={titleRef}
        className="hero-anim relative z-10 max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        style={{ fontFamily: "var(--font-playfair), serif" }}
      >
        Gérez votre restaurant{" "}
        <span className="animate-shimmer">comme un chef</span>
      </h1>

      {/* Subtitle */}
      <p
        className="hero-anim relative z-10 max-w-2xl text-lg sm:text-xl mb-10"
        style={{ color: "#a8a29e", lineHeight: 1.75 }}
      >
        De la prise de commande au paiement, en passant par la cuisine et la
        caisse — pilotez chaque aspect de votre service en temps réel avec une
        plateforme pensée pour la Guinée.
      </p>

      {/* CTA buttons */}
      <div className="hero-anim relative z-10 flex flex-wrap items-center justify-center gap-4">
        <a href="#" className="btn-primary animate-pulse-glow">
          <span>🚀 Démarrer gratuitement</span>
        </a>
        <a href="#" className="btn-outline flex items-center gap-2">
          <span>▶</span> Voir la démo
        </a>
      </div>

      {/* Social proof */}
      <div
        className="hero-anim relative z-10 mt-14 flex flex-wrap items-center justify-center gap-6 text-sm"
        style={{ color: "#78716c" }}
      >
        {[
          { icon: "✅", text: "Sans carte bancaire" },
          { icon: "⚡", text: "Déploiement en 5 minutes" },
          { icon: "🔒", text: "Données sécurisées" },
          { icon: "📱", text: "Accès QR Code" },
        ].map((item) => (
          <span key={item.text} className="flex items-center gap-1.5">
            <span>{item.icon}</span> {item.text}
          </span>
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float z-10"
        style={{ color: "#57534e" }}
      >
        <span className="text-xs tracking-widest uppercase">Découvrir</span>
        <div
          className="w-5 h-8 rounded-full border flex items-start justify-center pt-1.5"
          style={{ borderColor: "rgba(245,158,11,0.3)" }}
        >
          <div className="w-1 h-2 rounded-full bg-amber-400 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
