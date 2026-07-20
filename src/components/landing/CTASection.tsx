"use client";
import Link from "next/link";
import { ChefHat, Truck } from "lucide-react";
// CTASection.tsx

export default function CTASection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden" id="tarifs">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full -z-10"
        style={{ background: "transparent", filter: "blur(120px)" }}
      />

      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* ── Bloc restaurant (B2B) ─────────────────────────────────────── */}
        <div className="glass-card p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -translate-x-full pointer-events-none" />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "0.75rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", color: "#f59e0b", margin: "0 auto 0.75rem" }}><ChefHat size={22} /></div>
          <h2
            className="text-3xl sm:text-4xl font-bold mb-4"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Prêt à transformer votre{" "}
            <span className="text-gradient">restaurant ?</span>
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Rejoignez les restaurants qui font confiance à resfly pour digitaliser leur service et
            booster leur rentabilité dès aujourd'hui.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/login" className="btn-primary text-base px-8 py-3.5">
              Démarrer l'essai gratuit
            </Link>
            <button className="btn-outline text-base px-8 py-3.5">
              Prendre rendez-vous
            </button>
          </div>

          <p className="mt-6 text-sm" style={{ color: "var(--text-muted)" }}>
            * Aucune carte de crédit requise. Installation en 5 minutes.
          </p>
        </div>

        {/* ── Bloc client (B2C) ─────────────────────────────────────────── */}
        <div
          className="glass-card p-10 text-center relative overflow-hidden"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "0.75rem", background: "var(--bg-section-alt)", border: "1px solid var(--border-subtle)", color: "#f59e0b", margin: "0 auto 0.75rem" }}><Truck size={22} /></div>
          <h2
            className="text-2xl sm:text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Vous voulez commander ?
          </h2>
          <p className="text-base mb-8 max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
            Créez votre compte client gratuitement, parcourez les menus de vos restaurants
            préférés et commandez en livraison ou à emporter — en quelques secondes.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/client/register"
              className="btn-primary text-base px-8 py-3.5"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
            >
              Créer un compte client
            </Link>
            <Link href="/auth/login" className="btn-outline text-base px-8 py-3.5">
              J'ai déjà un compte
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}