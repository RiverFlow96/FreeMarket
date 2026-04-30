import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { formatPrice, getCurrencyIcon, type Currency } from "@/utils/currency";
import { getFavorites, addFavorite, removeFavorite } from "@/utils/favorites";
import { Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { SkeletonList } from "@/components/ui/SkeletonList";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  Filter,
  X,
  Search,
  ShoppingBag,
  Menu,
  PanelLeftClose,
  LogOut,
  PlusCircle,
  User,
  Package,
} from "lucide-react";

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

interface Category {
  name: string;
}

type SortOption = "name-asc" | "name-desc" | "price-asc" | "price-desc";

function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const decoded = decodeURIComponent(url);

    if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
      return decoded;
    }

    if (decoded.startsWith("/backend/media/")) {
      return decoded;
    }

    if (decoded.startsWith("/media/")) {
      return decoded;
    }

    if (decoded.includes("/media/")) {
      const match = decoded.match(/(\/media\/.+)/);
      if (match) return match[1];
    }

    return decoded;
  } catch {
    return null;
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [showSidebar, setShowSidebar] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(() =>
    new Set(getFavorites())
  );

  const toggleFavorite = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const id = String(productId);
    if (localFavorites.has(id)) {
      removeFavorite(id);
      setLocalFavorites((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      addFavorite(id);
      setLocalFavorites((prev) => new Set(prev).add(id));
    }
  };

  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  const fetchProducts = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError("");
    const url = searchTerm
      ? `/api/v1/products/search/?search=${encodeURIComponent(searchTerm)}`
      : "/api/v1/products/";

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al obtener productos");
      const data = await res.json();
      const productsData = Array.isArray(data) ? data : data.results || data;
      setProducts(productsData);

      if (productsData.length > 0) {
        const prices = productsData.map((p: Product) => p.price);
        const max = Math.max(...prices);
        setMaxPrice(max);
        setPriceRange([0, max]);
      }
    } catch {
      setError("No se pudieron cargar los productos.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.category_name === selectedCategory);
    }

    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );

    switch (sortBy) {
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
    }

    return result;
  }, [products, selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoriesRes, productsRes] = await Promise.all([
          fetch("/api/v1/categories/"),
          fetch(
            query
              ? `/api/v1/products/search/?search=${encodeURIComponent(query)}`
              : "/api/v1/products/",
          ),
        ]);

        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.results || categoriesData);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const productsList = Array.isArray(productsData)
            ? productsData
            : productsData.results || productsData;
          setProducts(productsList);

          if (productsList.length > 0) {
            const prices = productsList.map((p: Product) => p.price);
            const max = Math.max(...prices);
            setMaxPrice(max);
            setPriceRange([0, max]);
          }
        } else {
          setError("No se pudieron cargar los productos.");
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newUrl = searchQuery
      ? `/products?q=${encodeURIComponent(searchQuery)}`
      : "/products";
    window.history.pushState({}, "", newUrl);
    fetchProducts(searchQuery);
  };

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSortBy("name-asc");
    setPriceRange([0, maxPrice]);
    setSearchQuery("");
    window.history.pushState({}, "", "/products");
    fetchProducts("");
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (query) count++;
    if (selectedCategory !== "all") count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    return count;
  };

  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-muted-foreground hover:text-foreground"
                title={showSidebar ? "Ocultar filtros" : "Mostrar filtros"}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Link
                to="/"
                className="text-lg sm:text-xl font-bold text-primary flex items-center gap-2 hover:opacity-90 transition-opacity"
              >
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">FreeMarket</span>
              </Link>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {isAuthenticated ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/profile">
                      <User className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden md:inline">Perfil</span>
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                    <Link to="/sell">
                      <PlusCircle className="w-4 h-4 mr-1 sm:mr-2" />
                      <span className="hidden md:inline">Vender</span>
                    </Link>
                  </Button>
                  <span className="text-sm text-muted-foreground hidden lg:inline">
                    {user?.username}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={logout}
                    className="text-muted-foreground hover:text-destructive"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/register">Registrarse</Link>
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
                title={showSidebar ? "Ocultar filtros" : "Mostrar filtros"}
              >
                {showSidebar ? <PanelLeftClose className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
          <Link to="/" className="text-muted-foreground hover:text-primary">
            Inicio
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">Productos</span>
          {query && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">"{query}"</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {showSidebar && (
            <aside className="lg:w-64 shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">
                <div>
                  <h3 className="font-medium mb-3 text-sm">Buscar</h3>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <Input
                      type="search"
                      placeholder="Buscar..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                    <Button type="submit" variant="default" size="icon">
                      <Search className="w-4 h-4" />
                    </Button>
                  </form>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3 text-sm">Categoría</h3>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3 text-sm">Precio</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={(val) =>
                      setPriceRange(val as [number, number])
                    }
                    min={0}
                    max={maxPrice || 5000}
                    step={maxPrice > 1000 ? 100 : 50}
                    className="mb-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{formatPrice(priceRange[0])}</span>
                    <span>{formatPrice(priceRange[1])}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3 text-sm">Ordenar por</h3>
                  <Select
                    value={sortBy}
                    onValueChange={(val) => setSortBy(val as SortOption)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Nombre (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Nombre (Z-A)</SelectItem>
                      <SelectItem value="price-asc">Precio (menor)</SelectItem>
                      <SelectItem value="price-desc">Precio (mayor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeFiltersCount() > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearFilters}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </aside>
          )}

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-xl sm:text-2xl font-bold">
                {query ? `Resultados para "${query}"` : "Todos los productos"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-4 h-4" />
                <span>
                  {filteredProducts.length}{" "}
                  {filteredProducts.length === 1 ? "producto" : "productos"}
                </span>
              </div>
            </div>

            {loading && <SkeletonList count={8} />}

            {error && <ErrorState message={error} onRetry={() => fetchProducts(query)} />}

            {!loading && !error && filteredProducts.length === 0 && (
              query ? (
                <EmptyState
                  icon={Search}
                  title={`No encontramos productos para "${query}"`}
                  description="Intenta con otros términos o verifica la ortografía"
                  action={{
                    label: "Limpiar búsqueda",
                    onClick: clearFilters,
                  }}
                />
              ) : products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No hay productos disponibles"
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="No hay resultados"
                  description="No se encontraron productos con los filtros aplicados"
                  action={{
                    label: "Limpiar filtros",
                    onClick: clearFilters,
                  }}
                />
              )
            )}

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product) => {
                const cleanedUrl = cleanImageUrl(product.image);
                const hasError = imageErrors.has(product.id);
                const showImage = cleanedUrl && !hasError;

                return (
                  <Link
                    to={`/products/${product.id}`}
                    key={product.id}
                    className="block h-full"
                  >
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
                        <button
                          onClick={(e) => toggleFavorite(e, product.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                          aria-label={localFavorites.has(String(product.id)) ? "Quitar de favoritos" : "Agregar a favoritos"}
                        >
                          <Heart
                            className={`w-5 h-5 transition-all ${
                              localFavorites.has(String(product.id))
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
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
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
