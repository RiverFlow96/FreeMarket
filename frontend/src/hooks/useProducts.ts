import { useState, useCallback, useRef } from "react";
import { getApiUrl } from "@/utils/apiUrl";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string | null;
  category_name?: string;
  category?: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string;
  fetchProducts: (searchTerm?: string) => Promise<void>;
  refetch: () => Promise<void>;
}

const productCache = new Map<string, { data: Product[]; timestamp: number }>();
const CACHE_DURATION_MS = 5 * 60 * 1000;

export function useProducts(initialQuery?: string): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const lastFetchRef = useRef<{ url: string; promise: Promise<void> } | null>(null);
  const lastQueryRef = useRef(initialQuery);

  const fetchProducts = useCallback(async (searchTerm?: string) => {
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/products/?${queryString}`
      : "/api/v1/products/";

    const cacheKey = url;
    const cached = productCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      setProducts(cached.data);
      setLoading(false);
      return;
    }

    if (lastFetchRef.current?.url === url) {
      await lastFetchRef.current.promise;
      return;
    }

    setLoading(true);
    setError("");

    const fetchPromise = (async () => {
      try {
        const res = await fetch(getApiUrl(url));
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();

        // Handle both old format (results) and new format (data.results)
        let productsData: Product[];
        if (Array.isArray(data)) {
          productsData = data;
        } else if (data.results) {
          productsData = data.results;
        } else if (data.data) {
          productsData = data.data;
        } else {
          productsData = [];
        }

        productCache.set(cacheKey, { data: productsData, timestamp: Date.now() });
        setProducts(productsData);
      } catch {
        setError("No se pudieron cargar los productos.");
      } finally {
        setLoading(false);
        if (lastFetchRef.current?.url === url) {
          lastFetchRef.current = null;
        }
      }
    })();

    lastFetchRef.current = { url, promise: fetchPromise };
    lastQueryRef.current = searchTerm;

    await fetchPromise;
  }, []);

  const refetch = useCallback(async () => {
    await fetchProducts(lastQueryRef.current);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    fetchProducts,
    refetch,
  };
}
