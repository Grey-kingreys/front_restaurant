// src/lib/apiErrors.ts
// Mise en forme des erreurs de validation renvoyées par l'API.
//
// Le backend répond `{ success: false, message, errors: { champ: ["msg"] } }`.
// Sans le nom du champ, l'utilisateur lit « Assurez-vous que ce champ comporte au
// plus 10 caractères. » sans savoir DE QUEL champ il s'agit. Ce module traduit la
// clé technique en libellé métier et produit un message directement actionnable.

/**
 * Libellés métier des champs d'API, tels qu'ils apparaissent dans les formulaires.
 * Une clé absente retombe sur un libellé dérivé du nom technique
 * (`client_telephone` → « Client telephone »), donc la table n'a pas besoin
 * d'être exhaustive pour rester utile.
 */
export const FIELD_LABELS: Record<string, string> = {
    // Générique
    non_field_errors: "",
    detail: "",

    // Tables
    numero_table: "Numéro / nom de la table",
    nombre_places: "Nombre de places",
    login: "Login du compte table",
    password: "Mot de passe",
    nom_complet: "Nom affiché",

    // Compte / auth
    email: "Email",
    old_password: "Mot de passe actuel",
    new_password: "Nouveau mot de passe",
    password_confirm: "Confirmation du mot de passe",
    telephone: "Téléphone",

    // Restaurant
    nom: "Nom",
    email_admin: "Email de l'administrateur",
    adresse: "Adresse",
    latitude: "Latitude",
    longitude: "Longitude",
    rayon_connexion: "Rayon de connexion",
    duree_session_table: "Durée de session table",
    accept_livraison: "Livraison à domicile",
    accept_emporter: "À emporter",
    reservation_delai_annulation_heures: "Délai d'annulation des réservations",

    // Menu
    prix_unitaire: "Prix unitaire",
    description: "Description",
    categorie: "Catégorie",
    image: "Image",
    image_url: "URL de l'image",
    necessite_validation_cuisine: "Validation cuisine",

    // Rôles
    role: "Rôle",
    slug: "Identifiant du rôle",
    dashboard_type: "Tableau de bord",
    permission_ids: "Permissions",

    // Commandes
    items: "Articles",
    plat_id: "Plat",
    quantite: "Quantité",
    table_id: "Table",
    type_commande: "Type de commande",
    client_nom: "Nom du client",
    client_telephone: "Téléphone du client",
    client_adresse_livraison: "Adresse de livraison",
    mode_paiement: "Mode de paiement",
    motif_annulation: "Motif d'annulation",

    // Caisse
    montant: "Montant",
    motif: "Motif",
    motif_refus: "Motif du refus",
    motif_ecart: "Motif de l'écart",
    montant_physique: "Montant physique compté",
    solde_initial: "Solde initial",

    // Réservations
    date_reservation: "Date de la réservation",
    heure: "Heure",
    nombre_personnes: "Nombre de personnes",
    note: "Note",
};

/** `client_telephone` → « Client telephone » — filet de sécurité lisible. */
function libelleParDefaut(champ: string): string {
    const mots = champ.replace(/_/g, " ").trim();
    return mots.charAt(0).toUpperCase() + mots.slice(1);
}

export type ApiErrors = Record<string, unknown> | null | undefined;

/**
 * Transforme `{ numero_table: ["Au plus 10 caractères."] }` en
 * « Numéro / nom de la table : Au plus 10 caractères. »
 *
 * Les erreurs globales (`non_field_errors`, `detail`) sont rendues telles quelles.
 * Plusieurs champs en erreur sont séparés par un retour à la ligne, afin que
 * l'utilisateur corrige tout en une passe.
 */
export function formatApiErrors(errors: ApiErrors): string {
    if (!errors || typeof errors !== "object") return "";

    const lignes: string[] = [];
    for (const [champ, valeur] of Object.entries(errors)) {
        const messages = (Array.isArray(valeur) ? valeur : [valeur])
            .map(m => (typeof m === "string" ? m : JSON.stringify(m)))
            .filter(Boolean);
        if (messages.length === 0) continue;

        const label = champ in FIELD_LABELS ? FIELD_LABELS[champ] : libelleParDefaut(champ);
        lignes.push(label ? `${label} : ${messages.join(" ")}` : messages.join(" "));
    }
    return lignes.join("\n");
}

/**
 * Message d'erreur prêt à afficher pour une réponse API en échec.
 * Privilégie le détail par champ (actionnable) et retombe sur le message global.
 */
export function apiErrorMessage(
    // Volontairement plus permissif que `ApiResponse` : certains helpers renvoient
    // un objet allégé où `message` est optionnel (réponse non-JSON, 204…).
    res: { message?: string | null; errors?: ApiErrors },
    fallback = "Une erreur est survenue.",
): string {
    return formatApiErrors(res.errors) || res.message?.trim() || fallback;
}

/**
 * Même chose pour une exception levée par `apiRequest` (le client attache
 * `message` et `errors` à l'erreur rejetée).
 */
export function thrownErrorMessage(e: unknown, fallback = "Erreur de connexion."): string {
    const anyErr = e as { message?: string; errors?: ApiErrors } | null;
    if (!anyErr) return fallback;
    return formatApiErrors(anyErr.errors) || anyErr.message?.trim() || fallback;
}
