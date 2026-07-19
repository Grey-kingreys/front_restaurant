// src/lib/continents.ts
// Regroupement des pays (ISO 3166-1 alpha-2) par continent + couleurs,
// pour colorer les continents sur la carte "Monde" via le tileset Mapbox
// country-boundaries-v1.

export const CONTINENT_COLORS: Record<string, string> = {
    Afrique: "#f59e0b",
    Europe: "#3b82f6",
    Asie: "#ef4444",
    "Amérique du Nord": "#22c55e",
    "Amérique du Sud": "#8b5cf6",
    Océanie: "#14b8a6",
    Antarctique: "#94a3b8",
};

const CONTINENT_CODES: Record<string, string[]> = {
    Afrique: ["DZ","AO","BJ","BW","BF","BI","CM","CV","CF","TD","KM","CG","CD","CI","DJ","EG","GQ","ER","SZ","ET","GA","GM","GH","GN","GW","KE","LS","LR","LY","MG","MW","ML","MR","MU","MA","MZ","NA","NE","NG","RW","ST","SN","SC","SL","SO","ZA","SS","SD","TZ","TG","TN","UG","ZM","ZW","EH"],
    Europe: ["AL","AD","AT","BY","BE","BA","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IS","IE","IT","XK","LV","LI","LT","LU","MT","MD","MC","ME","NL","MK","NO","PL","PT","RO","RU","SM","RS","SK","SI","ES","SE","CH","UA","GB","VA"],
    Asie: ["AF","AM","AZ","BH","BD","BT","BN","KH","CN","GE","IN","ID","IR","IQ","IL","JP","JO","KZ","KW","KG","LA","LB","MY","MV","MN","MM","NP","KP","OM","PK","PS","PH","QA","SA","SG","KR","LK","SY","TW","TJ","TH","TL","TR","TM","AE","UZ","VN","YE","HK","MO"],
    "Amérique du Nord": ["AG","BS","BB","BZ","CA","CR","CU","DM","DO","SV","GD","GT","HT","HN","JM","MX","NI","PA","KN","LC","VC","TT","US","GL","PR"],
    "Amérique du Sud": ["AR","BO","BR","CL","CO","EC","GY","PY","PE","SR","UY","VE","GF","FK"],
    Océanie: ["AU","FJ","KI","MH","FM","NR","NZ","PW","PG","WS","SB","TO","TV","VU","NC","PF"],
    Antarctique: ["AQ"],
};

/**
 * Construit une expression Mapbox `match` sur la propriété iso_3166_1
 * qui renvoie une couleur par continent.
 */
export function continentColorExpression(): unknown[] {
    const expr: unknown[] = ["match", ["get", "iso_3166_1"]];
    for (const [continent, codes] of Object.entries(CONTINENT_CODES)) {
        expr.push(codes, CONTINENT_COLORS[continent]);
    }
    expr.push("#5b6472"); // défaut
    return expr;
}
