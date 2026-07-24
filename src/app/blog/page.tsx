"use client";
// src/app/blog/page.tsx

import PublicShell from "@/components/landing/PublicShell";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { ARTICLES } from "@/lib/blog";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default function BlogPage() {
  const hasArticles = ARTICLES.length > 0;

  return (
    <PublicShell>
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto text-center scroll-reveal">
          <span className="section-label">Blog</span>
          <h1
            className="text-4xl sm:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Conseils & <span className="text-gradient">actualités</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Astuces de gestion, retours d'expérience et nouveautés produit pour les restaurants
            guinéens.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          {hasArticles ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ARTICLES.map((a, i) => (
                <article
                  key={a.slug}
                  className="glass-card p-6 scroll-reveal flex flex-col"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
                    {formatDate(a.date)}
                    {a.auteur ? ` · ${a.auteur}` : ""}
                  </p>
                  <h2 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                    {a.titre}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {a.extrait}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div
              className="glass-card scroll-reveal mx-auto flex flex-col items-center text-center p-10"
              style={{ maxWidth: 480 }}
            >
              <div className="feature-icon flex-shrink-0" style={{ marginBottom: "1rem" }}>
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--text-primary)" }}>
                Nos premiers articles arrivent bientôt
              </h3>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                On prépare du contenu utile pour vous aider à mieux gérer votre restaurant. En
                attendant, une question ? On y répond avec plaisir.
              </p>
              <Link href="/contact" className="btn-outline" style={{ padding: "0.6rem 1.5rem" }}>
                Nous contacter
              </Link>
            </div>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
