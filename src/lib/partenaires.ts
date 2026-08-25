// src/lib/partenaires.ts
// Liste des partenaires affichés sur la landing (section #partenaires).
// Vide pour l'instant - ajouter les entrées ici au fur et à mesure.
// La section Partenaires se met à jour automatiquement : si la liste est vide,
// elle affiche un encart « devenir partenaire » à la place de la grille de logos.

export interface Partenaire {
  /** Nom affiché (aussi utilisé comme alt du logo). */
  nom: string;
  /** URL du logo (image accessible publiquement, ex. /partenaires/xxx.png ou une URL externe). */
  logoUrl: string;
  /** Site web du partenaire (optionnel) - rend le logo cliquable. */
  siteUrl?: string;
  /** Courte description / type de partenariat (optionnel). */
  description?: string;
}

export const PARTENAIRES: Partenaire[] = [
  // Exemple (à dupliquer / remplacer) :
  // {
  //   nom: "Orange Money",
  //   logoUrl: "/partenaires/orange-money.png",
  //   siteUrl: "https://orange.gn",
  //   description: "Paiement mobile",
  // },
];
