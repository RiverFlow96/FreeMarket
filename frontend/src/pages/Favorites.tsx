import { getApiUrl, getMediaUrl } from "@/utils/apiUrl";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getFavorites, removeFavorite } from "@/utils/favorites";
import { getCurrencyIcon, type Currency } from "@/utils/currency";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string | null;
  category_name?: string;
}

const cleanImageUrl = getMediaUrl;

async function loadFavoriteProducts(): Promise<Product[]> {
  const favoriteIds = getFavorites();
  if (favoriteIds.length === 0) return [];

  const productPromises = favoriteIds.map((id) =>
    fetch(getApiUrl(`/api/v1/products/${id}/`)).then((res) => {
      if (!res.ok) throw new Error(`Error fetching product ${id}`);
      return res.json();
    })
  );

  const results = await Promise.allSettled(productPromises);
  return results
    .filter((r): r is PromiseFulfilledResult<Product> => r.status === "fulfilled")
    .map((r) => r.value);
}

export default function Favorites() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    let isMounted = true;

    loadFavoriteProducts()
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Error al cargar los favoritos");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRemoveFavorite = (productId: number) => {
    const id = String(productId);
    removeFavorite(id);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  const retryRef = () => {
    setLoading(true);
    loadFavoriteProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los favoritos");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-primary"
          >
            Volver
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Favoritos</span>
        </div>

        <h1 className="text-2xl font-bold mb-6">Mis Favoritos</h1>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg h-64 animate-pulse" />
            ))}
          </div>
        )}

        {error && <ErrorState message={error} onRetry={retryRef} />}

        {!loading && products.length === 0 && (
          <EmptyState
            icon={Heart}
            title="Aún no tienes productos guardados"
            description="Guarda productos que te interesen para verlos aquí"
            action={{
              label: "Explorar productos",
              onClick: () => (window.location.href = "/products"),
            }}
          />
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => {
              const cleanedUrl = cleanImageUrl(product.image);
              const hasError = imageErrors.has(product.id);
              const showImage = cleanedUrl && !hasError;

              return (
                <div key={product.id} className="block h-full relative group">
                  <Link to={`/products/${product.id}`}>
                    <Card className="overflow-hidden transition-all hover:shadow-md sm:hover:shadow-lg h-full group flex flex-col">
                      <div className="aspect-square relative bg-muted overflow-hidden shrink-0">
                        {showImage ? (
                          <img
                            src={cleanedUrl}
                            alt={product.name}
                            className="object-cover w-full h-full transition-transform group-hover:scale-105"
                            onError={() => handleImageError(product.id)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50">
                            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16" />
                            <span className="text-xs">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-3 sm:p-4 pt-0">
                        <CardHeader className="p-0 mb-2">
                          <CardTitle className="text-sm sm:text-base line-clamp-1">
                            {product.name}
                          </CardTitle>
                          {product.category_name && (
                            <Badge
                              variant="secondary"
                              className="mt-1 w-fit text-xs"
                            >
                              {product.category_name}
                            </Badge>
                          )}
                        </CardHeader>
                        <div className="flex-1">
                          <CardDescription className="text-xs sm:text-sm line-clamp-2">
                            {product.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center justify-between w-full mt-3">
                          <span className="text-lg sm:text-xl font-bold text-primary">
                            <span className="text-sm mr-1">
                              {getCurrencyIcon(product.currency as Currency)}
                            </span>
                            {product.price}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                  <button
                    onClick={() => handleRemoveFavorite(product.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors z-10"
                    aria-label="Quitar de favoritos"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
