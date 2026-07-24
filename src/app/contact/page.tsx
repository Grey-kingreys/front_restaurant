"use client";
// src/app/contact/page.tsx

import { useState } from "react";
import PublicShell from "@/components/landing/PublicShell";
import { envoyerContact } from "@/lib/api/public";
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Loader2 } from "lucide-react";

// Coordonnées (temporaires jusqu'à l'achat du domaine).
const TEL_DISPLAY = "+224 624 81 59 98";
const TEL_RAW = "224624815998"; // pour tel: et wa.me
const EMAIL = "soulmamoudou0@gmail.com";

const COORDONNEES = [
  {
    icon: <Phone className="w-5 h-5" />,
    label: "Téléphone",
    value: TEL_DISPLAY,
    href: `tel:+${TEL_RAW}`,
  },
  {
    icon: <MessageCircle className="w-5 h-5" />,
    label: "WhatsApp",
    value: TEL_DISPLAY,
    href: `https://wa.me/${TEL_RAW}`,
  },
  {
    icon: <Mail className="w-5 h-5" />,
    label: "Email",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    label: "Adresse",
    value: "Conakry, Guinée",
  },
];

export default function ContactPage() {
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setFeedback("");
    try {
      const res = await envoyerContact({ nom, email, message });
      if (res.success) {
        setStatus("sent");
        setNom("");
        setEmail("");
        setMessage("");
      } else {
        setStatus("error");
        setFeedback(res.message || "L'envoi a échoué. Réessayez.");
      }
    } catch {
      setStatus("error");
      setFeedback("Connexion au serveur impossible. Réessayez plus tard.");
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.7rem 0.9rem",
    borderRadius: "var(--radius-lg)",
    background: "var(--bg-section-alt)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)",
    fontSize: "0.9rem",
    outline: "none",
  };

  return (
    <PublicShell>
      <section className="px-6 pb-8">
        <div className="max-w-3xl mx-auto text-center scroll-reveal">
          <span className="section-label">Contact</span>
          <h1
            className="text-4xl sm:text-5xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair), serif", color: "var(--text-primary)" }}
          >
            Parlons de votre <span className="text-gradient">restaurant</span>
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Une question, une démo, un devis ? Écrivez-nous ou appelez directement — on répond
            vite.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 items-start">
          {/* Coordonnées */}
          <div className="scroll-reveal flex flex-col gap-3">
            {COORDONNEES.map((c) => {
              const inner = (
                <div className="glass-card p-5 flex items-center gap-4">
                  <div className="feature-icon flex-shrink-0">{c.icon}</div>
                  <div>
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: "var(--text-muted)" }}>
                      {c.label}
                    </p>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {c.value}
                    </p>
                  </div>
                </div>
              );
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("http") ? "_blank" : undefined}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {inner}
                </a>
              ) : (
                <div key={c.label}>{inner}</div>
              );
            })}
          </div>

          {/* Formulaire (compose un email via le client mail) */}
          <form onSubmit={handleSubmit} className="glass-card p-7 scroll-reveal flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Votre nom
              </label>
              <input
                type="text"
                required
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom du restaurant ou votre nom"
                style={fieldStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Votre email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                style={fieldStyle}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Votre message
              </label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Dites-nous en quelques mots ce dont vous avez besoin…"
                rows={5}
                style={{ ...fieldStyle, resize: "vertical" }}
              />
            </div>
            {status === "sent" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.85rem 1rem",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--bg-section-alt)",
                  border: "1px solid var(--border-subtle)",
                  color: "var(--text-primary)",
                  fontSize: "0.9rem",
                }}
              >
                <CheckCircle2 size={18} style={{ color: "#16a34a", flexShrink: 0 }} />
                Message envoyé ! Nous vous répondrons rapidement à l'adresse indiquée.
              </div>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-primary"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1rem",
                    opacity: status === "sending" ? 0.7 : 1,
                    cursor: status === "sending" ? "wait" : "pointer",
                  }}
                >
                  {status === "sending" ? (
                    <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
                  ) : (
                    <Send size={16} />
                  )}
                  {status === "sending" ? "Envoi…" : "Envoyer le message"}
                </button>
                {status === "error" && (
                  <p className="text-xs text-center" style={{ color: "#dc2626" }}>
                    {feedback}
                  </p>
                )}
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  Nous répondons directement à l'email que vous indiquez.
                </p>
              </>
            )}
          </form>
        </div>
      </section>
    </PublicShell>
  );
}
