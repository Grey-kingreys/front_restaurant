"use client";

import { useEffect, useRef } from "react";

const trustItems = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
      </svg>
    ),
    text: "Sans carte bancaire",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
      </svg>
    ),
    text: "Déploiement en 5 minutes",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
      </svg>
    ),
    text: "Données sécurisées",
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
      </svg>
    ),
    text: "Accès QR Code",
  },
];

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
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden">
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
            background:
              "linear-gradient(to bottom, rgba(12, 10, 9, 0.55) 0%, rgba(12, 10, 9, 0.92) 100%)",
          }}
        />
      </div>

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,158,11,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Orbiting decoration */}
      <div
        className="absolute top-32 left-1/2 -translate-x-1/2 pointer-events-none z-[1]"
        style={{ width: 500, height: 500 }}
      >
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
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.35)",
            color: "#fbbf24",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block" />
          Plateforme SaaS de gestion restaurant
        </span>
      </div>

      {/* Title — always white on hero (image bg) */}
      <h1
        ref={titleRef}
        className="hero-anim relative z-10 max-w-4xl text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6"
        style={{ fontFamily: "var(--font-playfair), serif", color: "#f5f5f4" }}
      >
        Gérez votre restaurant{" "}
        <span className="animate-shimmer">comme un chef</span>
      </h1>

      {/* Subtitle */}
      <p
        className="hero-anim relative z-10 max-w-2xl text-lg sm:text-xl mb-10"
        style={{ color: "#c8b89a", lineHeight: 1.75 }}
      >
        De la prise de commande au paiement, en passant par la cuisine et la caisse — pilotez
        chaque aspect de votre service en temps réel avec une plateforme pensée pour la Guinée.
      </p>

      {/* CTA buttons */}
      <div className="hero-anim relative z-10 flex flex-wrap items-center justify-center gap-4">
        <a href="#" className="btn-primary animate-pulse-glow flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 relative z-10">
            <path fillRule="evenodd" d="M10 1a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 1ZM5.05 3.05a.75.75 0 0 1 1.06 0l1.062 1.06A.75.75 0 1 1 6.11 5.173L5.05 4.11a.75.75 0 0 1 0-1.06Zm9.9 0a.75.75 0 0 1 0 1.06l-1.06 1.062a.75.75 0 0 1-1.062-1.061l1.061-1.06a.75.75 0 0 1 1.06 0ZM3 8a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 3 8Zm11 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 14 8Zm-6.828 2.828a.75.75 0 0 1 0 1.061L6.11 12.95a.75.75 0 0 1-1.06-1.06l1.06-1.06a.75.75 0 0 1 1.06 0Zm3.594-3.317a.75.75 0 0 1 1.06.01l1.95 2a.75.75 0 1 1-1.07 1.05L12 9.44V13.5a.75.75 0 0 1-1.5 0V9.44l-.706.731a.75.75 0 0 1-1.088-1.032l2-2.121a.75.75 0 0 1 .028-.03ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15Z" clipRule="evenodd" />
          </svg>
          <span>Démarrer gratuitement</span>
        </a>
        <a
          href="#"
          className="btn-outline flex items-center gap-2"
          style={{ color: "#fbbf24", borderColor: "rgba(251,191,36,0.5)" }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clipRule="evenodd" />
          </svg>
          Voir la démo
        </a>
      </div>

      {/* Trust items */}
      <div
        className="hero-anim relative z-10 mt-14 flex flex-wrap items-center justify-center gap-6 text-sm"
        style={{ color: "#a8967a" }}
      >
        {trustItems.map((item) => (
          <span key={item.text} className="flex items-center gap-1.5" style={{ color: "#c4a86a" }}>
            {item.icon}
            {item.text}
          </span>
        ))}
      </div>

      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float z-10"
        style={{ color: "rgba(245,158,11,0.5)" }}
      >
        <span className="text-xs tracking-widest uppercase" style={{ color: "rgba(245,158,11,0.5)" }}>
          Découvrir
        </span>
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