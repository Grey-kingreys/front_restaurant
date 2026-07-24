"use client";
// src/app/a-propos/page.tsx

import PublicShell from "@/components/landing/PublicShell";
import Link from "next/link";
import { Target, MapPin, ShieldCheck, Sparkles } from "lucide-react";

const VALEURS = [
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Ancré en Guinée",
    desc: "Pensé pour le marché local : prix en francs guinéens (GNF), workflow adapté au terrain et au quotidien des restaurants d'ici.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Simple à adopter",
    desc: "Pas d'installation lourde, pas de matériel coûteux. Un lien, un QR code, et votre équipe est opérationnelle en quelques minutes.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Fiable et cloisonné",
    desc: "Chaque restaurant est étanche : données, équipe et caisse totalement séparés. Vos chiffres restent les vôtres.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Utile, pas gadget",
    desc: "Chaque module répond à un vrai besoin métier : commandes, caisses, réservations, statistiques. Rien de superflu.",
  },
];

export default function AProposPage() {
  return (
    <PublicShell>
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto text-center scroll-reveal">
          <span className="section-label">À propos</span>
          <h1
            className="text-4xl sm:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            La gestion de restaurant{" "}
            <span className="text-gradient">pensée pour la Guinée</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            resfly est une solution tout-en-un qui aide les restaurants guinéens à moderniser
            leur service, maîtriser leurs revenus et offrir une meilleure expérience à leurs
            clients — sans complexité ni gros investissement.
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto glass-card p-8 sm:p-10 scroll-reveal">
          <h2
            className="text-2xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Notre mission
          </h2>
          <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            Beaucoup de restaurants gèrent encore commandes, caisse et réservations à la main :
            carnets, calculatrices, tickets papier. C'est chronophage, source d'erreurs et
            difficile à suivre au quotidien.
          </p>
          <p className="text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            resfly remplace tout ça par une plateforme unique, accessible depuis un téléphone ou
            un ordinateur : la cuisine voit les commandes en temps réel, le service encaisse
            proprement, la comptabilité suit chaque mouvement, et le client commande d'un simple
            scan. Le tout à un tarif adapté à la réalité locale.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 scroll-reveal">
            <span className="section-label">Nos valeurs</span>
            <h2
              className="text-3xl sm:text-4xl font-bold"
              style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
            >
              Ce qui nous guide
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {VALEURS.map((v, i) => (
              <div
                key={v.title}
                className="glass-card p-7 scroll-reveal flex gap-5"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="feature-icon flex-shrink-0">{v.icon}</div>
                <div>
                  <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>
                    {v.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14 scroll-reveal">
            <Link href="/#tarifs" className="btn-primary text-base px-8 py-3.5">
              Découvrir les tarifs
            </Link>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
