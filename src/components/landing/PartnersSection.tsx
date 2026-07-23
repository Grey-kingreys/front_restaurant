"use client";
// src/components/landing/PartnersSection.tsx
// Partenaires (section #partenaires). Data-driven via src/lib/partenaires.ts.
// Liste vide -> encart « devenir partenaire » ; liste remplie -> grille de logos.

import Link from "next/link";
import { Handshake } from "lucide-react";
import { PARTENAIRES } from "@/lib/partenaires";

export default function PartnersSection() {
  const hasPartners = PARTENAIRES.length > 0;

  return (
    <section
      className="py-20 px-6"
      id="partenaires"
      style={{
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="max-w-5xl mx-auto text-center">
        <div className="scroll-reveal">
          <span className="section-label">Partenaires</span>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Ils nous font <span className="text-gradient">confiance</span>
          </h2>
          <p className="max-w-lg mx-auto text-base" style={{ color: "var(--text-secondary)" }}>
            resfly s'appuie sur un réseau de partenaires locaux pour servir au mieux les
            restaurants guinéens.
          </p>
        </div>

        {hasPartners ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5 mt-12">
            {PARTENAIRES.map((p) => {
              const inner = (
                <div
                  className="glass-card flex items-center justify-center p-6"
                  style={{ minHeight: 110 }}
                  title={p.description ?? p.nom}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.logoUrl}
                    alt={p.nom}
                    style={{ maxHeight: 56, maxWidth: "100%", objectFit: "contain" }}
                  />
                </div>
              );
              return p.siteUrl ? (
                <a key={p.nom} href={p.siteUrl} target="_blank" rel="noopener noreferrer">
                  {inner}
                </a>
              ) : (
                <div key={p.nom}>{inner}</div>
              );
            })}
          </div>
        ) : (
          <div
            className="glass-card scroll-reveal mt-12 mx-auto flex flex-col items-center text-center p-10"
            style={{ maxWidth: 480 }}
          >
            <div
              className="feature-icon flex-shrink-0"
              style={{ marginBottom: "1rem" }}
            >
              <Handshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
              Devenez partenaire
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Vous êtes un acteur du secteur (paiement mobile, livraison, équipement…) et
              souhaitez collaborer avec resfly ? Écrivez-nous.
            </p>
            <Link href="/contact" className="btn-outline" style={{ padding: "0.6rem 1.5rem" }}>
              Nous contacter
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
