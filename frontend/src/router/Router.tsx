import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Home } from "../pages/Home";
import ProductsPage from "../pages/ProductsPage";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SellProduct from "../pages/SellProduct";
import Profile from "../pages/Profile";
import Favorites from "../pages/Favorites";
import MyReports from "../pages/MyReports";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LogOut, PlusCircle, Heart, Flag, Menu, X, User, ChevronDown } from "lucide-react";
import { PageTransition } from "@/components/ui/PageTransition";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ to, children, onClick }: NavLinkProps) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2">
      {children}
    </Link>
  );
}

function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="hidden sm:inline font-heading font-bold text-xl tracking-tight text-foreground">
            FreeMarket
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <ThemeToggle />

          <Button variant="ghost" size="sm" asChild className="hover:bg-muted/50">
            <Link to="/favorites">
              <Heart className="w-4 h-4 mr-1.5 text-rose-500" />
              <span className="hidden lg:inline">Favoritos</span>
            </Link>
          </Button>

          {isAuthenticated && (
            <Button variant="ghost" size="sm" asChild className="hover:bg-muted/50">
              <Link to="/my-reports">
                <Flag className="w-4 h-4 mr-1.5 text-amber-500" />
                <span className="hidden lg:inline">Reportes</span>
              </Link>
            </Button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="default"
                size="sm"
                asChild
                className="bg-primary hover:bg-primary/90 shadow-sm"
              >
                <Link to="/sell">
                  <PlusCircle className="w-4 h-4 mr-1.5" />
                  Vender
                </Link>
              </Button>

              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-muted/60 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium hidden lg:inline">
                    {user?.username}
                  </span>
                  <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-background shadow-lg animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-2 border-b">
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start hover:bg-muted"
                        asChild
                      >
                        <Link to="/profile">
                          <User className="w-4 h-4 mr-2" />
                          Perfil
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={logout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Cerrar sesión
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" size="sm" asChild className="hover:bg-muted/50">
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-primary hover:bg-primary/90 shadow-sm"
              >
                <Link to="/register">Registrarse</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="hover:bg-muted/60"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/98 backdrop-blur animate-in slide-in-from-top-2 duration-200">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Button variant="ghost" size="sm" asChild className="justify-start hover:bg-muted/50" onClick={closeMobileMenu}>
              <NavLink to="/favorites">
                <Heart className="w-4 h-4 mr-2 text-rose-500" />
                Favoritos
              </NavLink>
            </Button>

            {isAuthenticated && (
              <Button variant="ghost" size="sm" asChild className="justify-start hover:bg-muted/50" onClick={closeMobileMenu}>
                <NavLink to="/my-reports">
                  <Flag className="w-4 h-4 mr-2 text-amber-500" />
                  Mis reportes
                </NavLink>
              </Button>
            )}

            {isAuthenticated ? (
              <>
                <Button
                  variant="default"
                  size="sm"
                  asChild
                  className="justify-start bg-primary shadow-sm"
                  onClick={closeMobileMenu}
                >
                  <NavLink to="/sell">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Vender producto
                  </NavLink>
                </Button>

                <div className="flex items-center justify-between py-3 border-t mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user?.username}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { logout(); closeMobileMenu(); }}
                  className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 border-t pt-3 mt-2">
                <Button variant="ghost" size="sm" asChild className="justify-start hover:bg-muted/50" onClick={closeMobileMenu}>
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button
                  size="sm"
                  asChild
                  className="justify-start bg-primary shadow-sm"
                  onClick={closeMobileMenu}
                >
                  <Link to="/register">Registrarse</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function Router() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to={"home/"} replace />} />

          <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/products" element={<Layout><PageTransition><ProductsPage /></PageTransition></Layout>} />
          <Route path="/products/:id" element={<Layout><PageTransition><ProductDetail /></PageTransition></Layout>} />

          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/profile" element={<Layout><PageTransition><Profile /></PageTransition></Layout>} />

          <Route path="/favorites" element={<Layout><PageTransition><Favorites /></PageTransition></Layout>} />
          <Route path="/my-reports" element={<Layout><PageTransition><MyReports /></PageTransition></Layout>} />
          <Route path="/sell" element={<Layout><PageTransition><SellProduct /></PageTransition></Layout>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
