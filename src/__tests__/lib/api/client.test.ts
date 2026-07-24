import { apiRequest } from "@/lib/api/client";

/**
 * Régression : quand un refresh JWT partagé est déjà en cours et qu'il ÉCHOUE,
 * les requêtes concurrentes en attente n'étaient jamais réveillées (onRefreshed
 * n'était appelé qu'en cas de succès) → leur `await` restait bloqué à vie.
 * Elles doivent désormais rejeter proprement.
 */
describe("apiRequest — refresh concurrent", () => {
    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem("access_token", "old-access");
        localStorage.setItem("refresh_token", "old-refresh");
        jest.restoreAllMocks();
    });

    it("ne laisse pas les requêtes concurrentes bloquées quand le refresh échoue", async () => {
        global.fetch = jest.fn((url: RequestInfo | URL) => {
            const u = String(url);
            if (u.includes("token/refresh")) {
                // Refresh KO
                return Promise.resolve({ ok: false, status: 401 } as Response);
            }
            // Appels API → 401 (token expiré)
            return Promise.resolve({
                status: 401,
                headers: { get: () => "application/json" },
                json: async () => ({ detail: "unauth" }),
            } as unknown as Response);
        }) as unknown as typeof fetch;

        const results = await Promise.allSettled([apiRequest("/a"), apiRequest("/b")]);

        // Les DEUX rejettent (avant le fix : la 2ᵉ restait bloquée → timeout jest)
        expect(results[0].status).toBe("rejected");
        expect(results[1].status).toBe("rejected");
        expect(localStorage.getItem("access_token")).toBeNull(); // tokens purgés
    });

    it("effectue UN SEUL refresh partagé pour N requêtes concurrentes (chemin nominal)", async () => {
        let refreshCount = 0;
        global.fetch = jest.fn((url: RequestInfo | URL, opts?: RequestInit) => {
            const u = String(url);
            if (u.includes("token/refresh")) {
                refreshCount++;
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: async () => ({ access: "new-access", refresh: "new-refresh" }),
                } as unknown as Response);
            }
            const auth = String((opts?.headers as Record<string, string>)?.["Authorization"] ?? "");
            if (auth.includes("new-access")) {
                return Promise.resolve({
                    status: 200,
                    headers: { get: () => "application/json" },
                    json: async () => ({ ok: true }),
                } as unknown as Response);
            }
            return Promise.resolve({
                status: 401,
                headers: { get: () => "application/json" },
                json: async () => ({}),
            } as unknown as Response);
        }) as unknown as typeof fetch;

        await Promise.all([apiRequest("/a"), apiRequest("/b"), apiRequest("/c")]);

        expect(refreshCount).toBe(1); // un seul refresh pour les 3 requêtes
        expect(localStorage.getItem("access_token")).toBe("new-access");
    });
});
