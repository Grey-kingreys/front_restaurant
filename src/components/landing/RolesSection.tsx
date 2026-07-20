"use client";

import { 
  ShieldCheck, 
  BarChart, 
  ShoppingBag, 
  CookingPot, 
  Wallet, 
  QrCode 
} from "lucide-react";

const icons = {
  admin: <ShieldCheck className="w-7 h-7" />,
  manager: <BarChart className="w-7 h-7" />,
  waiter: <ShoppingBag className="w-7 h-7" />,
  chef: <CookingPot className="w-7 h-7" />,
  accountant: <Wallet className="w-7 h-7" />,
  table: <QrCode className="w-7 h-7" />,
};

const roles = [
  {
    icon: icons.admin,
    role: "Admin",
    desc: "Configuration complète du restaurant, gestion des abonnements et des paramètres globaux.",
  },
  {
    icon: icons.manager,
    role: "Manager",
    desc: "Supervision des ventes, gestion des menus, exports et rapports financiers détaillés.",
  },
  {
    icon: icons.waiter,
    role: "Serveur",
    desc: "Validation des commandes, service aux tables et encaissement physique des clients.",
  },
  {
    icon: icons.chef,
    role: "Cuisinier",
    desc: "Réception des bons de commande, gestion de la préparation et validation des plats prêts.",
  },
  {
    icon: icons.accountant,
    role: "Comptable",
    desc: "Clôture des caisses, validation des remises serveurs et suivi des dépenses journalières.",
  },
  {
    icon: icons.table,
    role: "Table",
    desc: "Accès client via QR Code pour la commande en ligne et le suivi de session.",
  },
];

export default function RolesSection() {
  return (
    <section
      className="py-20 px-6"
      id="roles"
      style={{ background: "var(--bg-section-alt)" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <span className="section-label">Écosystème collaboratif</span>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Un outil pour{" "}
            <span className="text-gradient">chaque membre</span> de votre équipe
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: "var(--text-secondary)" }}>
            Une interface dédiée et simplifiée pour chaque rôle métier, garantissant une efficacité
            maximale à tous les niveaux.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((r, i) => (
            <div
              key={r.role}
              className="glass-card p-8 scroll-reveal"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "var(--bg-section-alt)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--icon-primary)",
                  }}
                >
                  {r.icon}
                </div>
                <h3 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {r.role}
                </h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {r.desc}
              </p>
              <div className="mt-6 flex justify-end">
                <span className="role-badge">Module {r.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}