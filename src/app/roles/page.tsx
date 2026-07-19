"use client";
// Redirige vers /parametres?tab=roles
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RolesRedirect() {
    const router = useRouter();
    useEffect(() => { router.replace("/parametres?tab=roles"); }, [router]);
    return null;
}
