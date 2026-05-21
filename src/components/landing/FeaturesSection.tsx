"use client";

import { 
  Menu, 
  ClipboardList, 
  QrCode, 
  ShoppingCart, 
  Banknote, 
  BarChart3, 
  ShieldCheck, 
  Download 
} from "lucide-react";

const icons = {
  menu: <Menu className="w-6 h-6" />,
  orders: <ClipboardList className="w-6 h-6" />,
  qr: <QrCode className="w-6 h-6" />,
  cart: <ShoppingCart className="w-6 h-6" />,
  cash: <Banknote className="w-6 h-6" />,
  audit: <BarChart3 className="w-6 h-6" />,
  multitenant: <ShieldCheck className="w-6 h-6" />,
  export: <Download className="w-6 h-6" />,
};

const features = [
  {
    icon: icons.menu,
    title: "Menu intelligent",
    desc: "Gérez vos plats par catégorie, activez/désactivez la disponibilité en un clic sans suppression.",
  },
  {
    icon: icons.orders,
    title: "Commandes en temps réel",
    desc: "Workflow complet : En attente → Prête → Servie → Payée. La cuisine valide avant le service si nécessaire.",
  },
  {
    icon: icons.qr,
    title: "QR Code par table",
    desc: "Chaque table scanne son QR unique. La session s'ouvre automatiquement, expire 1 minute après paiement.",
  },
  {
    icon: icons.cart,
    title: "Panier persistant",
    desc: "Le panier est stocké en base de données. Chaque table voit ses articles, modifie les quantités avant validation.",
  },
  {
    icon: icons.cash,
    title: "Gestion multi-caisses",
    desc: "Caisse Générale permanente, Caisse Globale journalière (auto 05h00), Caisse Comptable personnelle par agent.",
  },
  {
    icon: icons.audit,
    title: "Audit trail complet",
    desc: "Chaque mouvement financier est tracé. Remises serveur validées par comptable, écarts justifiés obligatoirement.",
  },
  {
    icon: icons.multitenant,
    title: "Multi-tenant SaaS",
    desc: "Isolation totale entre restaurants. Un Super Admin gère toute la plateforme, chaque tenant est étanche.",
  },
  {
    icon: icons.export,
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
          <span className="section-label">Fonctionnalités</span>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Tout ce dont votre restaurant{" "}
            <span className="text-gradient">a besoin</span>
          </h2>
          <p className="max-w-xl mx-auto text-lg" style={{ color: "var(--text-secondary)" }}>
            Une suite complète de modules métier, conçue pour le marché guinéen et les prix en GNF.
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