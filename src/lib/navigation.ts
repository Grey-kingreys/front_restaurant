// src/lib/navigation.ts
import type { Role, User } from "@/types";

export interface NavItem {
    label: string;
    href: string;
    icon: string;
    badge?: string;
}

export interface NavSection {
    title?: string;
    items: NavItem[];
}

// ─── Navigation rôles structurels (pas de role_config) ───────────────────────

const NAV_SUPER_ADMIN: NavSection[] = [
    {
        title: "Plateforme",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
            { label: "Restaurants", href: "/restaurants", icon: "building" },
            { label: "Statistiques", href: "/statistiques", icon: "chart" },
        ],
    },
    {
        title: "Administration",
        items: [
            { label: "Paramètres", href: "#", icon: "settings" },
        ],
    },
];

const NAV_TABLE: NavSection[] = [
    {
        title: "Vue d'ensemble",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
        ],
    },
    {
        title: "Ma commande",
        items: [
            { label: "Le menu", href: "/menu", icon: "menu" },
            { label: "Mon panier", href: "/commandes/panier", icon: "cart" },
            { label: "Mes commandes", href: "/commandes/mes-commandes", icon: "orders" },
        ],
    },
];

const NAV_CLIENT: NavSection[] = [
    {
        title: "Mon espace",
        items: [
            { label: "Tableau de bord", href: "/client", icon: "dashboard" },
        ],
    },
    {
        title: "Commander",
        items: [
            { label: "Les restaurants", href: "/client/restaurants", icon: "building" },
            { label: "Tous les plats", href: "/client/plats", icon: "menu" },
            { label: "Mes commandes", href: "/client/commandes", icon: "orders" },
        ],
    },
    {
        title: "Réserver",
        items: [
            { label: "Mes réservations", href: "/client/reservations", icon: "calendar" },
        ],
    },
];

// ─── Blocs nav basés sur les permissions ─────────────────────────────────────

type PermissionNavBlock = {
    title?: string;
    requiredAny?: string[];   // afficher si l'user a au moins une de ces permissions
    items: (NavItem & { requiredAny?: string[] })[];
};

const PERMISSION_NAV_BLOCKS: PermissionNavBlock[] = [
    // Vue d'ensemble — toujours visible pour le staff
    {
        title: "Vue d'ensemble",
        items: [
            { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
        ],
    },

    // Gestion équipe
    {
        title: "Équipe",
        requiredAny: ["manage_equipe"],
        items: [
            { label: "Équipe", href: "/equipe", icon: "users" },
        ],
    },

    // Tables
    {
        title: "Tables",
        requiredAny: ["view_tables", "manage_tables"],
        items: [
            { label: "Tables & QR", href: "/tables", icon: "qr" },
        ],
    },

    // Réservations (salle)
    {
        title: "Réservations",
        requiredAny: ["view_commandes", "manage_commandes", "view_tables", "manage_tables"],
        items: [
            { label: "Réservations", href: "/reservations", icon: "calendar" },
        ],
    },

    // Menu
    {
        title: "Menu",
        requiredAny: ["manage_menu", "view_cuisine", "manage_cuisine"],
        items: [
            { label: "Gérer les plats", href: "/menu", icon: "menu", requiredAny: ["manage_menu", "view_cuisine", "manage_cuisine"] },
            { label: "Ajouter un plat", href: "/menu/nouveau", icon: "plus", requiredAny: ["manage_menu"] },
        ],
    },

    // Commandes
    {
        title: "Commandes",
        requiredAny: ["view_commandes", "manage_commandes", "view_cuisine", "manage_cuisine"],
        items: [
            { label: "File des commandes", href: "/commandes/cuisine", icon: "orders", requiredAny: ["view_cuisine", "manage_cuisine"] },
            { label: "Toutes les commandes", href: "/commandes", icon: "orders", requiredAny: ["view_commandes", "manage_commandes"] },
        ],
    },

    // Remises (serveur)
    {
        title: "Historique",
        requiredAny: ["view_remises"],
        items: [
            { label: "Mes remises", href: "/remises", icon: "report" },
        ],
    },

    // Caisse comptable
    {
        title: "Ma caisse",
        requiredAny: ["manage_caisse_comptable"],
        items: [
            { label: "Caisse du jour", href: "/caisse", icon: "cash" },
            { label: "Remises serveurs", href: "/caisse/remises", icon: "orders" },
            { label: "Dépenses", href: "/caisse/depenses", icon: "report" },
        ],
    },

    // Caisse globale
    {
        title: "Finance",
        requiredAny: ["view_caisse_globale", "manage_caisse_globale", "view_caisse_generale"],
        items: [
            { label: "Caisse Globale", href: "/caisse/globale", icon: "building", requiredAny: ["view_caisse_globale", "manage_caisse_globale"] },
            { label: "Caisse Générale", href: "/caisse-generale", icon: "cash", requiredAny: ["view_caisse_generale"] },
        ],
    },

    // Paramètres (restaurant + rôles + workflow)
    {
        title: "Paramètres",
        requiredAny: ["manage_restaurant", "manage_roles"],
        items: [
            { label: "Paramètres", href: "/parametres", icon: "settings" },
        ],
    },
];

// ─── Fonction principale ──────────────────────────────────────────────────────

export function getNavSections(user: User): NavSection[] {
    if (user.role === "Rsuper_admin") return NAV_SUPER_ADMIN;
    if (user.role === "Rtable") return NAV_TABLE;
    if (user.role === "Rclient") return NAV_CLIENT;

    const perms = new Set(user.permissions ?? []);
    const has = (...codes: string[]) => codes.some(c => perms.has(c));

    const sections: NavSection[] = [];

    for (const block of PERMISSION_NAV_BLOCKS) {
        // La section elle-même est-elle accessible ?
        if (block.requiredAny && !has(...block.requiredAny)) continue;

        const visibleItems = block.items.filter(item =>
            !item.requiredAny || has(...item.requiredAny)
        );

        if (visibleItems.length === 0) continue;

        // Nettoyer les champs spécifiques à ce fichier avant de passer au composant
        sections.push({
            title: block.title,
            items: visibleItems.map(({ requiredAny: _r, ...rest }) => rest),
        });
    }

    return sections;
}

// ─── Fallback rôle (utilisé dans Sidebar pour les anciens appels) ─────────────

/** @deprecated Utiliser getNavSections(user) à la place */
export const NAV_CONFIG: Record<Role, NavSection[]> = {
    Rsuper_admin: NAV_SUPER_ADMIN,
    Rtable: NAV_TABLE,
    // Les rôles staff retournent un tableau vide — utiliser getNavSections()
    Radmin: [],
    Rmanager: [],
    Rserveur: [],
    Rchef_cuisinier: [],
    Rcuisinier: [],
    Rcomptable: [],
    Rclient: NAV_CLIENT,
};

export const ROLE_LABELS: Record<Role, string> = {
    Rsuper_admin: "Super Administrateur",
    Radmin: "Administrateur",
    Rmanager: "Manager",
    Rserveur: "Serveur",
    Rchef_cuisinier: "Chef Cuisinier",
    Rcuisinier: "Cuisinier",
    Rcomptable: "Comptable",
    Rtable: "Table",
    Rclient: "Client",
};

export const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
    Rsuper_admin: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.25)" },
    Radmin: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.25)" },
    Rmanager: { bg: "rgba(168,85,247,0.12)", text: "#a855f7", border: "rgba(168,85,247,0.25)" },
    Rserveur: { bg: "rgba(59,130,246,0.12)", text: "#3b82f6", border: "rgba(59,130,246,0.25)" },
    Rchef_cuisinier: { bg: "rgba(249,115,22,0.12)", text: "#f97316", border: "rgba(249,115,22,0.25)" },
    Rcuisinier: { bg: "rgba(234,179,8,0.12)", text: "#eab308", border: "rgba(234,179,8,0.25)" },
    Rcomptable: { bg: "rgba(20,184,166,0.12)", text: "#14b8a6", border: "rgba(20,184,166,0.25)" },
    Rtable: { bg: "rgba(34,197,94,0.12)", text: "#22c55e", border: "rgba(34,197,94,0.25)" },
    Rclient: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.25)" },
};
