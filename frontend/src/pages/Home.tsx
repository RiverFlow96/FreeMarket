import { getApiUrl, getMediaUrl } from "@/utils/apiUrl";
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SearchBar } from "../components/SearchBar";
import { ShoppingBag, Package, Users, Shield, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkeletonList } from "@/components/ui/SkeletonList";
import { useAuthStore } from "@/store/authStore";
import { getCurrencyIcon, type Currency } from "@/utils/currency";
import { ScrollFade } from "@/hooks/useScrollAnimation.tsx";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string | null;
}

const cleanImageUrl = getMediaUrl;

export function Home() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Set<number>>(() => new Set());

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
  }, [logout, navigate]);

  const fetchRecentProducts = useCallback(async () => {
    try {
      const res = await fetch(getApiUrl("/api/v1/products/?page_size=8"));
      if (res.ok) {
        const data = await res.json();
        const productsList = Array.isArray(data)
          ? data
          : data.results || data.data || [];
        setRecentProducts(productsList.slice(0, 8));
      }
    } catch (err) {
      console.error("Error fetching recent products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecentProducts();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchRecentProducts]);

  const handleImageError = useCallback((productId: number) => {
    setImageErrors((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });
  }, []);

  return (
    <div className="min-h-screen w-full">
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center bg-background overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center gap-12 p-6 sm:p-10 w-full max-w-4xl mx-4">
          <ScrollFade>
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
                  <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground tracking-widest uppercase">Marketplace</span>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-foreground tracking-tight leading-[1.1]">
                Free<span className="text-primary">Market</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground font-sans max-w-xl leading-relaxed">
                La plataforma para comprar y vender productos de forma fácil y segura
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Desde 2026</span>
                <span className="w-1 h-1 rounded-full bg-primary/50" />
                <span className="text-sm text-muted-foreground">Comunidad activa</span>
              </div>
            </div>
          </ScrollFade>

          <div className="w-full max-w-lg">
            <SearchBar />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Button
              variant="outline"
              size="lg"
              asChild
              className="gap-2 hover:bg-muted/80 ring-1 ring-border hover:ring-primary/30 px-6"
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
                className="gap-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] px-6"
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
                className="gap-2 bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all hover:scale-[1.02] px-6"
              >
                <Link to="/register">
                  Empezar a vender
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span className="text-xs text-muted-foreground font-medium tracking-wider uppercase">Descubrir</span>
          <div className="w-6 h-10 rounded-full border border-border flex justify-center pt-2">
            <div className="w-1 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
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
                        <Card className="w-56 sm:w-64 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 group flex flex-col bg-card ring-1 ring-foreground/10 hover:ring-primary/30">
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
                              <CardTitle className="text-base font-heading font-medium line-clamp-1 text-card-foreground">{product.name}</CardTitle>
                            </CardHeader>
                            <CardDescription className="text-sm line-clamp-2 text-muted-foreground">{product.description}</CardDescription>
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <span className="font-serif text-2xl font-normal text-primary">
                                <span className="text-sm mr-0.5 opacity-70">{getCurrencyIcon(product.currency as Currency)}</span>
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

      <section className="py-16 sm:py-24 bg-secondary/30 dark:bg-secondary/15">
        <div className="container mx-auto px-4">
          <ScrollFade>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Tu mejor opción</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                ¿Por qué elegir FreeMarket?
              </h2>
            </div>
          </ScrollFade>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <ScrollFade delay={1}>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ring-1 ring-foreground/10 hover:ring-primary/30 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">Miles de productos</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Encuentra lo que buscas entre miles de productos disponibles
                </p>
              </div>
            </ScrollFade>

            <ScrollFade delay={2}>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ring-1 ring-foreground/10 hover:ring-primary/30 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">Comunidad activa</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Conecta con vendedores y compradores de confianza
                </p>
              </div>
            </ScrollFade>

            <ScrollFade delay={3}>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ring-1 ring-foreground/10 hover:ring-primary/30 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">Transacciones seguras</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Compra y vende con la tranquilidad de estar protegido
                </p>
              </div>
            </ScrollFade>

            <ScrollFade delay={4}>
              <div className="flex flex-col items-center text-center p-6 sm:p-8 rounded-2xl bg-card hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 ring-1 ring-foreground/10 hover:ring-primary/30 group">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/10 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2 text-card-foreground group-hover:text-primary transition-colors">Fácil de usar</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Interfaz intuitiva para una experiencia de usuario fluida
                </p>
              </div>
            </ScrollFade>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-secondary/50 dark:bg-secondary/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--primary)_0%,_transparent_70%)] opacity-30" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <ScrollFade>
            <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground tracking-tight">
              ¿Qué esperas para empezar?
            </h2>
          </ScrollFade>
          <ScrollFade delay={1}>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg font-serif italic">
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
                    className="gap-2 bg-primary hover:bg-primary/90 shadow-sm"
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
                    className="gap-2 ring-1 ring-border hover:bg-muted/50"
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
                    className="gap-2 bg-primary hover:bg-primary/90 shadow-sm"
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
                    className="gap-2 ring-1 ring-border hover:bg-muted/50"
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
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm shadow-primary/10">
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
