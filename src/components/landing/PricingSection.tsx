"use client";
// src/components/landing/PricingSection.tsx
// Tarifs — modules cumulables (section #tarifs). Le visiteur ACTIVE la combinaison
// qu'il veut (1, 2 ou 3 modules) ; le total se met à jour en direct.

import { useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ShoppingBag, LayoutDashboard, CalendarCheck, Check, Plus } from "lucide-react";

interface Module {
  id: string;
  nom: string;
  prix: number; // GNF / mois
  icon: ReactNode;
  desc: string;
  features: string[];
  recommande?: boolean;
}

const MODULES: Module[] = [
  {
    id: "commande",
    nom: "Commande en ligne",
    prix: 50000,
    icon: <ShoppingBag className="w-5 h-5" />,
    desc: "Vos clients commandent depuis chez vous, en livraison ou à emporter.",
    features: [
      "Commandes en ligne : livraison & à emporter",
      "Menu consultable en ligne par vos clients",
      "Compte client & panier",
      "Suivi de commande en temps réel",
    ],
  },
  {
    id: "gestion",
    nom: "Gestion interne",
    prix: 70000,
    icon: <LayoutDashboard className="w-5 h-5" />,
    desc: "Pilotez toute l'activité interne de votre restaurant.",
    features: [
      "Tables & QR codes (commande sur place)",
      "Équipe & rôles",
      "Multi-caisses (comptable, globale, coffre)",
      "Dépenses & approvisionnements",
      "Tableau de bord & statistiques",
    ],
    recommande: true,
  },
  {
    id: "reservation",
    nom: "Réservation",
    prix: 30000,
    icon: <CalendarCheck className="w-5 h-5" />,
    desc: "Gérez vos réservations et l'occupation des tables.",
    features: [
      "Réservations en ligne",
      "Gestion des tables & disponibilités",
      "Confirmations automatiques",
    ],
  },
];

const fmt = (n: number) => n.toLocaleString("fr-FR");

export default function PricingSection() {
  const [active, setActive] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setActive((a) => ({ ...a, [id]: !a[id] }));

  const selected = MODULES.filter((m) => active[m.id]);
  const total = selected.reduce((s, m) => s + m.prix, 0);
  const count = selected.length;

  return (
    <section className="py-20 px-6" id="tarifs">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14 scroll-reveal">
          <span className="section-label">Tarifs</span>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Des modules <span className="text-gradient">à activer</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg" style={{ color: "var(--text-secondary)" }}>
            Activez un, deux ou les trois modules — vous composez votre formule et ne payez que
            ce que vous activez. Prix en GNF, par mois, sans engagement.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
          {MODULES.map((m, i) => {
            const on = !!active[m.id];
            return (
              <div
                key={m.id}
                className="glass-card p-7 scroll-reveal flex flex-col h-full"
                style={{
                  animationDelay: `${i * 0.08}s`,
                  borderColor: on ? "var(--border-amber-hover)" : undefined,
                  boxShadow: on ? "0 0 0 1px var(--border-amber-hover)" : undefined,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="feature-icon flex-shrink-0">{m.icon}</div>
                  {m.recommande && (
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "var(--icon-primary)",
                        background: "var(--bg-section-alt)",
                        border: "1px solid var(--border-subtle)",
                        borderRadius: "var(--radius-full)",
                        padding: "0.2rem 0.7rem",
                      }}
                    >
                      Recommandé
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-lg mb-1" style={{ color: "var(--text-primary)" }}>
                  {m.nom}
                </h3>
                <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                  {m.desc}
                </p>

                <div className="mb-6 flex items-baseline gap-1.5">
                  <span
                    className="text-3xl font-bold"
                    style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
                  >
                    {fmt(m.prix)}
                  </span>
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    GNF / mois
                  </span>
                </div>

                <ul className="space-y-3 mb-7 flex-1">
                  {m.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Check
                        className="w-4 h-4 flex-shrink-0 mt-0.5"
                        style={{ color: "var(--icon-primary)" }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => toggle(m.id)}
                  aria-pressed={on}
                  className={on ? "btn-primary" : "btn-outline"}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.45rem",
                    padding: "0.7rem 1rem",
                    width: "100%",
                  }}
                >
                  {on ? <Check size={16} /> : <Plus size={16} />}
                  {on ? "Activé" : "Activer ce module"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Récapitulatif : total cumulé des modules activés ─────────────── */}
        <div
          className="glass-card mt-8 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
          style={count > 0 ? { borderColor: "var(--border-amber-hover)" } : undefined}
        >
          <div>
            <p className="text-xs uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
              Votre formule
            </p>
            {count === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Activez les modules dont vous avez besoin pour composer votre formule.
              </p>
            ) : (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {fmt(total)} GNF
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  / mois · {count} module{count > 1 ? "s" : ""} ({selected.map((m) => m.nom).join(", ")})
                </span>
              </div>
            )}
          </div>

          {count === 0 ? (
            <button
              type="button"
              disabled
              className="btn-outline"
              style={{ padding: "0.75rem 1.6rem", opacity: 0.5, cursor: "not-allowed", whiteSpace: "nowrap" }}
            >
              Sélectionnez un module
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="btn-primary"
              style={{ padding: "0.75rem 1.6rem", whiteSpace: "nowrap", textAlign: "center" }}
            >
              Démarrer avec {count > 1 ? "ces modules" : "ce module"}
            </Link>
          )}
        </div>

        <p className="text-center mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
          Une question sur la formule idéale ?{" "}
          <Link href="/contact" className="hover:text-amber-500 transition-colors" style={{ color: "var(--icon-primary)", fontWeight: 600 }}>
            Contactez-nous
          </Link>{" "}
          pour un devis sur mesure.
        </p>
      </div>
    </section>
  );
}
