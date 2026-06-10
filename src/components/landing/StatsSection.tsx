"use client";

import { Users, ShieldCheck, Banknote, QrCode } from "lucide-react";

const stats = [
  {
    value: "8",
    label: "Rôles utilisateurs",
    suffix: "",
    icon: <Users className="w-7 h-7" />,
  },
  {
    value: "100",
    label: "% Isolé par restaurant",
    suffix: "%",
    icon: <ShieldCheck className="w-7 h-7" />,
  },
  {
    value: "3",
    label: "Niveaux de caisse",
    suffix: "",
    icon: <Banknote className="w-7 h-7" />,
  },
  {
    value: "QR",
    label: "Commande sans serveur",
    suffix: "",
    icon: <QrCode className="w-7 h-7" />,
  },
];

export default function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="divider-amber w-full mb-16" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="stat-card scroll-reveal"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="flex justify-center mb-3"
                style={{ color: "var(--icon-primary)" }}
              >
                {s.icon}
              </div>
              <div
                className="text-4xl font-extrabold text-gradient mb-1"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {s.value}
                {s.suffix}
              </div>
              <div className="text-sm" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="divider-amber w-full mt-16" />
      </div>
    </section>
  );
}