// src/lib/blog.ts
// Articles du blog. Vide pour l'instant — ajouter les entrées ici.
// La page /blog affiche automatiquement la grille d'articles si la liste est
// remplie, sinon un état « bientôt ».

export interface Article {
  /** Identifiant URL (ex. "lancer-son-restaurant-en-ligne"). */
  slug: string;
  titre: string;
  /** Résumé court affiché sur la carte. */
  extrait: string;
  /** Date ISO (ex. "2026-07-21"). */
  date: string;
  auteur?: string;
  /** URL de l'image de couverture (optionnel). */
  coverUrl?: string;
}

export const ARTICLES: Article[] = [
  // {
  //   slug: "digitaliser-son-restaurant",
  //   titre: "5 étapes pour digitaliser son restaurant en Guinée",
  //   extrait: "Du carnet papier au QR code : un guide simple pour passer au numérique sans se compliquer la vie.",
  //   date: "2026-07-21",
  //   auteur: "L'équipe resfly",
  // },
];
