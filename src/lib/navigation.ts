// src/lib/navigation.ts
// Définition des liens de navigation par rôle

import type { Role } from "@/types";

export interface NavItem {
    label: string;
    href: string;
    icon: string; // nom de l'icône (SVG inline dans Sidebar)
    badge?: string; // badge optionnel (ex: nombre de commandes)
}

export interface NavSection {
    title?: string;
    items: NavItem[];
}

// ── Navigation par rôle ────────────────────────────────────────────────────

export const NAV_CONFIG: Record<Role, NavSection[]> = {
    Rsuper_admin: [
        {
            title: "Plateforme",
            items: [
                { label: "Vue d'ensemble", href: "#", icon: "dashboard" },
                { label: "Restaurants", href: "#", icon: "building" },
                { label: "Statistiques", href: "#", icon: "chart" },
            ],
        },
        {
            title: "Administration",
            items: [
                { label: "Paramètres", href: "#", icon: "settings" },
            ],
        },
    ],

    Radmin: [
        {
            title: "Tableau de bord",
            items: [
                { label: "Vue d'ensemble", href: "#", icon: "dashboard" },
                { label: "Analytics", href: "#", icon: "chart" },
            ],
        },
        {
            title: "Gestion",
            items: [
                { label: "Équipe", href: "#", icon: "users" },
                { label: "Tables & QR", href: "#", icon: "qr" },
                { label: "Menu", href: "#", icon: "menu" },
                { label: "Commandes", href: "#", icon: "orders" },
            ],
        },
        {
            title: "Finance",
            items: [
                { label: "Caisse Générale", href: "#", icon: "cash" },
                { label: "Rapports", href: "#", icon: "report" },
                { label: "Exports", href: "#", icon: "export" },
            ],
        },
        {
            title: "Paramètres",
            items: [
                { label: "Mon restaurant", href: "#", icon: "settings" },
            ],
        },
    ],

    Rmanager: [
        {
            title: "Tableau de bord",
            items: [
                { label: "Vue d'ensemble", href: "#", icon: "dashboard" },
                { label: "Analytics", href: "#", icon: "chart" },
            ],
        },
        {
            title: "Gestion",
            items: [
                { label: "Équipe", href: "#", icon: "users" },
                { label: "Tables & QR", href: "#", icon: "qr" },
                { label: "Menu", href: "#", icon: "menu" },
                { label: "Commandes", href: "#", icon: "orders" },
            ],
        },
        {
            title: "Finance",
            items: [
                { label: "Caisse Générale", href: "#", icon: "cash" },
                { label: "Rapports", href: "#", icon: "report" },
                { label: "Exports", href: "#", icon: "export" },
            ],
        },
    ],

    Rserveur: [
        {
            title: "Service",
            items: [
                { label: "Tables en direct", href: "#", icon: "dashboard" },
                { label: "Commandes à servir", href: "#", icon: "orders" },
                { label: "Valider un paiement", href: "#", icon: "cash" },
            ],
        },
        {
            title: "Historique",
            items: [
                { label: "Mes remises", href: "#", icon: "report" },
            ],
        },
    ],

    Rchef_cuisinier: [
        {
            title: "Cuisine",
            items: [
                { label: "File des commandes", href: "#", icon: "orders" },
                { label: "Commandes en cours", href: "#", icon: "dashboard" },
            ],
        },
        {
            title: "Menu",
            items: [
                { label: "Gérer les plats", href: "#", icon: "menu" },
                { label: "Ajouter un plat", href: "#", icon: "plus" },
            ],
        },
    ],

    Rcuisinier: [
        {
            title: "Cuisine",
            items: [
                { label: "File des commandes", href: "#", icon: "orders" },
            ],
        },
    ],

    Rcomptable: [
        {
            title: "Ma caisse",
            items: [
                { label: "Caisse du jour", href: "#", icon: "cash" },
                { label: "Remises serveurs", href: "#", icon: "orders" },
                { label: "Dépenses", href: "#", icon: "report" },
                { label: "Mouvements", href: "#", icon: "chart" },
            ],
        },
        {
            title: "Caisse Globale",
            items: [
                { label: "Caisse Globale", href: "#", icon: "building" },
            ],
        },
    ],

    Rtable: [
        {
            title: "Ma commande",
            items: [
                { label: "Le menu", href: "#", icon: "menu" },
                { label: "Mon panier", href: "#", icon: "cart" },
                { label: "Mes commandes", href: "#", icon: "orders" },
            ],
        },
    ],
};

// Labels lisibles pour chaque rôle
export const ROLE_LABELS: Record<Role, string> = {
    Rsuper_admin: "Super Administrateur",
    Radmin: "Administrateur",
    Rmanager: "Manager",
    Rserveur: "Serveur",
    Rchef_cuisinier: "Chef Cuisinier",
    Rcuisinier: "Cuisinier",
    Rcomptable: "Comptable",
    Rtable: "Table",
};

// Couleurs badge par rôle
export const ROLE_COLORS: Record<Role, { bg: string; text: string; border: string }> = {
    Rsuper_admin: { bg: "rgba(239,68,68,0.12)", text: "#ef4444", border: "rgba(239,68,68,0.25)" },
    Radmin: { bg: "rgba(245,158,11,0.12)", text: "#f59e0b", border: "rgba(245,158,11,0.25)" },
    Rmanager: { bg: "rgba(168,85,247,0.12)", text: "#a855f7", border: "rgba(168,85,247,0.25)" },
    Rserveur: { bg: "rgba(59,130,246,0.12)", text: "#3b82f6", border: "rgba(59,130,246,0.25)" },
    Rchef_cuisinier: { bg: "rgba(249,115,22,0.12)", text: "#f97316", border: "rgba(249,115,22,0.25)" },
    Rcuisinier: { bg: "rgba(234,179,8,0.12)", text: "#eab308", border: "rgba(234,179,8,0.25)" },
    Rcomptable: { bg: "rgba(20,184,166,0.12)", text: "#14b8a6", border: "rgba(20,184,166,0.25)" },
    Rtable: { bg: "rgba(34,197,94,0.12)", text: "#22c55e", border: "rgba(34,197,94,0.25)" },
};