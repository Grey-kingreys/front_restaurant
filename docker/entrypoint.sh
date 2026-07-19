#!/bin/sh
set -e

# ─────────────────────────────────────────────────────────────────────────────
# Injection RUNTIME des variables NEXT_PUBLIC_*.
#
# Next.js fige les NEXT_PUBLIC_* au BUILD. Pour pouvoir configurer l'URL de l'API
# (et le token Mapbox) via de simples variables d'env Dokploy — sans rebuild — le
# bundle est compilé avec des sentinelles qu'on remplace ici, au démarrage, par les
# vraies valeurs présentes dans l'environnement du conteneur.
#
# Variables lues (runtime) :
#   NEXT_PUBLIC_API_URL      ex. http://resfly-backend-….sslip.io/api  (défaut: /api)
#   NEXT_PUBLIC_MAPBOX_TOKEN  ex. pk.xxxx                               (optionnel)
# ─────────────────────────────────────────────────────────────────────────────

replace_placeholder() {
  placeholder="$1"
  value="$2"
  [ -z "$value" ] && return 0
  # `|` comme délimiteur sed (les URLs/token n'en contiennent pas)
  grep -rl "$placeholder" /app/.next 2>/dev/null | while IFS= read -r file; do
    sed -i "s|$placeholder|$value|g" "$file"
  done
}

# URL de l'API : défaut = chemin relatif "/api" (same-origin) si non fournie.
replace_placeholder "http://RUNTIME_API_URL_PLACEHOLDER" "${NEXT_PUBLIC_API_URL:-/api}"

# Token Mapbox : remplacé seulement s'il est fourni (sinon la sentinelle reste,
# la carte ne s'affiche pas mais le reste de l'app fonctionne).
replace_placeholder "RUNTIME_MAPBOX_TOKEN_PLACEHOLDER" "${NEXT_PUBLIC_MAPBOX_TOKEN}"

exec node server.js
