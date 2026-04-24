"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-16 px-6 border-t border-amber-500/10 bg-stone-950">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#0c0a09",
                }}
              >
                R
              </div>
              <span
                className="text-lg font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                Resto<span className="text-gradient">Pro</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#78716c" }}>
              La solution SaaS de gestion de restaurant n°1 en Guinée. Modernisez votre service, maîtrisez vos revenus.
            </p>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Produit</h4>
            <ul className="space-y-4 text-sm" style={{ color: "#78716c" }}>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">QR Code Menu</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Gestion Caisse</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Tarifs</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Entreprise</h4>
            <ul className="space-y-4 text-sm" style={{ color: "#78716c" }}>
              <li><a href="#" className="hover:text-amber-500 transition-colors">À propos</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-amber-500 transition-colors">Partenaires</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Contact</h4>
            <ul className="space-y-4 text-sm" style={{ color: "#78716c" }}>
              <li className="flex items-center gap-2">📍 Conakry, Guinée</li>
              <li className="flex items-center gap-2">📧 contact@restopro.gn</li>
              <li className="flex items-center gap-2">📞 +224 000 00 00 00</li>
            </ul>
          </div>
        </div>

        <div className="divider-amber opacity-20 mb-8"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs" style={{ color: "#57534e" }}>
          <p>© {currentYear} RestoPro SaaS. Tous droits réservés.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-amber-500 transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
