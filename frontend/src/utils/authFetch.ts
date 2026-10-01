import { useAuthStore } from "../store/authStore";
import { getApiUrl } from "./apiUrl";

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const { getAccessToken, refreshAccessToken, logout } = useAuthStore.getState();

  const finalUrl = getApiUrl(url);
  const token = getAccessToken();
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(finalUrl, { ...options, headers });

  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const newToken = getAccessToken();
      if (newToken) {
        headers.set("Authorization", `Bearer ${newToken}`);
        res = await fetch(finalUrl, { ...options, headers });
      }
    } else {
      logout();
    }
  }

  return res;
}
