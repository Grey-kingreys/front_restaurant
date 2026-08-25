import type { NextConfig } from "next";

/**
 * Autorise next/image à charger les médias servis par le backend.
 * En prod, l'hôte est dérivé de NEXT_PUBLIC_API_URL (ex. https://api.mondomaine.com/api
 * → autorise https://api.mondomaine.com/media/**). En dev, on garde localhost:8000.
 */
type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const remotePatterns: RemotePattern[] = [
  { protocol: "http", hostname: "localhost", port: "8000", pathname: "/media/**" },
  { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/media/**" },
];

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
if (apiUrl) {
  try {
    const { protocol, hostname, port } = new URL(apiUrl);
    // N'ajoute l'hôte de prod que s'il diffère de localhost (déjà couvert au-dessus)
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      remotePatterns.push({
        protocol: protocol.replace(":", "") as "http" | "https",
        hostname,
        port: port || undefined,
        pathname: "/media/**",
      });
    }
  } catch {
    // NEXT_PUBLIC_API_URL invalide : on ignore, les patterns localhost restent actifs
  }
}

/**
 * Redirection des anciens domaines vers le domaine canonique.
 *
 * Indispensable lors d'un changement de nom de domaine : les QR codes collés sur
 * les tables encodent `FRONTEND_URL/auth/qr/<token>/` au moment de leur impression.
 * Un QR imprimé sous l'ancien domaine doit continuer à fonctionner, sinon il faut
 * réimprimer tous les QR de tous les restaurants. Même chose pour les liens de
 * livraison déjà envoyés aux livreurs et les liens de suivi dans les SMS de reçu.
 *
 * D'où une redirection **permanente** (308, qui préserve la méthode et le corps de
 * requête, contrairement à un 301/302) et **qui conserve le chemin et la query**.
 *
 * Pilotage par variables d'environnement, lues au démarrage du serveur :
 *   CANONICAL_HOST=resfly.org
 *   LEGACY_HOSTS=resfly.kingreys.fr,www.resfly.kingreys.fr
 * Sans `CANONICAL_HOST`, aucune redirection n'est installée (cas du dev local).
 */
function redirectionsAncienDomaine() {
  const canonique = process.env.CANONICAL_HOST?.trim();
  const anciens = (process.env.LEGACY_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter((h) => h && h !== canonique);

  if (!canonique || anciens.length === 0) return [];

  return anciens.map((ancien) => ({
    source: "/:chemin*",
    has: [{ type: "host" as const, value: ancien }],
    destination: `https://${canonique}/:chemin*`,
    permanent: true,
  }));
}

const nextConfig: NextConfig = {
  // Build autonome : bundle minimal (server.js + deps nécessaires) pour l'image Docker de prod
  output: "standalone",
  images: {
    remotePatterns,
  },
  async redirects() {
    return redirectionsAncienDomaine();
  },
};

export default nextConfig;
