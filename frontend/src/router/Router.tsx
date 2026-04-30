import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";
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
import { ShoppingBag, LogOut, PlusCircle, Heart, Flag, Menu, X } from "lucide-react";
import { PageTransition } from "@/components/ui/PageTransition";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

function NavLink({ to, children, onClick }: NavLinkProps) {
  return (
    <Link to={to} onClick={onClick}>
      {children}
    </Link>
  );
}

function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <ShoppingBag className="w-5 h-5 text-primary" />
          <span className="hidden sm:inline">FreeMarket</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/favorites">
              <Heart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Favoritos</span>
            </Link>
          </Button>
          {isAuthenticated && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/my-reports">
                <Flag className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Reportes</span>
              </Link>
            </Button>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/sell">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Vender
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.username}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button size="sm" asChild>
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
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background animate-fade-in-up">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Button variant="ghost" size="sm" asChild className="justify-start">
              <NavLink to="/favorites" onClick={closeMobileMenu}>
                <Heart className="w-4 h-4 mr-2" />
                Favoritos
              </NavLink>
            </Button>
            {isAuthenticated && (
              <Button variant="ghost" size="sm" asChild className="justify-start">
                <NavLink to="/my-reports" onClick={closeMobileMenu}>
                  <Flag className="w-4 h-4 mr-2" />
                  Mis reportes
                </NavLink>
              </Button>
            )}
            {isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" asChild className="justify-start">
                  <NavLink to="/sell" onClick={closeMobileMenu}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Vender producto
                  </NavLink>
                </Button>
                <div className="flex items-center justify-between py-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    @{user?.username}
                  </span>
                  <Button variant="ghost" size="sm" onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-1" />
                    Cerrar sesión
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2 border-t pt-3">
                <Button variant="ghost" size="sm" asChild className="justify-start">
                  <Link to="/login">Iniciar sesión</Link>
                </Button>
                <Button size="sm" asChild className="justify-start">
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
          <Route path="/products" element={<PageTransition><ProductsPage /></PageTransition>} />
          <Route path="/products/:id" element={<PageTransition><ProductDetail /></PageTransition>} />

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
