"use client";

const steps = [
  {
    title: "Le client scanne le QR Code",
    desc: "Chaque table possède un identifiant unique. Le scan ouvre une session sécurisée sans application à installer.",
  },
  {
    title: "Commande en autonomie",
    desc: "Le client choisit ses plats. Le panier est synchronisé en temps réel avec le serveur et la cuisine.",
  },
  {
    title: "Validation et Préparation",
    desc: "La cuisine reçoit l'alerte. Les cuisiniers marquent les plats comme prêts dès qu'ils sortent du feu.",
  },
  {
    title: "Service et Paiement",
    desc: "Le serveur apporte la commande. Le paiement clôture la session et libère la table pour le prochain client.",
  },
];

export default function WorkflowSection() {
  return (
    <section className="py-20 px-6 relative overflow-hidden" id="workflow">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left: Content */}
          <div className="lg:w-1/2 scroll-reveal">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
              style={{
                color: "#f59e0b",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              Expérience fluide
            </span>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-6"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Un workflow optimisé pour{" "}
              <span className="text-gradient">la rapidité</span>
            </h2>
            <p className="text-lg mb-8" style={{ color: "#a8a29e" }}>
              Réduisez le temps d'attente et augmentez la rotation des tables grâce à un processus digitalisé de bout en bout.
            </p>

            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="workflow-step group">
                  <div className="workflow-number">{i + 1}</div>
                  <div>
                    <h4 className="font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-sm" style={{ color: "#78716c" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Illustration/Image */}
          <div className="lg:w-1/2 relative scroll-reveal animate-fade-right">
            <div className="relative z-10 glass-card p-4 overflow-hidden aspect-[4/5] sm:aspect-video lg:aspect-square flex items-center justify-center">
               <div className="text-center">
                  <div className="text-6xl mb-4 animate-float">📱</div>
                  <div className="text-gradient font-bold text-2xl mb-2">Interface Mobile</div>
                  <p className="text-sm px-8" style={{ color: "#78716c" }}>
                    Visualisation intuitive du menu et suivi de commande en direct pour vos clients.
                  </p>
               </div>
               
               {/* Decorative elements */}
               <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-amber-500/10 blur-xl"></div>
               <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-amber-500/5 blur-2xl"></div>
            </div>
            
            {/* Background glow */}
            <div className="absolute -inset-4 bg-amber-500/10 blur-3xl rounded-full -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
