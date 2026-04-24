"use client";

interface NavbarProps {
  scrolled: boolean;
}

export default function Navbar({ scrolled }: NavbarProps) {
  return (
    <nav className={`navbar ${scrolled ? "scrolled" : "navbar-hero"}`}>
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-bold"
          style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#0c0a09" }}
        >
          R
        </div>
        <span
          className="text-xl font-bold tracking-tight nav-brand-text"
          style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
        >
          Resto<span className="text-gradient">Pro</span>
        </span>
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {["Fonctionnalités", "Workflow", "Équipes", "Tarifs"].map((item) => (
          <a
            key={item}
            href="#"
            className="text-sm font-medium transition-colors duration-200 hover:text-amber-500 nav-link"
            style={{ color: "var(--text-secondary)" }}
          >
            {item}
          </a>
        ))}
      </div>

      {/* CTA */}
      <div className="flex items-center gap-3">
        <a
          href="#"
          className="btn-outline hidden sm:block"
          style={{ padding: "0.55rem 1.4rem", fontSize: "0.875rem" }}
        >
          Connexion
        </a>
        <a
          href="#"
          className="btn-primary"
          style={{ padding: "0.55rem 1.4rem", fontSize: "0.875rem" }}
        >
          <span>Démo gratuite</span>
        </a>
      </div>
    </nav>
  );
}