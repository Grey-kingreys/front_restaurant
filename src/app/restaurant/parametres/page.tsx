"use client";
// Redirige vers /parametres?tab=restaurant
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RestaurantParametresRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace("/parametres?tab=restaurant"); }, [router]);
    return null;
}
