"use client";

import { ClipboardList, QrCode, Banknote, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: <ClipboardList className="w-6 h-6" />,
    title: "Commandes en temps réel",
    desc: "Workflow complet cuisine → service → paiement. Chaque rôle voit exactement ce qu'il doit faire, sans friction.",
  },
  {
    icon: <QrCode className="w-6 h-6" />,
    title: "QR Code par table",
    desc: "Le client scanne, commande, suit sa session — sans application à installer. La table se libère automatiquement après paiement.",
  },
  {
    icon: <Banknote className="w-6 h-6" />,
    title: "Gestion multi-caisses",
    desc: "Caisse comptable, caisse globale journalière et coffre permanent. Chaque mouvement est tracé et validé.",
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Multi-restaurant isolé",
    desc: "Chaque restaurant est étanche. Données, équipe et caisse complètement séparés — même plateforme, zéro mélange.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6" id="features">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14 scroll-reveal">
          <span className="section-label">Fonctionnalités</span>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Tout ce dont votre restaurant{" "}
            <span className="text-gradient">a besoin</span>
          </h2>
          <p className="max-w-lg mx-auto text-lg" style={{ color: "var(--text-secondary)" }}>
            Une suite de modules métier conçue pour le marché guinéen, avec les prix en GNF.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass-card p-7 scroll-reveal flex gap-5"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="feature-icon flex-shrink-0">{f.icon}</div>
              <div>
                <h3 className="font-bold text-base mb-2" style={{ color: "var(--text-primary)" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}