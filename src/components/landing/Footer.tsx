"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="py-16 px-6"
      style={{
        borderTop: "1px solid var(--border-amber)",
        background: "var(--bg-card)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0c0a09" }}
              >
                R
              </div>
              <span
                className="text-lg font-bold tracking-tight"
                style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
              >
                Resto<span className="text-gradient">Pro</span>
              </span>
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
              {["Fonctionnalités", "QR Code Menu", "Gestion Caisse", "Tarifs"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    {item}
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
              {["À propos", "Contact", "Blog", "Partenaires"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-amber-500 transition-colors">
                    {item}
                  </a>
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
                  <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 15.227 17 12.incentive 17 9.5a7 7 0 1 0-14 0c0 2.757 1.71 5.222 3.354 6.984a16.42 16.42 0 0 0 2.274 1.765c.311.194.571.337.757.434a5.61 5.61 0 0 0 .282.14l.017.008.006.003ZM10 11.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" clipRule="evenodd" />
                </svg>
                Conakry, Guinée
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--icon-primary)" }}>
                  <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
                  <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                </svg>
                contact@restopro.gn
              </li>
              <li className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0" style={{ color: "var(--icon-primary)" }}>
                  <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h1.148a1.5 1.5 0 0 1 1.465 1.175l.716 3.223a1.5 1.5 0 0 1-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 0 0 6.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 0 1 1.767-1.052l3.223.716A1.5 1.5 0 0 1 18 15.352V16.5a1.5 1.5 0 0 1-1.5 1.5A15 15 0 0 1 2 3.5Z" clipRule="evenodd" />
                </svg>
                +224 000 00 00 00
              </li>
            </ul>
          </div>
        </div>

        <div className="divider-amber opacity-30 mb-8" />

        <div
          className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          <p>© {currentYear} RestoPro SaaS. Tous droits réservés.</p>
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