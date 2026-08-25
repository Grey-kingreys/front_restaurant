"use client";
// src/contexts/CartContext.tsx
// Panier client public - persisté en localStorage par slug de restaurant.

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface CartItem {
    platId: number;
    nom: string;
    prix_unitaire: number;
    quantite: number;
    image_url: string | null;
}

interface CartState {
    restaurantSlug: string;
    restaurantNom: string;
    items: CartItem[];
}

interface CartContextValue {
    items: CartItem[];
    restaurantNom: string;
    count: number;
    total: number;
    addItem: (item: Omit<CartItem, "quantite">) => void;
    removeItem: (platId: number) => void;
    updateQuantite: (platId: number, quantite: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function storageKey(slug: string) {
    return `cart_${slug}`;
}

export function CartProvider({ slug, restaurantNom, children }: { slug: string; restaurantNom: string; children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    // `ready` empêche la persistance d'écraser le localStorage avec [] avant le chargement initial
    const [ready, setReady] = useState(false);

    // Chargement initial depuis localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(storageKey(slug));
            if (raw) {
                const parsed: CartState = JSON.parse(raw);
                if (parsed.restaurantSlug === slug && Array.isArray(parsed.items)) setItems(parsed.items);
            }
        } catch { /* ignore */ }
        setReady(true);
    }, [slug]);

    // Persistance automatique - uniquement après le chargement initial
    useEffect(() => {
        if (!ready) return;
        const state: CartState = { restaurantSlug: slug, restaurantNom, items };
        localStorage.setItem(storageKey(slug), JSON.stringify(state));
    }, [items, ready, slug, restaurantNom]);

    const addItem = useCallback((item: Omit<CartItem, "quantite">) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.platId === item.platId);
            return existing
                ? prev.map((i) => i.platId === item.platId ? { ...i, quantite: i.quantite + 1 } : i)
                : [...prev, { ...item, quantite: 1 }];
        });
    }, []);

    const removeItem = useCallback((platId: number) => {
        setItems((prev) => prev.filter((i) => i.platId !== platId));
    }, []);

    const updateQuantite = useCallback((platId: number, quantite: number) => {
        setItems((prev) =>
            quantite <= 0
                ? prev.filter((i) => i.platId !== platId)
                : prev.map((i) => i.platId === platId ? { ...i, quantite } : i)
        );
    }, []);

    const clearCart = useCallback(() => {
        localStorage.removeItem(storageKey(slug));
        setItems([]);
    }, [slug]);

    const total = items.reduce((s, i) => s + i.prix_unitaire * i.quantite, 0);
    const count = items.reduce((s, i) => s + i.quantite, 0);

    return (
        <CartContext.Provider value={{ items, restaurantNom, count, total, addItem, removeItem, updateQuantite, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}
