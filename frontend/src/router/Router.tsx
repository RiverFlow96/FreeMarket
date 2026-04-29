import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Home } from "../pages/Home";
import ProductsPage from "../pages/ProductsPage";
import ProductDetail from "../pages/ProductDetail";
import Login from "../pages/Login";
import Register from "../pages/Register";
import SellProduct from "../pages/SellProduct";
import Profile from "../pages/Profile";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LogOut, PlusCircle, User } from "lucide-react";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();

  return (
    <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <ShoppingBag className="w-5 h-5 text-primary" />
          FreeMarket
        </Link>

        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/profile">
                <User className="w-4 h-4 mr-2" />
                Mi Perfil
              </Link>
            </Button>
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

          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />

          <Route path="/sell" element={<Layout><SellProduct /></Layout>} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
