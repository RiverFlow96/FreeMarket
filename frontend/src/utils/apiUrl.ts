const PRODUCTION_API_ORIGIN = "https://freemarket-ivim.onrender.com";

const getApiOrigin = (): string => {
  const configuredUrl = import.meta.env.VITE_API_URL;
  const apiUrl = configuredUrl || (import.meta.env.PROD ? PRODUCTION_API_ORIGIN : "");
  return apiUrl.replace(/\/api\/v1\/?$/, "").replace(/\/$/, "");
};

export const getApiUrl = (path: string): string => {
  // Si la ruta ya empieza con /api/v1, extraemos solo el origen para evitar duplicados.
  const origin = getApiOrigin();
  if (!origin) return path;

  return `${origin}${path}`;
};

export const getMediaUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;

  try {
    let decoded = decodeURIComponent(path);

    // Si ya es una URL absoluta, la devolvemos tal cual
    if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
      return decoded;
    }

    // Limpiamos la ruta
    if (decoded.startsWith("/backend/media/")) {
      decoded = decoded.replace("/backend", "");
    } else if (decoded.includes("/media/")) {
      const match = decoded.match(/(\/media\/.+)/);
      if (match) decoded = match[1];
    } else if (!decoded.startsWith('/')) {
      decoded = `/media/${decoded}`; // Por defecto asumimos que va en media
    }

    const origin = getApiOrigin();
    if (!origin) return decoded; // Local dev con vite proxy

    return `${origin}${decoded}`;
  } catch {
    return null;
  }
};
