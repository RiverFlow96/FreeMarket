export const getApiUrl = (path: string): string => {
  // En producción, VITE_API_URL normalmente es https://freemarket-backend-p9rs.onrender.com/api/v1
  // Si la ruta ya empieza con /api/v1, extraemos solo el origen para evitar duplicados.
  const envUrl = import.meta.env.VITE_API_URL;

  if (!envUrl) return path;

  // Si la url de entorno incluye /api/v1, lo removemos para usarlo como origen base
  const origin = envUrl.replace(/\/api\/v1\/?$/, '');

  return `${origin}${path}`;
};
