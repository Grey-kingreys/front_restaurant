"use client";
// src/components/landing/PublicShell.tsx
// Enveloppe pour les pages publiques statiques (À propos, Contact, Blog) :
// Navbar (avec état "scrolled") + contenu + Footer, plus l'observer scroll-reveal
// pour que les animations d'apparition fonctionnent comme sur la landing.

import { useEffect, useState, type ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function PublicShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up");
            entry.target.classList.remove("opacity-0-init");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".scroll-reveal").forEach((el) => {
      el.classList.add("opacity-0-init");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-dark)" }}>
      <Navbar scrolled={scrolled} />
      <main style={{ paddingTop: "6.5rem" }}>{children}</main>
      <Footer />
    </div>
  );
}
