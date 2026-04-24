"use client";

const roles = [
  {
    role: "Admin",
    icon: "👑",
    desc: "Configuration complète du restaurant, gestion des abonnements et des paramètres globaux.",
  },
  {
    role: "Manager",
    icon: "📈",
    desc: "Supervision des ventes, gestion des stocks, des menus et rapports financiers détaillés.",
  },
  {
    role: "Serveur",
    icon: "🏃",
    desc: "Validation des commandes, service aux tables et encaissement physique des clients.",
  },
  {
    role: "Cuisinier",
    icon: "👨‍🍳",
    desc: "Réception des bons de commande, gestion de la préparation et validation des plats prêts.",
  },
  {
    role: "Comptable",
    icon: "📊",
    desc: "Clôture des caisses, validation des remises serveurs et suivi des dépenses journalières.",
  },
  {
    role: "Table",
    icon: "🪑",
    desc: "Accès client via QR Code pour la commande en ligne et le suivi de session.",
  },
];

export default function RolesSection() {
  return (
    <section className="py-20 px-6 bg-stone-900/30" id="roles">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 scroll-reveal">
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{
              color: "#f59e0b",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            Écosystème collaboratif
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Un outil pour <span className="text-gradient">chaque membre</span> de votre équipe
          </h2>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: "#a8a29e" }}>
            Une interface dédiée et simplifiée pour chaque rôle métier, garantissant une efficacité maximale à tous les niveaux.
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
                <div className="text-3xl bg-amber-500/10 w-14 h-14 rounded-2xl flex items-center justify-center border border-amber-500/20">
                  {r.icon}
                </div>
                <h3 className="text-xl font-bold text-white">{r.role}</h3>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "#78716c" }}>
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
