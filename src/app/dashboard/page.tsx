"use client";
// src/app/dashboard/page.tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROLE_COLORS, NAV_CONFIG } from "@/lib/navigation";
import type { Role } from "@/types";
import { cssVar, typography, radius, spacing, roleBadge, avatarBase, btnOutline } from "@/theme/theme";
import StatCard from "@/components/dashboard/StatCard";
import { getDashboardStats, DashboardStats } from "@/lib/api/dashboard";
import { 
  TrendingUp, 
  Users, 
  ChefHat, 
  Utensils, 
  QrCode, 
  CreditCard, 
  Clock, 
  AlertTriangle,
  ArrowRight,
  Plus
} from "lucide-react";

const WELCOME: Record<Role, { subtitle: string }> = {
  Rsuper_admin: { subtitle: "Gérez tous les restaurants et consultez les statistiques globales." },
  Radmin: { subtitle: "Gérez votre équipe, votre menu et vos finances." },
  Rmanager: { subtitle: "Supervisez les opérations et les performances." },
  Rserveur: { subtitle: "Consultez vos tables et validez les paiements." },
  Rchef_cuisinier: { subtitle: "Gérez le menu et la file des commandes." },
  Rcuisinier: { subtitle: "Consultez la file et marquez les plats comme prêts." },
  Rcomptable: { subtitle: "Gérez votre caisse et suivez les dépenses." },
  Rtable: { subtitle: "Consultez le menu et suivez votre commande." },
};

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState<string>("");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/auth/login");
    if (!authLoading && user?.must_change_password) router.replace("/auth/change-password");
    
    if (isAuthenticated && user) {
      loadStats();
    }
  }, [authLoading, isAuthenticated, user, router]);

  async function loadStats() {
    try {
      setStatsLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Erreur stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: cssVar.bgDark }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: `3px solid ${cssVar.borderAmber}`, borderTopColor: cssVar.amberGlow, animation: "spin .75s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  const role = user.role as Role;
  const rc = ROLE_COLORS[role];
  const sections = NAV_CONFIG[role];
  const subtitle = WELCOME[role].subtitle;

  const initials = user.nom_complet
    ? user.nom_complet.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : user.login.slice(0, 2).toUpperCase();
  const firstName = user.nom_complet?.split(" ")[0] || user.login;

  return (
    <>
      <style>{`
        .dash-root  { min-height:100vh; background:var(--bg-dark); padding:1.5rem 1rem 3rem; }
        .dash-inner { max-width:1100px; margin:0 auto; position:relative; z-index:1; }

        /* Hero */
        .dash-hero  { 
          background: var(--bg-card); 
          border: 1px solid var(--border-subtle); 
          border-radius: 1.25rem; 
          padding: 1.5rem; 
          margin-bottom: 2rem; 
          display: flex; 
          align-items: center; 
          gap: 1.25rem; 
          box-shadow: var(--shadow-card);
          position: relative;
          overflow: hidden;
        }
        .dash-hero::after {
          content: "";
          position: absolute;
          top: 0; right: 0;
          width: 30%; height: 100%;
          background: linear-gradient(to left, rgba(245,158,11,0.03), transparent);
          pointer-events: none;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          margin-bottom: 2rem;
        }

        /* Sections Grid */
        .main-grid {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: 1fr;
        }

        @media(min-width: 1024px) {
          .main-grid { grid-template-columns: 2fr 1fr; }
        }

        .section-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 1.25rem;
          overflow: hidden;
        }
        .section-header {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .section-title {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin: 0;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 0.75rem;
          padding: 1.25rem;
        }
        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 1rem;
          background: var(--bg-section-alt);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.2s;
          text-align: center;
        }
        .action-btn:hover {
          border-color: var(--amber-glow);
          color: var(--amber-glow);
          transform: translateY(-2px);
          background: var(--icon-bg);
        }
        .action-icon {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.5rem;
          background: var(--icon-bg);
          color: var(--icon-primary);
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid var(--border-subtle);
          transition: background 0.2s;
        }
        .activity-item:last-child { border-bottom: none; }
        .activity-item:hover { background: var(--bg-section-alt); }

        .dash-footer { text-align:center; margin-top:2.5rem; font-size:0.75rem; color:var(--text-muted); }
      `}</style>

      {/* Glow fond */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "50vh", pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(245,158,11,0.08) 0%, transparent 80%)" }} />

      <div className="dash-root">
        <div className="dash-inner">

          {/* Header Dashboard */}
          <div className="dash-hero">
            <div style={avatarBase(56)}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontWeight: 800, fontSize: "1.5rem", color: cssVar.textPrimary, fontFamily: typography.fontSerif, margin: "0 0 0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Bonjour, {firstName} !
              </h1>
              <p style={{ fontSize: "0.875rem", color: cssVar.textMuted, margin: 0, lineHeight: 1.4 }}>{subtitle}</p>
              <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={roleBadge(rc.bg, rc.text, rc.border)}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: rc.text, display: "inline-block" }} />
                  {ROLE_LABELS[role]}
                </span>
                {user.restaurant_nom && (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    📍 {user.restaurant_nom}
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: "none" }} className="lg:block">
               <Link href="/profil" style={btnOutline}>Mon profil</Link>
            </div>
          </div>

          {/* Widgets de Statistiques selon le rôle */}
          <div className="stats-grid">
            {statsLoading ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: 120, background: "var(--bg-section-alt)", borderRadius: "1.25rem", animation: "pulse 1.5s infinite" }} />
              ))
            ) : stats ? (
              <>
                {role === "Radmin" && (
                  <>
                    <StatCard title="Revenus du jour" value={`${Number(stats.revenu_aujourdhui || 0).toLocaleString()} GNF`} icon={TrendingUp} trend={{ value: 12, isUp: true }} />
                    <StatCard title="Commandes actives" value={stats.commandes_actives || 0} icon={Utensils} color="#3b82f6" />
                    <StatCard title="Tables occupées" value={stats.tables_occupees || 0} icon={QrCode} color="#10b981" />
                    <StatCard title="Staff présent" value={stats.total_staff || 0} icon={Users} color="#a855f7" />
                  </>
                )}
                {role === "Rchef_cuisinier" && (
                  <>
                    <StatCard title="En attente" value={stats.en_attente || 0} icon={Clock} color="#ef4444" description="Commandes non préparées" />
                    <StatCard title="En préparation" value={stats.en_preparation || 0} icon={ChefHat} color="#f59e0b" />
                    <StatCard title="Plats prêts" value={stats.plats_prets_aujourdhui || 0} icon={TrendingUp} color="#10b981" description="Aujourd'hui" />
                    <StatCard title="Indisponibles" value={stats.plats_indisponibles || 0} icon={AlertTriangle} color="#f97316" />
                  </>
                )}
                {role === "Rtable" && (
                  <>
                    <StatCard title="Panier" value={`${stats.panier_count || 0} articles`} icon={Utensils} color="#3b82f6" />
                    <StatCard title="Status Commande" value={stats.derniere_commande_statut || "Aucune"} icon={Clock} color="#f59e0b" description={stats.derniere_commande_id ? `Commande #${stats.derniere_commande_id}` : ""} />
                    <StatCard title="Total" value="Calcul en cours..." icon={CreditCard} color="#22c55e" />
                  </>
                )}
                {role === "Rsuper_admin" && (
                  <>
                    <StatCard title="Restaurants" value={stats.total_restaurants || 0} icon={TrendingUp} color="#f59e0b" />
                    <StatCard title="Utilisateurs" value={stats.total_utilisateurs || 0} icon={Users} color="#3b82f6" />
                    <StatCard title="Revenus Mensuels" value={`${Number(stats.total_revenu_global || 0).toLocaleString()} GNF`} icon={CreditCard} color="#10b981" />
                  </>
                )}
                {role === "Rmanager" && (
                  <>
                    <StatCard title="Revenus du jour" value={`${Number(stats.revenu_aujourdhui || 0).toLocaleString()} GNF`} icon={TrendingUp} trend={{ value: 12, isUp: true }} />
                    <StatCard title="Commandes actives" value={stats.commandes_actives || 0} icon={Utensils} color="#3b82f6" />
                    <StatCard title="Tables occupées" value={stats.tables_occupees || 0} icon={QrCode} color="#10b981" />
                    <StatCard title="Staff présent" value={stats.total_staff || 0} icon={Users} color="#a855f7" />
                  </>
                )}
                {role === "Rserveur" && (
                  <>
                    <StatCard title="Tables actives" value={stats.tables_occupees || 0} icon={QrCode} color="#3b82f6" />
                    <StatCard title="Commandes en cours" value={stats.commandes_actives || 0} icon={Utensils} color="#f59e0b" />
                    <StatCard title="Commandes à servir" value={stats.plats_prets_aujourdhui || 0} icon={TrendingUp} color="#10b981" />
                  </>
                )}
                {role === "Rcuisinier" && (
                  <>
                    <StatCard title="En attente" value={stats.en_attente || 0} icon={Clock} color="#ef4444" />
                    <StatCard title="En préparation" value={stats.en_preparation || 0} icon={ChefHat} color="#f59e0b" />
                    <StatCard title="Plats prêts" value={stats.plats_prets_aujourdhui || 0} icon={TrendingUp} color="#10b981" />
                  </>
                )}
                {role === "Rcomptable" && (
                  <>
                    <StatCard title="Revenus du jour" value={`${Number(stats.revenu_aujourdhui || 0).toLocaleString()} GNF`} icon={TrendingUp} color="#10b981" />
                    <StatCard title="Commandes actives" value={stats.commandes_actives || 0} icon={Utensils} color="#3b82f6" />
                    <StatCard title="Transactions" value={stats.total_staff || 0} icon={CreditCard} color="#f59e0b" />
                  </>
                )}
              </>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Impossible de charger les statistiques.</p>
            )}
            <style>{`@keyframes pulse{0%{opacity:0.6}50%{opacity:0.3}100%{opacity:0.6}}`}</style>
          </div>

          <div className="main-grid">
            {/* Colonne Gauche : Actions Rapides / Flux principal */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="section-card">
                <div className="section-header">
                  <h2 className="section-title">Accès Rapides</h2>
                </div>
                <div className="quick-actions">
                  {sections.flatMap(s => s.items).slice(0, 8).map((item) => (
                    <Link key={item.label} href={item.href} className="action-btn">
                       {/* Icon mapping would be better here, but for now we use a generic arrow or specific for some */}
                       <div className="action-icon">
                          {item.label.includes("Menu") ? <Utensils size={18} /> : 
                           item.label.includes("Commandes") ? <Clock size={18} /> :
                           item.label.includes("Équipe") ? <Users size={18} /> :
                           item.label.includes("Ajouter") ? <Plus size={18} /> :
                           <ArrowRight size={18} />}
                       </div>
                       <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {role !== "Rtable" && (
                <div className="section-card">
                  <div className="section-header">
                    <h2 className="section-title">Activité Récente</h2>
                  </div>
                  <div>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="activity-item">
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber-glow)" }} />
                        <div style={{ flex: 1 }}>
                           <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-primary)" }}>
                              {i === 1 ? "Nouvelle commande #128 reçue" : i === 2 ? "Table 4 a demandé l'addition" : "Risotto Royal marqué indisponible"}
                           </p>
                           <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--text-muted)" }}>il y a {i * 5} minutes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Colonne Droite : Infos secondaires / Aide */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
               {role === "Rtable" && (
                  <div className="section-card" style={{ background: "var(--gradient-amber)", border: "none" }}>
                    <div style={{ padding: "1.5rem", color: "#0c0a09" }}>
                       <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.125rem", fontWeight: 800 }}>Suggestion du Chef</h3>
                       <p style={{ margin: "0 0 1rem", fontSize: "0.82rem", opacity: 0.9 }}>Essayez notre nouveau Risotto Royal aux truffes blanches.</p>
                       <Link href="/menu" style={{ 
                         display: "inline-block", 
                         padding: "0.5rem 1rem", 
                         background: "#0c0a09", 
                         color: "#fff", 
                         borderRadius: "0.5rem", 
                         textDecoration: "none",
                         fontSize: "0.75rem",
                         fontWeight: 700
                       }}>Voir le plat</Link>
                    </div>
                  </div>
               )}

               <div className="section-card">
                  <div className="section-header">
                    <h2 className="section-title">Support</h2>
                  </div>
                  <div style={{ padding: "1.25rem" }}>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0 0 1rem" }}>Besoin d'aide avec l'application ?</p>
                    <button style={{ 
                      width: "100%", 
                      padding: "0.6rem", 
                      borderRadius: "0.75rem", 
                      background: "var(--bg-section-alt)", 
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}>
                      Contacter l'assistance
                    </button>
                  </div>
               </div>
            </div>
          </div>

          <p className="dash-footer">
            RestoPro · {currentDate} · v1.2.0
          </p>
        </div>
      </div>
    </>
  );
}