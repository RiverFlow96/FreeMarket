const FAVORITES_KEY = "favorites";

export function getFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function addFavorite(productId: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(productId)) {
    saveFavorites([...favorites, productId]);
  }
}
export function removeFavorite(productId: string): void {
  const favorites = getFavorites();
  saveFavorites(favorites.filter((id) => id !== productId));
}

export function isFavorite(productId: string): boolean {
  return getFavorites().includes(productId);
}

export function clearFavorites(): void {
  localStorage.removeItem(FAVORITES_KEY);
}

export function toggleFavorite(productId: string): boolean {
  if (isFavorite(productId)) {
    removeFavorite(productId);
    return false;
  } else {
    addFavorite(productId);
    return true;
  }
}
