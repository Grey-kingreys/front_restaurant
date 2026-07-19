"use client";
// ─────────────────────────────────────────────────────────────
// <Logo /> — source unique de vérité pour la marque « resfly ».
// Pour changer le logo partout dans l'app, il suffit de modifier
// ce fichier (ou l'asset public/images/brand/logo-icon.png).
//
//   <Logo />                        → icône R + mot « resfly »
//   <Logo variant="icon" />         → icône R seule (sidebar réduite, favicon…)
//   <Logo variant="wordmark" />     → mot « resfly » seul
//   <Logo size={44} href="/" />     → cliquable, plus grand (pages auth)
//
// Le wordmark est rendu en TEXTE adaptatif (« res » ambré + « fly »
// en couleur de thème) pour rester lisible en dark ET en light,
// contrairement au PNG dont le « fly » gris disparaît sur fond sombre.
// ─────────────────────────────────────────────────────────────

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { cssVar, typography } from "@/theme/theme";

// Ratio natif de l'icône R (550 × 486)
const ICON_RATIO = 550 / 486;

export type LogoVariant = "full" | "icon" | "wordmark";

export interface LogoProps {
    /** Déclinaison à afficher. Défaut : "full" (icône + mot). */
    variant?: LogoVariant;
    /** Hauteur de l'icône en px ; le wordmark s'aligne dessus. Défaut 32. */
    size?: number;
    /** Si fourni, tout le logo devient un lien vers cette URL. */
    href?: string;
    /** Handler de clic (ex. fermer le menu mobile). */
    onClick?: () => void;
    /** Charger l'image en priorité (logo au-dessus de la ligne de flottaison). */
    priority?: boolean;
    className?: string;
    style?: CSSProperties;
}

/** Wordmark « resfly » — « res » ambré (dégradé du thème) + « fly » couleur de texte. */
function Wordmark({ fontSize }: { fontSize: number }) {
    return (
        <span
            style={{
                fontFamily: typography.fontSans,
                fontWeight: typography.extrabold,
                fontSize,
                letterSpacing: "-0.02em",
                lineHeight: 1,
                whiteSpace: "nowrap",
            }}
        >
            <span
                style={{
                    background: cssVar.gradientText,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}
            >
                res
            </span>
            <span style={{ color: cssVar.textPrimary }}>fly</span>
        </span>
    );
}

export default function Logo({
    variant = "full",
    size = 32,
    href,
    onClick,
    priority = false,
    className,
    style,
}: LogoProps) {
    const iconW = Math.round(size * ICON_RATIO);
    const fontSize = Math.round(size * 0.6);
    // L'image porte le nom accessible seulement si le mot n'est pas rendu à côté.
    const iconAlt = variant === "icon" ? "resfly" : "";

    const content = (
        <span
            className={className}
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: Math.round(size * 0.25),
                lineHeight: 1,
                ...style,
            }}
        >
            {variant !== "wordmark" && (
                <Image
                    src="/images/brand/logo-icon.png"
                    alt={iconAlt}
                    width={iconW}
                    height={size}
                    priority={priority}
                    style={{ width: iconW, height: size, objectFit: "contain", flexShrink: 0 }}
                />
            )}
            {variant !== "icon" && <Wordmark fontSize={fontSize} />}
        </span>
    );

    if (href) {
        return (
            <Link
                href={href}
                onClick={onClick}
                aria-label="resfly — accueil"
                style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
            >
                {content}
            </Link>
        );
    }

    return content;
}
