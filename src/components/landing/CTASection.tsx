"use client";

export default function CTASection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full -z-10"></div>
      
      <div className="max-w-4xl mx-auto glass-card p-12 text-center relative overflow-hidden border-amber-500/30">
        {/* Shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full animate-[shimmer_5s_infinite] pointer-events-none"></div>

        <h2 
          className="text-4xl sm:text-5xl font-bold mb-6 text-white"
          style={{ fontFamily: "var(--font-playfair), serif" }}
        >
          Prêt à transformer votre <span className="text-gradient">restaurant ?</span>
        </h2>
        <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "#a8a29e" }}>
          Rejoignez les restaurants qui font confiance à RestoPro pour digitaliser leur service et booster leur rentabilité dès aujourd'hui.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn-primary text-lg px-10 py-4 animate-pulse-glow">
            <span>Démarrer l'essai gratuit</span>
          </button>
          <button className="btn-outline text-lg px-10 py-4">
            Prendre rendez-vous
          </button>
        </div>
        
        <p className="mt-8 text-sm" style={{ color: "#57534e" }}>
          * Aucune carte de crédit requise. Installation en 5 minutes.
        </p>
      </div>
    </section>
  );
}
