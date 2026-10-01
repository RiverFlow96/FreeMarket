import { getApiUrl } from "@/utils/apiUrl";
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { ShoppingBag, Package, Users, Shield, ArrowRight } from "lucide-react";
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

function ScrollFade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-fade-in ${isVisible ? "visible" : ""}`}
      style={{ transitionDelay: delay ? `${delay * 0.1}s` : "0s" }}
    >
      {children}
    </div>
  );
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
        const res = await fetch(getApiUrl("/api/v1/products/"));
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
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center hero-gradient overflow-hidden pt-20">
        <div className="floating-shapes" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--primary)_0%,_transparent_50%)] opacity-20 dark:opacity-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--primary)_0%,_transparent_50%)] opacity-10 dark:opacity-5" />

        <div className="absolute top-20 left-4 sm:left-10 flex flex-col gap-3 opacity-30">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border blur-sm animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
          ))}
        </div>
        <div className="absolute bottom-20 right-4 sm:right-10 flex flex-col gap-3 opacity-30">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-bl from-primary/20 to-primary/5 border blur-sm animate-pulse" style={{ animationDelay: `${i * 0.5 + 0.25}s` }} />
          ))}
        </div>

        <div className="relative z-10 flex flex-col items-center gap-10 p-6 sm:p-10 w-full max-w-4xl mx-4">
          <ScrollFade>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/25 ring-4 ring-primary/10">
                  <ShoppingBag className="w-9 h-9 sm:w-11 sm:h-11 text-primary-foreground" />
                </div>
              </div>
              <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground tracking-tight">
                Free<span className="text-primary">Market</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-xl">
                La plataforma para comprar y vender productos de forma fácil y segura
              </p>
            </div>
          </ScrollFade>

          <div className="w-full max-w-xl">
            <SearchBar />
          </div>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="gap-2 hover:bg-muted/80 border-2"
            >
              <Link to="/products">
                Explorar productos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            {isAuthenticated ? (
              <Button
                size="lg"
                asChild
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
              >
                <Link to="/sell">
                  Vender producto
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <Button
                size="lg"
                asChild
                className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
              >
                <Link to="/register">
                  Empezar a vender
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/30 rounded-full" />
          </div>
        </div>
      </section>

      {!loading && recentProducts.length > 0 && (
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4">
            <ScrollFade>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Productos recientes
                </h2>
                <Button variant="link" asChild>
                  <Link to="/products">Ver todos</Link>
                </Button>
              </div>
            </ScrollFade>
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent -mx-4 px-4">
              <div className="flex gap-4 pb-4" style={{ minWidth: 'min-content' }}>
                {recentProducts.map((product, index) => {
                  const cleanedUrl = cleanImageUrl(product.image);
                  const hasError = imageErrors.has(product.id);
                  const showImage = cleanedUrl && !hasError;
                  return (
                    <ScrollFade delay={index + 1} key={product.id}>
                      <Link to={`/products/${product.id}`} className="block">
                        <Card className="w-56 sm:w-64 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group flex flex-col bg-card border-2 hover:border-primary/30">
                          <div className="aspect-square relative bg-muted overflow-hidden shrink-0">
                            {showImage ? (
                              <img src={cleanedUrl} alt={product.name} className="object-cover w-full h-full transition-transform group-hover:scale-105" onError={() => handleImageError(product.id)} loading="lazy" />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground/50">
                                <ShoppingBag className="w-16 h-16" />
                                <span className="text-xs">Sin imagen</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-primary-foreground text-xs">→</span>
                            </div>
                          </div>
                          <div className="flex flex-col flex-1 p-4 pt-3">
                            <CardHeader className="p-0 mb-1">
                              <CardTitle className="text-base font-semibold line-clamp-1 text-card-foreground">{product.name}</CardTitle>
                            </CardHeader>
                            <CardDescription className="text-sm line-clamp-2 text-muted-foreground">{product.description}</CardDescription>
                            <div className="mt-3 pt-2 border-t border-border/50">
                              <span className="text-xl font-bold text-primary">
                                <span className="text-sm mr-1">{getCurrencyIcon(product.currency as Currency)}</span>
                                {product.price}
                              </span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </ScrollFade>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {loading && (
        <section className="py-16 sm:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12 text-foreground">Productos recientes</h2>
            <SkeletonList count={8} />
          </div>
        </section>
      )}

      <section className="py-16 sm:py-24 bg-gradient-to-b from-secondary/30 to-background dark:from-secondary/20 dark:to-background">
        <div className="container mx-auto px-4">
          <ScrollFade>
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Tu mejor opción</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                ¿Por qué elegir FreeMarket?
              </h2>
            </div>
          </ScrollFade>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <ScrollFade delay={1}>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-2 hover:border-primary/30 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">Miles de productos</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Encuentra lo que buscas entre miles de productos disponibles
                </p>
              </div>
            </ScrollFade>

            <ScrollFade delay={2}>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-2 hover:border-primary/30 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">Comunidad activa</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Conecta con vendedores y compradores de confianza
                </p>
              </div>
            </ScrollFade>

            <ScrollFade delay={3}>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-2 hover:border-primary/30 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">Transacciones seguras</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Compra y vende con la tranquilidad de estar protegido
                </p>
              </div>
            </ScrollFade>

            <ScrollFade delay={4}>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-2 hover:border-primary/30 group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">Fácil de usar</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Interfaz intuitiva para una experiencia de usuario fluida
                </p>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 dark:from-primary/15 dark:via-primary/10 dark:to-primary/15 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_70%)] opacity-30" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <ScrollFade>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-foreground">
              ¿Qué esperas para empezar?
            </h2>
          </ScrollFade>
          <ScrollFade delay={1}>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto text-lg">
              Empieza a comprar y vender productos hoy mismo
            </p>
          </ScrollFade>
          <ScrollFade delay={2}>
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  >
                    <Link to="/sell">
                      Vender producto
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="gap-2 border-2 hover:bg-muted/50"
                  >
                    <Link to="/products">
                      Ver productos
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    asChild
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  >
                    <Link to="/register">
                      Crear cuenta
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="gap-2 border-2 hover:bg-muted/50"
                  >
                    <Link to="/products">
                      Ver productos
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </ScrollFade>
        </div>
      </section>

      <footer className="py-12 bg-card border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingBag className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-card-foreground">FreeMarket</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2026 FreeMarket. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Productos
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/favorites" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Favoritos
                  </Link>
                  <button onClick={handleLogout} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Regístrate
                  </Link>
                  <Link to="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Iniciar sesión
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
