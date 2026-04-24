"use client";

const features = [
  {
    icon: "🍽️",
    title: "Menu intelligent",
    desc: "Gérez vos plats par catégorie (Entrée, Plat, Dessert, Boisson…), activez/désactivez la disponibilité en un clic sans suppression.",
  },
  {
    icon: "📋",
    title: "Commandes en temps réel",
    desc: "Workflow complet : En attente → Prête → Servie → Payée. La cuisine valide avant le service si nécessaire.",
  },
  {
    icon: "📱",
    title: "QR Code par table",
    desc: "Chaque table scanne son QR unique. La session s'ouvre automatiquement, expire 1 minute après paiement.",
  },
  {
    icon: "🛒",
    title: "Panier persistant",
    desc: "Le panier est stocké en base de données. Chaque table voit ses articles, modifie les quantités (max 10) avant validation.",
  },
  {
    icon: "💵",
    title: "Gestion multi-caisses",
    desc: "Caisse Générale permanente, Caisse Globale journalière (auto 05h00), Caisse Comptable personnelle par agent.",
  },
  {
    icon: "📊",
    title: "Audit trail complet",
    desc: "Chaque mouvement financier est tracé. Remises serveur validées par comptable, écarts justifiés obligatoirement.",
  },
  {
    icon: "🔐",
    title: "Multi-tenant SaaS",
    desc: "Isolation totale entre restaurants. Un Super Admin gère toute la plateforme, chaque tenant est étanche.",
  },
  {
    icon: "📄",
    title: "Exports & rapports",
    desc: "Génération PDF des commandes, tickets de caisse, relevés journaliers. Tout l'historique accessible.",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 scroll-reveal">
          <span
            className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{
              color: "#f59e0b",
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.2)",
            }}
          >
            Fonctionnalités
          </span>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Tout ce dont votre restaurant{" "}
            <span className="text-gradient">a besoin</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg" style={{ color: "#a8a29e" }}>
            Une suite complète de modules métier, conçue pour le marché guinéen
            et les prix en GNF.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass-card p-6 scroll-reveal flex flex-col gap-4"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="feature-icon">{f.icon}</div>
              <div>
                <h3 className="font-bold text-base mb-2 text-white">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#78716c" }}>
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
