"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="py-16 px-6"
      style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "var(--bg-card)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="mb-6">
              <Logo size={30} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              La solution SaaS de gestion de restaurant en Guinée. Modernisez votre service,
              maîtrisez vos revenus.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h4
              className="font-bold mb-6 text-sm uppercase tracking-widest"
              style={{ color: "var(--text-primary)" }}
            >
              Produit
            </h4>
            <ul className="space-y-4 text-sm" style={{ color: "var(--text-muted)" }}>
              {[
                { label: "Fonctionnalités", href: "/#features" },
                { label: "QR Code Menu", href: "/#workflow" },
                { label: "Gestion Caisse", href: "/#features" },
                { label: "Tarifs", href: "/#tarifs" },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.href} className="hover:text-amber-500 transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h4
              className="font-bold mb-6 text-sm uppercase tracking-widest"
              style={{ color: "var(--text-primary)" }}
            >
              Entreprise
            </h4>
            <ul className="space-y-4 text-sm" style={{ color: "var(--text-muted)" }}>
              {[
                { label: "À propos", href: "/a-propos" },
                { label: "Contact", href: "/contact" },
                { label: "Blog", href: "/blog" },
                { label: "Partenaires", href: "/#partenaires" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-amber-500 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-bold mb-6 text-sm uppercase tracking-widest"
              style={{ color: "var(--text-primary)" }}
            >
              Contact
            </h4>
            <ul className="space-y-4 text-sm" style={{ color: "var(--text-muted)" }}>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--icon-primary)" }}>
                  <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6c0 4.615 6 10 6 10s6-5.385 6-10a6 6 0 00-6-6zm0 8.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" clipRule="evenodd" />
                </svg>
                Conakry, Guinée
              </li>
              <li>
                <a href="mailto:soulmamoudou0@gmail.com" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--icon-primary)" }}>
                    <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                    <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                  </svg>
                  soulmamoudou0@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+224624815998" className="flex items-center gap-2 hover:text-amber-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--icon-primary)" }}>
                    <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5A15 15 0 0 1 2 3.5Z" clipRule="evenodd" />
                  </svg>
                  +224 624 81 59 98
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-amber opacity-30 mb-8" />

        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <p>© {currentYear} resfly SaaS. Tous droits réservés.</p>
          <div className="flex gap-8">
            {["Mentions légales", "Confidentialité", "Cookies"].map((item) => (
              <a key={item} href="#" className="hover:text-amber-500 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}