"use client";
// src/components/landing/Navbar.tsx

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ThemeSwitcher from "../ui/ThemeSwitcher";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Fonctionnalités", href: "#features" },
  { label: "Workflow",        href: "#workflow" },
  { label: "Équipes",         href: "#roles" },
  { label: "Tarifs",          href: "#tarifs" },
];

interface NavbarProps {
  scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  const { isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : "navbar-hero"}`}>
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0c0a09", fontFamily: "var(--font-playfair), serif", flexShrink: 0 }}
          >
            R
          </div>
          <span
            className="text-xl font-bold tracking-tight nav-brand-text"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Resto<span className="text-gradient">Pro</span>
          </span>
        </div>

        {/* Nav links — desktop uniquement */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-medium transition-colors duration-200 hover:text-amber-500 nav-link"
              style={{ color: "var(--text-secondary)" }}
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher variant="navbar" />

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <div style={{ width: 1, height: 24, background: "var(--border-subtle)" }} />
            {isAuthenticated ? (
              <Link href="/dashboard" className="btn-primary" style={{ padding: "0.55rem 1.4rem", fontSize: "0.875rem" }}>
                Mon espace
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="btn-outline" style={{ padding: "0.55rem 1.4rem", fontSize: "0.875rem" }}>
                  Connexion
                </Link>
                <Link href="/auth/login" className="btn-primary" style={{ padding: "0.55rem 1.4rem", fontSize: "0.875rem" }}>
                  Démo gratuite
                </Link>
              </>
            )}
          </div>

          {/* Hamburger — mobile uniquement */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* ── Drawer mobile ── */}
      {mobileOpen && (
        <div className="nav-mobile-drawer" onClick={closeMobile}>
          <div className="nav-mobile-backdrop" />
          <div className="nav-mobile-panel" onClick={(e) => e.stopPropagation()}>

            {/* Header drawer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div style={{ width: 32, height: 32, borderRadius: "0.625rem", background: "linear-gradient(135deg, #f59e0b, #d97706)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1rem", color: "#0c0a09", fontFamily: "var(--font-playfair), serif", flexShrink: 0 }}>
                  R
                </div>
                <span style={{ fontWeight: 700, fontSize: "1.1rem", fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}>
                  Resto<span style={{ background: "var(--gradient-text)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</span>
                </span>
              </div>
              <button
                onClick={closeMobile}
                style={{ width: 36, height: 36, borderRadius: "0.6rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Liens navigation */}
            <nav className="nav-mobile-links">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="nav-mobile-link"
                  onClick={closeMobile}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Actions */}
            <div className="nav-mobile-actions">
              {isAuthenticated ? (
                <Link href="/dashboard" className="btn-primary" onClick={closeMobile} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "48px", fontSize: "1rem" }}>
                  Mon espace
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="btn-outline" onClick={closeMobile} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "48px", fontSize: "1rem" }}>
                    Connexion
                  </Link>
                  <Link href="/auth/login" className="btn-primary" onClick={closeMobile} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "48px", fontSize: "1rem" }}>
                    Démo gratuite
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}