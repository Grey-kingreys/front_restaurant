# Frontend - RestoPro

Next.js App Router (TypeScript) - interface SaaS multi-tenant pour la gestion de restaurants.

> **Attention** : Ce projet utilise une version de Next.js avec des changements breaking.
> Lire `AGENTS.md` avant d'écrire du code. Respecter les avertissements de déprécation.

## Commandes

```bash
npm run dev      # dev sur :3000
npm run build
npm run lint
```

## Variable d'environnement (`.env.local`)

```text
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Structure des dossiers clés

```text
src/
  app/
    auth/login/
    auth/change-password/
    auth/reset-password/
    dashboard/            # Dashboard recharts par rôle (6 sous-composants)
    equipe/               # Gestion équipe + impersonation (Radmin/Rmanager)
    menu/                 # Liste plats + nouveau plat (chef cuisinier)
    commandes/            # Liste commandes (tableau desktop + cards mobile)
    commandes/cuisine/    # File d'attente cuisine
    commandes/mes-commandes/
    commandes/panier/
    tables/               # Tables & QR codes (Radmin/Rmanager)
    remises/              # Mes remises serveur (Rserveur)
    restaurants/          # Liste restaurants (Rsuper_admin)
    caisse/               # Caisse du jour (Rcomptable)
    caisse/remises/       # Remises serveurs à valider (Rcomptable)
    caisse/depenses/      # Saisie dépenses (Rcomptable)
    caisse/globale/       # Caisse globale journalière (Rcomptable/Radmin/Rmanager)
    caisse-generale/      # Coffre permanent (Radmin/Rmanager)
  components/
    layout/
      AppLayout.tsx       # Layout racine : sidebar + main + banner impersonation
      Sidebar.tsx         # Navigation responsive (prop topOffset pour banner)
      ImpersonationBanner.tsx  # Bandeau violet simulation active (BANNER_H = "2.625rem")
    dashboard/
      StatCard.tsx
    menu/
    ui/
  contexts/
    AuthContext.tsx       # Auth + impersonation (isImpersonating, impersonate, stopImpersonation)
  lib/
    api/
      client.ts           # Fetch + JWT + refresh + saveAdminSession/getAdminSession/clearAdminSession
      auth.ts             # Login, logout, me, CRUD users, impersonateUser
      dashboard.ts        # getDashboardStats() + types discriminants par rôle
      paiements.ts        # Caisse comptable/globale/générale, remises, dépenses
      commandes.ts        # Workflow commandes + panier
      restaurant.ts       # Tables, QR codes
      company.ts          # Restaurants (super admin)
      menu.ts             # Plats
    navigation.ts         # NAV_CONFIG par rôle + ROLE_LABELS + ROLE_COLORS
  theme/
    theme.ts              # Design system (cssVar, spacing, typography, radius, palette…)
  types/
    index.ts              # Types partagés (User, Role, ApiResponse…)
```

## Dashboard (`app/dashboard/page.tsx`)

Endpoint : `GET /api/dashboard/stats/` - retourne `DashboardData` avec un champ `type` discriminant.

| `type` | Rôles | Composant | Graphiques |
| --- | --- | --- | --- |
| `admin` | Radmin, Rmanager | `AdminDashboard` | BarChart revenus_7j, BarChart par_heure, 2× PieChart (statuts_live + par_categorie) |
| `serveur` | Rserveur | `ServeurDashboard` | BarChart par_heure, grille tables colorée par statut |
| `cuisine` | Rchef_cuisinier, Rcuisinier | `CuisineDashboard` | BarChart par_heure, PieChart par_categorie, file commandes |
| `comptable` | Rcomptable | `ComptableDashboard` | BarChart groupé revenus vs dépenses (balance_7j) |
| `table` | Rtable | `TableDashboard` | Barre progression statut, grille suggestions |
| `superadmin` | Rsuper_admin | `SuperAdminDashboard` | BarChart revenus_7j global, tableau par restaurant |

**Librairie graphiques** : `recharts` (BarChart, PieChart, Cell, ResponsiveContainer, Tooltip, Legend).

**Règle formatter Tooltip** : toujours typer `v` en `unknown` - `formatter={(v: unknown) => [fn(Number(v ?? 0)), "label"]}`.

**Types** (`lib/api/dashboard.ts`) : `DashboardData` (union discriminante), `AdminData`, `ServeurData`, `CuisineData`, `ComptableData`, `TableData`, `SuperadminData`.

## Auth

### localStorage keys

| Clé | Contenu |
| --- | --- |
| `access_token` | JWT access en cours |
| `refresh_token` | JWT refresh en cours |
| `user` | Objet `User` sérialisé |
| `admin_access_token` | Access token admin sauvegardé pendant simulation |
| `admin_refresh_token` | Refresh token admin sauvegardé |
| `admin_user` | Objet User admin sauvegardé |

### Refresh automatique

`client.ts` intercepte les 401 et tente un refresh silencieux. Si le refresh échoue, émet `window.dispatchEvent(new CustomEvent("auth:logout"))`. Si simulation active au moment du `auth:logout`, revient à l'admin au lieu de déconnecter.

### AuthContext (`contexts/AuthContext.tsx`)

Expose :

```typescript
user, isLoading, isAuthenticated, isImpersonating
setUser, logout, refreshUser, impersonate(userId), stopImpersonation
```

**Initialisation** : lit le `user` stocké, détecte si `admin_*` keys présentes → `isImpersonating = true`, puis valide avec `GET /api/accounts/auth/me/`.

## Impersonation

Permet à l'admin de simuler n'importe quel membre de son équipe.

### Flux

1. Admin sur `/equipe` clique **▶ Simuler** sur un utilisateur
2. `impersonate(userId)` dans `AuthContext` :
   - Sauvegarde les tokens admin dans `admin_*` keys via `saveAdminSession`
   - Appelle `POST /api/accounts/auth/users/<id>/impersonate/`
   - Remplace `access_token` / `refresh_token` / `user` par ceux de la cible
   - Active `isImpersonating = true`
3. Bandeau violet **ImpersonationBanner** apparaît en haut (hauteur `BANNER_H = "2.625rem"`, zIndex 9999)
4. Sidebar et `<main>` décalés via `topOffset` prop
5. Clic **✕ Quitter** → `stopImpersonation()` → restaure les tokens admin → redirect `/equipe`

### Rôles simulables

`Rmanager`, `Rserveur`, `Rchef_cuisinier`, `Rcuisinier`, `Rcomptable`, `Rtable`

Non simulables : `Radmin`, `Rsuper_admin`

### Fichiers concernés

- `src/lib/api/client.ts` - `saveAdminSession`, `getAdminSession`, `clearAdminSession`
- `src/lib/api/auth.ts` - `impersonateUser(userId)`
- `src/contexts/AuthContext.tsx` - `impersonate`, `stopImpersonation`, `isImpersonating`
- `src/components/layout/ImpersonationBanner.tsx` - bandeau + `BANNER_H`
- `src/components/layout/AppLayout.tsx` - passe `topOffset` à Sidebar et au `<main>`
- `src/components/layout/Sidebar.tsx` - prop `topOffset?: string` (défaut `"0px"`)
- `src/app/equipe/page.tsx` - bouton ▶ Simuler (icône `Play`)

## Navigation (`lib/navigation.ts`)

`NAV_CONFIG` définit la sidebar pour chaque rôle.

### URLs actives par rôle

| Rôle | URLs opérationnelles |
| --- | --- |
| `Radmin` | `/dashboard`, `/equipe`, `/tables`, `/menu`, `/commandes`, `/caisse-generale` |
| `Rmanager` | `/dashboard`, `/equipe`, `/tables`, `/menu`, `/commandes`, `/caisse-generale` |
| `Rserveur` | `/dashboard`, `/commandes`, `/remises` |
| `Rchef_cuisinier` | `/dashboard`, `/commandes/cuisine`, `/commandes`, `/menu`, `/menu/nouveau` |
| `Rcuisinier` | `/dashboard`, `/commandes/cuisine` |
| `Rcomptable` | `/dashboard`, `/caisse`, `/caisse/remises`, `/caisse/depenses`, `/caisse/globale` |
| `Rtable` | `/dashboard`, `/menu`, `/commandes/panier`, `/commandes/mes-commandes` |
| `Rsuper_admin` | `/dashboard`, `/restaurants` |

## Responsive - règle double-vue

Les pages avec tableau desktop + cards mobile utilisent deux classes CSS et des media queries dans leur bloc `<style>` :

```css
@media (min-width: 1024px) { .rp-cards-mobile { display:none !important; } }
@media (max-width: 1023px) { .rp-table-desktop { display:none !important; } }
```

Pages concernées : `equipe`, `commandes`, `restaurants`.

## Flux de caisse (`paiements.ts`)

| Fonction | Endpoint |
| --- | --- |
| `getMaCaisseActive()` | `GET /paiements/caisse-comptable/active/` |
| `ouvrirCaisseComptable()` | `POST /paiements/caisse-comptable/ouvrir/` |
| `approvisionnerCaisse(pk, payload)` | `POST /paiements/caisse-comptable/<pk>/approvisionner/` |
| `fermerCaisseComptable(pk, payload)` | `POST /paiements/caisse-comptable/<pk>/fermer/` |
| `creerDepense(pk, payload)` | `POST /paiements/caisse-comptable/<pk>/depense/` |
| `listDepenses(pk)` | `GET /paiements/caisse-comptable/<pk>/depenses/` |
| `getCaisseGlobaleActive()` | `GET /paiements/caisse-globale/active/` |
| `listCaissesGlobales()` | `GET /paiements/caisse-globale/` |
| `fermerCaisseGlobale(payload)` | `POST /paiements/caisse-globale/active/fermer/` |
| `getCaisseGenerale()` | `GET /paiements/caisse-generale/` |
| `initCaisseGenerale(payload)` | `POST /paiements/caisse-generale/init/` (Admin - 1ʳᵉ config) |
| `listRemises(params?)` | `GET /paiements/remises/` |
| `validerRemise(pk, payload)` | `POST /paiements/remises/<pk>/valider/` |

**Important** : `CaisseComptable` retourne `mouvements: MouvementCaisse[]` embarqués - pas besoin d'appel séparé.

## Design System (`theme/theme.ts`)

Tout le style est en CSS-in-JS via des objets exportés depuis `theme.ts`. Ne pas écrire de CSS arbitraire - utiliser les variables : `cssVar`, `spacing`, `typography`, `radius`, `palette`, `btnPrimary`, `cardBase`, `roleBadge`, `avatarBase`, etc.

Le thème est dark par défaut avec des accents ambrés (`--amber-glow`, `--border-amber`).

## API client - conventions

```typescript
import { getMaCaisseActive } from "@/lib/api/paiements";
const res = await getMaCaisseActive();
if (res.success && res.data) { /* ... */ }
```

Toutes les fonctions API retournent `ApiResponse<T>` : `{ success, data?, message?, errors? }`.

## Pages à implémenter (href: "#" dans la nav)

### ✅ Implémentées

| Page | Rôle(s) | URL |
| --- | --- | --- |
| Dashboard recharts | Tous | `/dashboard` |
| Gestion équipe + Simuler | Radmin, Rmanager | `/equipe` |
| Tables & QR | Radmin, Rmanager | `/tables` |
| Menu | Rchef_cuisinier | `/menu`, `/menu/nouveau` |
| Commandes | Rserveur, Radmin, Rmanager, Rchef | `/commandes` |
| File cuisine | Rchef_cuisinier, Rcuisinier | `/commandes/cuisine` |
| Panier + Mes commandes | Rtable | `/commandes/panier`, `/commandes/mes-commandes` |
| Mes remises | Rserveur | `/remises` |
| Restaurants | Rsuper_admin | `/restaurants` |
| Caisse du jour | Rcomptable | `/caisse` |
| Remises serveurs | Rcomptable | `/caisse/remises` |
| Dépenses | Rcomptable | `/caisse/depenses` |
| Caisse Globale | Rcomptable, Radmin, Rmanager | `/caisse/globale` |
| Caisse Générale | Radmin, Rmanager | `/caisse-generale` |

### ✅ Toutes les pages sont implémentées

Toutes les pages listées ci-dessus (dashboard, équipe, tables, menu, commandes, etc.) sont **entièrement fonctionnelles** avec leur backend correspondant.

### ❌ Sans backend (à construire si voulu)

Analytics avancées, Rapports détaillés, Exports PDF/Excel, Paramètres plateforme globaux.
