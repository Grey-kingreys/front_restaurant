"use client";
// CTASection.tsx

export default function CTASection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full -z-10"
        style={{ background: "rgba(245,158,11,0.08)", filter: "blur(120px)" }}
      />

      <div className="max-w-4xl mx-auto glass-card p-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full pointer-events-none" />

        <h2
          className="text-4xl sm:text-5xl font-bold mb-6"
          style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
        >
          Prêt à transformer votre{" "}
          <span className="text-gradient">restaurant ?</span>
        </h2>
        <p className="text-lg mb-10 max-w-2xl mx-auto" style={{ color: "var(--text-secondary)" }}>
          Rejoignez les restaurants qui font confiance à RestoPro pour digitaliser leur service et
          booster leur rentabilité dès aujourd'hui.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <button className="btn-primary text-lg px-10 py-4 animate-pulse-glow">
            <span>Démarrer l'essai gratuit</span>
          </button>
          <button className="btn-outline text-lg px-10 py-4">
            Prendre rendez-vous
          </button>
        </div>

        <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
          * Aucune carte de crédit requise. Installation en 5 minutes.
        </p>
      </div>
    </section>
  );
}