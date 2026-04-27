// src/lib/navigation.ts
import type { Role } from "@/types";

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

export const NAV_CONFIG: Record<Role, NavSection[]> = {
    Rsuper_admin: [
        {
            title: "Plateforme",
            items: [
                { label: "Vue d'ensemble", href: "/dashboard", icon: "dashboard" },
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
                { label: "Vue d'ensemble", href: "/dashboard", icon: "dashboard" },
                { label: "Analytics", href: "#", icon: "chart" },
            ],
        },
        {
            title: "Gestion",
            items: [
                { label: "Équipe", href: "#", icon: "users" },
                { label: "Tables & QR", href: "#", icon: "qr" },
                { label: "Menu", href: "/menu", icon: "menu" },
                { label: "Commandes", href: "/commandes", icon: "orders" },
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
                { label: "Vue d'ensemble", href: "/dashboard", icon: "dashboard" },
                { label: "Analytics", href: "#", icon: "chart" },
            ],
        },
        {
            title: "Gestion",
            items: [
                { label: "Équipe", href: "#", icon: "users" },
                { label: "Tables & QR", href: "#", icon: "qr" },
                { label: "Menu", href: "/menu", icon: "menu" },
                { label: "Commandes", href: "/commandes", icon: "orders" },
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
                { label: "Tables en direct", href: "/dashboard", icon: "dashboard" },
                { label: "Toutes les commandes", href: "/commandes", icon: "orders" },
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
                { label: "File des commandes", href: "/commandes/cuisine", icon: "orders" },
                { label: "Toutes les commandes", href: "/commandes", icon: "dashboard" },
            ],
        },
        {
            title: "Menu",
            items: [
                { label: "Gérer les plats", href: "/menu", icon: "menu" },
                { label: "Ajouter un plat", href: "/menu/nouveau", icon: "plus" },
            ],
        },
    ],

    Rcuisinier: [
        {
            title: "Cuisine",
            items: [
                { label: "File des commandes", href: "/commandes/cuisine", icon: "orders" },
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
                { label: "Le menu", href: "/menu", icon: "menu" },
                { label: "Mon panier", href: "/commandes/panier", icon: "cart" },
                { label: "Mes commandes", href: "/commandes/mes-commandes", icon: "orders" },
            ],
        },
    ],
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
};