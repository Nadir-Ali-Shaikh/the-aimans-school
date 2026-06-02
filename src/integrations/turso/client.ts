import { createClient } from "@libsql/client/web";

function createTursoClient() {
  // Try VITE prefix first (for client/Vite environment), then process.env (for Node/SSR)
  const url = (typeof import.meta !== "undefined" && import.meta.env?.VITE_TURSO_DATABASE_URL) || 
              (typeof process !== "undefined" && process.env?.TURSO_DATABASE_URL);
  
  const authToken = (typeof import.meta !== "undefined" && import.meta.env?.VITE_TURSO_AUTH_TOKEN) || 
                    (typeof process !== "undefined" && process.env?.TURSO_AUTH_TOKEN);

  if (!url) {
    return null;
  }

  return createClient({
    url,
    authToken,
  });
}

let _turso: ReturnType<typeof createTursoClient> | undefined;

export const turso = new Proxy({} as ReturnType<typeof createTursoClient>, {
  get(_, prop, receiver) {
    if (_turso === undefined) {
      _turso = createTursoClient();
    }
    if (!_turso) {
      // Return a dummy execution function if unconfigured
      if (prop === "execute") {
        return async () => {
          throw new Error("[Turso] Client is not configured. Please set VITE_TURSO_DATABASE_URL and VITE_TURSO_AUTH_TOKEN.");
        };
      }
      return undefined;
    }
    return Reflect.get(_turso, prop, receiver);
  },
});

export const isTursoConfigured = (): boolean => {
  const url = (typeof import.meta !== "undefined" && import.meta.env?.VITE_TURSO_DATABASE_URL) || 
              (typeof process !== "undefined" && process.env?.TURSO_DATABASE_URL);
  return !!url;
};
