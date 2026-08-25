"use client";
// ─────────────────────────────────────────────────────────────
// <Logo /> — source unique de vérité pour la marque « resfly ».
// Pour changer le logo partout dans l'app, il suffit de modifier
// ce fichier (ou l'asset public/images/brand/logo-icon.png).
//
//   <Logo />                    → mot « resfly » (défaut, toutes les barres)
//   <Logo variant="icon" />     → monogramme R seul (sidebar réduite, favicon…)
//   <Logo size={44} href="/" /> → cliquable, plus grand (pages auth)
//
// ⚠️ Le monogramme n'est JAMAIS pose a cote du mot a l'horizontale.
// Le monogramme EST la lettre R et « resfly » commence par un r : cote a
// cote sur une ligne, l'oeil lit « R resfly ». Le monogramme est donc
// reserve aux contextes ou il apparait seul, sans ambiguite possible.
// Le verrouillage officiel de la marque (public/images/brand/logo-full.png)
// est vertical — R au-dessus du mot — et ne tient pas dans une barre.
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

export type LogoVariant = "wordmark" | "icon";

export interface LogoProps {
    /** Déclinaison à afficher. Défaut : "wordmark" (le mot seul). */
    variant?: LogoVariant;
    /** Hauteur nominale du logo en px ; le corps du mot s'y aligne. Défaut 32. */
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
    variant = "wordmark",
    size = 32,
    href,
    onClick,
    priority = false,
    className,
    style,
}: LogoProps) {
    const iconW = Math.round(size * ICON_RATIO);
    const fontSize = Math.round(size * 0.6);

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
            {variant === "icon" ? (
                <Image
                    src="/images/brand/logo-icon.png"
                    alt="resfly"
                    width={iconW}
                    height={size}
                    priority={priority}
                    style={{ width: iconW, height: size, objectFit: "contain", flexShrink: 0 }}
                />
            ) : (
                <Wordmark fontSize={fontSize} />
            )}
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
