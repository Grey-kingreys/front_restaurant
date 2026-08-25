"use client";
// src/hooks/useMenu.ts

import { useState, useEffect, useCallback } from "react";
import { listPlats, togglePlatDisponibilite, deletePlat } from "@/lib/api/menu";
import type { Plat, Categorie } from "@/lib/api/menu";

import { LayoutGrid, Utensils, Salad, IceCream, Coffee, Soup } from "lucide-react";

export type { Plat, Categorie };

export const CATEGORIES: { value: Categorie | ""; label: string; icon: any }[] = [
    { value: "", label: "Tous", icon: LayoutGrid },
    { value: "PLAT", label: "Plats", icon: Utensils },
    { value: "ENTREE", label: "Entrées", icon: Salad },
    { value: "DESSERT", label: "Desserts", icon: IceCream },
    { value: "BOISSON", label: "Boissons", icon: Coffee },
    { value: "ACCOMPAGNEMENT", label: "Accompagnements", icon: Soup },
];

export function useMenu(options?: { tableMode?: boolean }) {
    const [plats, setPlats] = useState<Plat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categorie, setCategorie] = useState<Categorie | "">("");
    const [search, setSearch] = useState("");
    const [disponibleFilter, setDisponibleFilter] = useState<boolean | undefined>(
        options?.tableMode ? true : undefined
    );

    const fetchPlats = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await listPlats({
                categorie: categorie || undefined,
                disponible: disponibleFilter,
            });
            if (res.success && res.data) {
                setPlats(res.data.plats);
            } else {
                setError("Impossible de charger les plats.");
            }
        } catch {
            setError("Erreur de connexion au serveur.");
        } finally {
            setLoading(false);
        }
    }, [categorie, disponibleFilter]);

    useEffect(() => {
        fetchPlats();
    }, [fetchPlats]);

    const filteredPlats = plats.filter((p) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
            p.nom.toLowerCase().includes(q) ||
            (p.description?.toLowerCase().includes(q) ?? false)
        );
    });

    const handleToggle = async (id: number) => {
        try {
            const res = await togglePlatDisponibilite(id);
            if (res.success && res.data) {
                setPlats((prev) =>
                    prev.map((p) => (p.id === id ? res.data! : p))
                );
            }
        } catch {
            // silencieux - on recharge
            fetchPlats();
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deletePlat(id);
            setPlats((prev) => prev.filter((p) => p.id !== id));
        } catch {
            fetchPlats();
        }
    };

    // Stats
    const stats = {
        total: plats.length,
        disponibles: plats.filter((p) => p.disponible).length,
        indisponibles: plats.filter((p) => !p.disponible).length,
        parCategorie: CATEGORIES.slice(1).map((c) => ({
            ...c,
            count: plats.filter((p) => p.categorie === c.value).length,
        })),
    };

    return {
        plats: filteredPlats,
        allPlats: plats,
        loading,
        error,
        stats,
        // filtres
        categorie,
        setCategorie,
        search,
        setSearch,
        disponibleFilter,
        setDisponibleFilter,
        // actions
        handleToggle,
        handleDelete,
        refetch: fetchPlats,
    };
}