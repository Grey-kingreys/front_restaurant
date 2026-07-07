"use client";

import { QrCode, ShoppingBag, CookingPot, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: <QrCode className="w-5 h-5" />,
    title: "Le client scanne le QR Code",
    desc: "Chaque table possède un identifiant unique. Le scan ouvre une session sécurisée sans application à installer.",
  },
  {
    icon: <ShoppingBag className="w-5 h-5" />,
    title: "Commande en autonomie",
    desc: "Le client choisit ses plats. Le panier est synchronisé en temps réel avec le serveur et la cuisine.",
  },
  {
    icon: <CookingPot className="w-5 h-5" />,
    title: "Validation et Préparation",
    desc: "La cuisine reçoit l'alerte. Les cuisiniers marquent les plats comme prêts dès qu'ils sortent du feu.",
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: "Service et Paiement",
    desc: "Le serveur apporte la commande. Le paiement clôture la session et libère la table pour le prochain client.",
  },
];

export default function WorkflowSection() {
  return (
    <section className="py-20 px-6 relative overflow-hidden" id="workflow">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left: Content */}
          <div className="lg:w-1/2 scroll-reveal">
            <span className="section-label">Expérience fluide</span>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-6"
              style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
            >
              Un workflow optimisé pour{" "}
              <span className="text-gradient">la rapidité</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
              Réduisez le temps d'attente et augmentez la rotation des tables grâce à un processus
              digitalisé de bout en bout.
            </p>

            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="workflow-step group">
                  <div className="workflow-number">{i + 1}</div>
                  <div>
                    <h4
                      className="font-bold mb-1 transition-colors"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {step.title}
                    </h4>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="lg:w-1/2 relative scroll-reveal animate-fade-right">
            <div
              className="relative z-10 glass-card p-8 overflow-hidden"
              style={{ minHeight: 340 }}
            >
              {/* Phone mockup illustration */}
              <div className="flex flex-col items-center gap-6">
                {/* Header */}
                <div className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0c0a09" }}
                    >
                      R
                    </div>
                    <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                      Table 7
                    </span>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full font-semibold"
                    style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}
                  >
                    ● Session active
                  </span>
                </div>

                {/* Fake order items */}
                {[
                  { name: "Thiéboudienne Royale", price: "45 000 GNF", status: "PRÊTE", color: "#22c55e" },
                  { name: "Jus de Gingembre", price: "8 000 GNF", status: "EN ATTENTE", color: "#f59e0b" },
                  { name: "Attiéké Poisson", price: "35 000 GNF", status: "SERVIE", color: "#3b82f6" },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{
                      background: "var(--bg-section-alt)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {item.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {item.price}
                      </p>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ color: item.color, background: `${item.color}15`, border: `1px solid ${item.color}30` }}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}

                {/* Total */}
                <div className="w-full flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border-amber)" }}>
                  <span className="font-bold" style={{ color: "var(--text-primary)" }}>Total</span>
                  <span className="font-extrabold text-lg text-gradient">88 000 GNF</span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-amber-500/10 blur-xl pointer-events-none" />
              <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
            </div>

            {/* Background glow */}
            <div className="absolute -inset-4 bg-amber-500/10 blur-3xl rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}