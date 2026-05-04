import { getApiUrl, getMediaUrl } from "@/utils/apiUrl";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
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
  Package,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollFadeIn } from "@/hooks/useScrollAnimation.tsx";

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

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name-asc", label: "Nombre (A-Z)" },
  { value: "name-desc", label: "Nombre (Z-A)" },
  { value: "price-asc", label: "Precio (menor)" },
  { value: "price-desc", label: "Precio (mayor)" },
];

const DEFAULT_PRICE_RANGE: [number, number] = [0, 2000];
const DEFAULT_SORT: SortOption = "name-asc";
const DEFAULT_CATEGORY = "all";

interface FilterContentProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  priceRange: [number, number];
  setPriceRange: (val: [number, number]) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  maxPrice: number;
  categories: Category[];
  onSearch: (e: React.FormEvent) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  onSubmit?: () => void;
}

function FilterContent({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  maxPrice,
  categories,
  onSearch,
  onClearFilters,
  activeFiltersCount,
  onSubmit,
}: FilterContentProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3 text-sm">Buscar</h3>
        <form
          onSubmit={(e) => {
            onSearch(e);
            onSubmit?.();
          }}
          className="flex gap-2"
        >
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
          <SelectContent position="popper" sideOffset={4}>
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
          onValueChange={(val) => setPriceRange(val as [number, number])}
          min={0}
          max={maxPrice || 5000}
          step={maxPrice > 1000 ? 100 : 50}
          className="mb-4"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Mínimo</label>
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => {
                const val = Math.max(0, Math.min(Number(e.target.value), priceRange[1] - 1));
                setPriceRange([val, priceRange[1]]);
              }}
              min={0}
              max={priceRange[1] - 1}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Máximo</label>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => {
                const val = Math.max(priceRange[0] + 1, Number(e.target.value));
                setPriceRange([priceRange[0], val]);
              }}
              min={priceRange[0] + 1}
              max={maxPrice || 5000}
              className="h-9 text-sm"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          <strong>Nota:</strong> El máximo se ajusta al precio más alto de los productos disponibles ({maxPrice ? formatPrice(maxPrice) : "5000 €"})
        </p>
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
          <SelectContent position="popper" sideOffset={4}>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {activeFiltersCount > 0 && (
        <Button variant="outline" className="w-full" onClick={onClearFilters}>
          <X className="w-4 h-4 mr-2" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );
}

const cleanImageUrl = getMediaUrl;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>(DEFAULT_CATEGORY);
  const [priceRange, setPriceRange] = useState<[number, number]>(DEFAULT_PRICE_RANGE);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState<SortOption>(DEFAULT_SORT);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarExiting, setSidebarExiting] = useState(false);

  const toggleSidebar = useCallback(() => {
    if (showSidebar) {
      setSidebarExiting(true);
      setTimeout(() => {
        setShowSidebar(false);
        setSidebarExiting(false);
      }, 200);
    } else {
      setShowSidebar(true);
    }
  }, [showSidebar]);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(() => new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(() => new Set());
  const [localFavorites, setLocalFavorites] = useState<Set<string>>(() => new Set(getFavorites()));
  const [animateCards, setAnimateCards] = useState(false);
  const [animatingHeart, setAnimatingHeart] = useState<number | null>(null);

  const toggleFavorite = useCallback((e: React.MouseEvent, productId: number) => {
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
      setLocalFavorites((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
    setAnimatingHeart(productId);
    setTimeout(() => setAnimatingHeart(null), 300);
  }, [localFavorites]);

  const params = new URLSearchParams(location.search);
  const query = params.get("q") || "";

  const fetchProducts = useCallback(async (searchTerm: string) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    const queryString = params.toString();
    const url = queryString
      ? `/api/v1/products/?${queryString}`
      : "/api/v1/products/";

    try {
      const res = await fetch(getApiUrl(url));
      if (!res.ok) throw new Error("Error al obtener productos");
      const data = await res.json();
      const productsData = Array.isArray(data)
        ? data
        : data.results || data.data || [];
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
    const sortFn = (a: Product, b: Product) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    };

    const categoryFilter = selectedCategory !== DEFAULT_CATEGORY
      ? (p: Product) => p.category_name === selectedCategory
      : () => true;

    const priceFilter = (p: Product) =>
      p.price >= priceRange[0] && p.price <= priceRange[1];

    return [...products]
      .filter((p) => categoryFilter(p) && priceFilter(p))
      .sort(sortFn);
  }, [products, selectedCategory, priceRange, sortBy]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const categoryParams = new URLSearchParams();
        const productParams = new URLSearchParams();

        if (query) {
          productParams.set('search', query);
        }

        const [categoriesRes, productsRes] = await Promise.all([
          fetch(getApiUrl(`/api/v1/categories/?${categoryParams.toString()}`)),
          fetch(getApiUrl(`/api/v1/products/?${productParams.toString()}`)),
        ]);

        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.results || categoriesData.data || categoriesData);

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          const productsList = Array.isArray(productsData)
            ? productsData
            : productsData.results || productsData.data || [];
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
        setTimeout(() => setAnimateCards(true), 100);
      }
    };

    loadInitialData();
  }, [query]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const newUrl = searchQuery
      ? `/products?q=${encodeURIComponent(searchQuery)}`
      : "/products";
    navigate(newUrl);
    fetchProducts(searchQuery);
  }, [searchQuery, navigate, fetchProducts]);

  const handleImageError = useCallback((productId: number) => {
    setImageErrors((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  }, []);

  const handleImageLoad = useCallback((productId: number) => {
    setLoadedImages((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedCategory(DEFAULT_CATEGORY);
    setSortBy(DEFAULT_SORT);
    setPriceRange([0, maxPrice]);
    setSearchQuery("");
    navigate("/products");
    fetchProducts("");
}, [maxPrice, navigate, fetchProducts]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (query) count++;
    if (selectedCategory !== DEFAULT_CATEGORY) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    return count;
  }, [query, selectedCategory, priceRange, maxPrice]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="hidden lg:flex"
                title={showSidebar ? "Ocultar filtros" : "Mostrar filtros"}
              >
                {showSidebar ? (
                  <PanelLeftClose className="w-5 h-5" />
                ) : (
                  <PanelLeft className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFiltersMobile(true)}
                className="lg:hidden flex items-center gap-2 bg-card"
              >
                <Filter className="w-4 h-4" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
          <button
            onClick={() => navigate("/home")}
            className="text-muted-foreground hover:text-primary"
          >
            Volver
          </button>
          <span className="text-muted-foreground">/</span>
          <Link
            to="/products"
            className="text-foreground hover:text-primary"
          >
            Productos
          </Link>
          {query && (
            <>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">"{query}"</span>
            </>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {(showSidebar || sidebarExiting) && (
            <aside className={`hidden lg:block lg:w-64 shrink-0 ${sidebarExiting ? 'sidebar-animate-exit' : 'sidebar-animate-enter'}`}>
              <div className="lg:sticky lg:top-24 space-y-6">
                <FilterContent
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  maxPrice={maxPrice}
                  categories={categories}
                  onSearch={handleSearch}
                  onClearFilters={clearFilters}
                  activeFiltersCount={activeFiltersCount}
                />
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

            <div
              className={`grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 ${
                animateCards ? "animate-cards" : ""
              }`}
            >
              {filteredProducts.map((product, index) => {
                const cleanedUrl = cleanImageUrl(product.image);
                const hasError = imageErrors.has(product.id);
                const showImage = cleanedUrl && !hasError;
                const isImageLoaded = loadedImages.has(product.id);

                return (
                  <ScrollFadeIn key={product.id} delay={index % 8}>
                    <Link
                      to={`/products/${product.id}`}
                      className="block h-full"
                    >
                    <Card
                      className={`overflow-hidden transition-all hover:shadow-md sm:hover:shadow-lg h-full group flex flex-col card-hover-lift ${
                        animateCards ? "product-card-animated" : ""
                      }`}
                    >
                      <div className="aspect-square relative bg-muted overflow-hidden shrink-0">
                        {showImage ? (
                          <img
                            src={cleanedUrl}
                            alt={product.name}
                            className={`object-cover w-full h-full transition-transform group-hover:scale-105 ${
                              isImageLoaded ? "animate-image-fade-in" : ""
                            }`}
                            onLoad={() => handleImageLoad(product.id)}
                            onError={() => handleImageError(product.id)}
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50 animate-image-fade-in">
                            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16" />
                            <span className="text-xs">Sin imagen</span>
                          </div>
                        )}
                        <button
                          onClick={(e) => toggleFavorite(e, product.id)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-background/80 hover:bg-background transition-colors"
                          aria-label={
                            localFavorites.has(String(product.id))
                              ? "Quitar de favoritos"
                              : "Agregar a favoritos"
                          }
                        >
                          <Heart
                            className={`w-5 h-5 transition-all ${
                              localFavorites.has(String(product.id))
                                ? "fill-red-500 text-red-500"
                                : "text-muted-foreground"
                            } ${
                              animatingHeart === product.id
                                ? "animate-heart-pulse"
                                : ""
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
                  </ScrollFadeIn>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Dialog
        open={showFiltersMobile}
        onOpenChange={setShowFiltersMobile}
      >
<DialogContent className="max-h-[80vh] overflow-y-auto bg-card">
          <FilterContent
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            maxPrice={maxPrice}
            categories={categories}
            onSearch={handleSearch}
            onClearFilters={clearFilters}
            activeFiltersCount={activeFiltersCount}
            onSubmit={() => setShowFiltersMobile(false)}
          />
          <Button
            className="w-full mt-4"
            onClick={() => setShowFiltersMobile(false)}
          >
            Aplicar filtros
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
