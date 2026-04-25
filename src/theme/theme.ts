// src/theme/theme.ts
// ─────────────────────────────────────────────────────────────
// Tokens de design centralisés pour RestoPro
// Usage :  import { t, colors, spacing, ... } from "@/theme/theme";
// ─────────────────────────────────────────────────────────────

// ── Mode thème ────────────────────────────────────────────────
export type ThemeMode = "light" | "dark" | "system";

// ── Breakpoints (px) ─────────────────────────────────────────
export const breakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
} as const;

// ── Spacing scale (rem) ───────────────────────────────────────
export const spacing = {
    "0": "0",
    "0.5": "0.125rem",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "8": "2rem",
    "10": "2.5rem",
    "12": "3rem",
} as const;

// ── Border-radius ─────────────────────────────────────────────
export const radius = {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.65rem",
    xl: "0.875rem",
    "2xl": "1.25rem",
    full: "9999px",
} as const;

// ── Typography ────────────────────────────────────────────────
export const typography = {
    fontSans: "var(--font-inter), Arial, sans-serif",
    fontSerif: "var(--font-playfair), serif",

    // tailles
    xs: "0.65rem",
    sm: "0.75rem",
    base: "0.875rem",
    md: "0.95rem",
    lg: "1rem",
    xl: "1.1rem",
    "2xl": "1.25rem",
    "3xl": "1.5rem",
    "4xl": "2rem",

    // poids
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
} as const;

// ── Palette statique (non sujette au mode) ────────────────────
export const palette = {
    amber: {
        300: "#fcd34d",
        400: "#fbbf24",
        500: "#f59e0b",
        600: "#d97706",
        700: "#b45309",
    },
    green: { 400: "#4ade80", 500: "#22c55e" },
    red: { 400: "#f87171", 500: "#ef4444" },
    blue: { 500: "#3b82f6" },
    purple: { 500: "#a855f7" },
    orange: { 500: "#f97316" },
    yellow: { 500: "#eab308" },
    teal: { 500: "#14b8a6" },
    btnText: "#0c0a09",
} as const;

// ── Tokens CSS via variables (résolus au runtime) ─────────────
// On n'essaie pas de dupliquer globals.css ici ; on expose
// des helpers qui construisent des objets React.CSSProperties.
export const cssVar = {
    // couleurs
    bgDark: "var(--bg-dark)",
    bgCard: "var(--bg-card)",
    bgCardHover: "var(--bg-card-hover)",
    bgSectionAlt: "var(--bg-section-alt)",

    textPrimary: "var(--text-primary)",
    textSecondary: "var(--text-secondary)",
    textMuted: "var(--text-muted)",
    textFaint: "var(--text-faint)",

    borderAmber: "var(--border-amber)",
    borderAmberHover: "var(--border-amber-hover)",
    borderSubtle: "var(--border-subtle)",

    shadowCard: "var(--shadow-card)",
    shadowCardHover: "var(--shadow-card-hover)",

    gradientText: "var(--gradient-text)",
    gradientBtn: "var(--gradient-btn)",

    amberGlow: "var(--amber-glow)",
    amberDeep: "var(--amber-deep)",

    iconPrimary: "var(--icon-primary)",
    iconSecondary: "var(--icon-secondary)",
    iconBg: "var(--icon-bg)",
    iconBorder: "var(--icon-border)",
} as const;

// ── Styles composables (React.CSSProperties factories) ───────

/** Input standard */
export const inputBase: React.CSSProperties = {
    width: "100%",
    padding: `${spacing[2.5 as unknown as "3"]} ${spacing["3"]}`,
    borderRadius: radius.lg,
    border: `1px solid ${cssVar.borderSubtle}`,
    background: cssVar.bgSectionAlt,
    color: cssVar.textPrimary,
    fontSize: typography.md,
    outline: "none",
    transition: "border-color 0.2s ease",
    boxSizing: "border-box",
} as React.CSSProperties;

// Alias pratique
export const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "0.65rem 0.875rem",
    borderRadius: radius.lg,
    border: `1px solid ${cssVar.borderSubtle}`,
    background: cssVar.bgSectionAlt,
    color: cssVar.textPrimary,
    fontSize: typography.md,
    outline: "none",
    transition: "border-color 0.2s ease",
    boxSizing: "border-box",
};

/** Bouton primaire */
export const btnPrimary: React.CSSProperties = {
    padding: "0.75rem",
    borderRadius: radius.xl,
    border: "none",
    background: cssVar.gradientBtn,
    color: palette.btnText,
    fontWeight: typography.bold,
    fontSize: typography.md,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing["2"],
};

export const btnPrimaryDisabled: React.CSSProperties = {
    ...btnPrimary,
    background: cssVar.borderSubtle,
    color: cssVar.textMuted,
    cursor: "not-allowed",
};

/** Bouton secondaire (outline) */
export const btnOutline: React.CSSProperties = {
    padding: "0.45rem 0.875rem",
    borderRadius: radius.lg,
    border: `1px solid ${cssVar.borderAmberHover}`,
    background: "transparent",
    color: cssVar.amberGlow,
    fontWeight: typography.semibold,
    fontSize: typography.sm,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: spacing["2"],
    textDecoration: "none",
    flexShrink: 0,
    whiteSpace: "nowrap",
    transition: "all 0.2s",
};

/** Card de base */
export const cardBase: React.CSSProperties = {
    background: cssVar.bgCard,
    border: `1px solid ${cssVar.borderAmber}`,
    borderRadius: radius["2xl"],
    boxShadow: cssVar.shadowCard,
};

/** Section card (bordure subtile) */
export const cardSection: React.CSSProperties = {
    background: cssVar.bgCard,
    border: `1px solid ${cssVar.borderSubtle}`,
    borderRadius: radius.xl,
    overflow: "hidden",
};

/** Spinner de chargement */
export const spinnerBase: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: `2px solid ${cssVar.textMuted}`,
    borderTopColor: cssVar.amberGlow,
    animation: "spin 0.7s linear infinite",
};

/** Badge rôle — prend les couleurs depuis ROLE_COLORS */
export const roleBadge = (
    bg: string,
    text: string,
    border: string
): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.15rem 0.5rem",
    borderRadius: radius.full,
    fontSize: typography.xs,
    fontWeight: typography.bold,
    background: bg,
    color: text,
    border: `1px solid ${border}`,
});

/** Badge de statut (actif / inactif) */
export const statusBadge = (active: boolean): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.25rem",
    padding: "0.15rem 0.5rem",
    borderRadius: radius.full,
    fontSize: typography.xs,
    fontWeight: typography.bold,
    background: active ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)",
    color: active ? palette.green[500] : palette.red[500],
    border: `1px solid ${active ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
});

/** Dot de statut */
export const statusDot = (active: boolean): React.CSSProperties => ({
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: active ? palette.green[500] : palette.red[500],
    display: "inline-block",
    flexShrink: 0,
});

/** Icon container */
export const iconContainer = (size: number = 44): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: radius.xl,
    background: cssVar.iconBg,
    border: `1px solid ${cssVar.iconBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: cssVar.iconPrimary,
    flexShrink: 0,
});

/** Avatar (initiales) */
export const avatarBase = (size: number = 44): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f59e0b, #d97706)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: typography.extrabold,
    fontSize: size >= 60 ? "1.2rem" : "0.875rem",
    color: palette.btnText,
    flexShrink: 0,
});

/** Bandeau d'alerte amber */
export const alertAmber: React.CSSProperties = {
    padding: "0.65rem 0.875rem",
    borderRadius: radius.lg,
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.2)",
    fontSize: typography.sm,
    color: palette.amber[500],
};

/** Bandeau d'erreur */
export const alertError: React.CSSProperties = {
    padding: "0.65rem 0.875rem",
    borderRadius: radius.md,
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: palette.red[500],
    fontSize: "0.82rem",
};

/** Bandeau succès */
export const alertSuccess: React.CSSProperties = {
    width: 60,
    height: 60,
    borderRadius: "50%",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.25rem",
};

// ── Label de section (en-tête de card) ───────────────────────
export const sectionHead: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1rem",
    borderBottom: `1px solid ${cssVar.borderSubtle}`,
    background: cssVar.bgSectionAlt,
};

export const sectionHeadTitle: React.CSSProperties = {
    margin: 0,
    fontSize: typography.base,
    fontWeight: typography.bold,
    color: cssVar.textPrimary,
};

// ── Fond page centré (auth) ───────────────────────────────────
export const authPageRoot: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: cssVar.bgDark,
    padding: "1.5rem",
    position: "relative",
    overflow: "hidden",
};

// ── Glow ambiant ─────────────────────────────────────────────
export const glowOverlay: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    background:
        "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(245,158,11,0.07) 0%, transparent 70%)",
};