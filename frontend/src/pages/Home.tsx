import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { ShoppingBag, Package, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonList } from "@/components/ui/SkeletonList";
import { useAuthStore } from "@/store/authStore";
import { getCurrencyIcon, type Currency } from "@/utils/currency";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string | null;
}

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

export function Home() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const res = await fetch("/api/v1/products/");
        if (res.ok) {
          const data = await res.json();
          const productsList = Array.isArray(data) ? data : data.results || data;
          setRecentProducts(productsList.slice(0, 8));
        }
      } catch (err) {
        console.error("Error fetching recent products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentProducts();
  }, []);

  const handleImageError = (productId: number) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  return (
    <div className="min-h-screen w-full">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg">FreeMarket</span>
          </Link>
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <Button asChild>
                <Link to="/login">Iniciar Sesión</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/profile">Mi Perfil</Link>
                </Button>
                <Button variant="secondary" onClick={handleLogout}>
                  Cerrar Sesión
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100/50 overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.08),transparent_40%)]" />

        <div className="relative z-10 flex flex-col items-center gap-10 p-6 sm:p-10 w-full max-w-3xl mx-4">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                <ShoppingBag className="w-9 h-9 text-white" />
              </div>
            </div>
            <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl text-gray-900 tracking-tight">
              Free<span className="text-primary">Market</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 font-medium max-w-lg">
              La plataforma para comprar y vender productos de forma fácil y segura
            </p>
          </div>

          <div className="w-full max-w-xl">
            <SearchBar />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Button variant="outline" asChild>
              <Link to="/products">Explorar productos</Link>
            </Button>
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/sell">Vender producto</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/register">Regístrate para vender</Link>
              </Button>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2">
            <div className="w-1 h-2 bg-gray-300 rounded-full" />
          </div>
        </div>
      </section>

      {!loading && recentProducts.length > 0 && (
        <section className="py-16 sm:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold">
                Productos recientes
              </h2>
              <Button variant="link" asChild>
                <Link to="/products">Ver todos</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {recentProducts.map((product) => {
                const cleanedUrl = cleanImageUrl(product.image);
                const hasError = imageErrors.has(product.id);
                const showImage = cleanedUrl && !hasError;
                return (
                  <Link to={`/products/${product.id}`} key={product.id} className="block h-full">
                    <Card className="overflow-hidden transition-all hover:shadow-md h-full group flex flex-col">
                      <div className="aspect-square relative bg-muted overflow-hidden shrink-0">
                        {showImage ? (
                          <img src={cleanedUrl} alt={product.name} className="object-cover w-full h-full transition-transform group-hover:scale-105" onError={() => handleImageError(product.id)} loading="lazy" />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50">
                            <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16" />
                            <span className="text-xs">Sin imagen</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 p-3 sm:p-4 pt-0">
                        <CardHeader className="p-0 mb-2">
                          <CardTitle className="text-sm sm:text-base line-clamp-1">{product.name}</CardTitle>
                        </CardHeader>
                        <CardDescription className="text-xs sm:text-sm line-clamp-2">{product.description}</CardDescription>
                        <div className="mt-3">
                          <span className="text-lg sm:text-xl font-bold text-primary">
                            <span className="text-sm mr-1">{getCurrencyIcon(product.currency as Currency)}</span>
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
        </section>
      )}

      {loading && (
        <section className="py-16 sm:py-24 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Productos recientes</h2>
            <SkeletonList count={8} />
          </div>
        </section>
      )}

      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
            ¿Por qué elegir FreeMarket?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Miles de productos</h3>
              <p className="text-muted-foreground text-sm">
                Encuentra lo que buscas entre miles de productos disponibles
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Comunidad activa</h3>
              <p className="text-muted-foreground text-sm">
                Conecta con vendedores y compradores de confianza
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Transacciones seguras</h3>
              <p className="text-muted-foreground text-sm">
                Compra y vende con la tranquilidad de estar protegido
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fácil de usar</h3>
              <p className="text-muted-foreground text-sm">
                Interfaz intuitiva para una experiencia de usuario fluida
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            ¿Qué esperas para empezar?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Únete a miles de usuarios que ya están vendiendo y comprando en FreeMarket
          </p>
          <Button size="lg" asChild>
            <Link to="/products">Ver productos</Link>
          </Button>
        </div>
      </section>

      <footer className="py-8 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold">FreeMarket</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2024 FreeMarket. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
