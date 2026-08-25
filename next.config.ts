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
 * ⚠️ Next fige `redirects()` au BUILD, dans `.next/routes-manifest.json` : une
 * variable d'environnement posée au seul démarrage du conteneur n'aurait aucun
 * effet. On applique donc la même technique que pour les `NEXT_PUBLIC_*` : on
 * compile des **sentinelles** que `docker/entrypoint.sh` remplace au démarrage.
 * Un emplacement laissé à sa sentinelle est inerte — aucun en-tête `Host` réel ne
 * peut valoir « RUNTIME_LEGACY_HOST_1_PLACEHOLDER ».
 *
 * Configuration : voir `backend/DEPLOY-DOKPLOY.md` §8.
 *   CANONICAL_HOST=resfly.org
 *   LEGACY_HOSTS=resfly.kingreys.fr,www.resfly.kingreys.fr
 */
const NB_EMPLACEMENTS_ANCIENS_DOMAINES = 3;

function redirectionsAncienDomaine() {
  const canoniqueEnv = process.env.CANONICAL_HOST?.trim();
  const anciensEnv = (process.env.LEGACY_HOSTS ?? "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  // Valeurs fournies au build (--build-arg) : elles sont figées telles quelles.
  // Sinon on compile des sentinelles, substituées au démarrage du conteneur.
  const canonique = canoniqueEnv || "RUNTIME_CANONICAL_HOST_PLACEHOLDER";
  const anciens =
    anciensEnv.length > 0
      ? anciensEnv
      : Array.from(
          { length: NB_EMPLACEMENTS_ANCIENS_DOMAINES },
          (_, i) => `RUNTIME_LEGACY_HOST_${i + 1}_PLACEHOLDER`,
        );

  return anciens
    .filter((ancien) => ancien !== canonique)
    .map((ancien) => ({
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
