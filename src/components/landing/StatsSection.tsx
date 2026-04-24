"use client";

const stats = [
  { value: "8", label: "Rôles utilisateurs", suffix: "", icon: "👥" },
  { value: "100", label: "% Isolé par restaurant", suffix: "%", icon: "🔒" },
  { value: "3", label: "Niveaux de caisse", suffix: "", icon: "💰" },
  { value: "QR", label: "Commande sans serveur", suffix: "", icon: "📱" },
];

export default function StatsSection() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="divider-amber w-full mb-16" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="stat-card scroll-reveal"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-3xl mb-2">{s.icon}</div>
              <div
                className="text-4xl font-extrabold text-gradient mb-1"
                style={{ fontFamily: "var(--font-playfair), serif" }}
              >
                {s.value}
                {s.suffix}
              </div>
              <div className="text-sm" style={{ color: "#78716c" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
        <div className="divider-amber w-full mt-16" />
      </div>
    </section>
  );
}
