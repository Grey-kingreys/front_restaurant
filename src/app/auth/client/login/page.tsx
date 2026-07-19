"use client";
// Redirige vers la page de connexion unifiée /auth/login
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ClientLoginRedirect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const next = searchParams?.get("next");
    useEffect(() => {
        router.replace(`/auth/login${next ? `?next=${encodeURIComponent(next)}` : ""}`);
    }, [router, next]);
    return null;
}
