export const getApiUrl = (path: string): string => {
  // En producción, VITE_API_URL normalmente es https://freemarket-backend-p9rs.onrender.com/api/v1
  // Si la ruta ya empieza con /api/v1, extraemos solo el origen para evitar duplicados.
  const envUrl = import.meta.env.VITE_API_URL;

  if (!envUrl) return path;

  // Si la url de entorno incluye /api/v1, lo removemos para usarlo como origen base
  const origin = envUrl.replace(/\/api\/v1\/?$/, '');

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

    const envUrl = import.meta.env.VITE_API_URL;
    if (!envUrl) return decoded; // Local dev con vite proxy

    const origin = envUrl.replace(/\/api\/v1\/?$/, '');
    return `${origin}${decoded}`;
  } catch {
    return null;
  }
};
