import { getApiUrl } from "@/utils/apiUrl";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Loader2 } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/v1/token/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        const detail = data.detail || "";
        if (detail.includes("No active account") || detail.includes("credentials")) {
          throw new Error("Usuario o contraseña incorrectos. Por favor, verifica tus datos.");
        }
        throw new Error(detail || "Error al iniciar sesión. Por favor, inténtalo de nuevo.");
      }

      const data = await res.json();

      const userRes = await fetch(getApiUrl("/api/v1/users/me/"), {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        const actualData = userData.data || userData;
        const userId = typeof actualData.id === 'number' ? actualData.id : parseInt(actualData.id, 10);
        login(data.access, data.refresh, { id: userId, username: actualData.username, email: actualData.email });
        navigate("/products");
      } else {
        login(data.access, data.refresh, { id: username.length, username, email: username });
        navigate("/products");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      <div className="absolute inset-0 floating-shapes" />
      <Card className="w-full max-w-md relative backdrop-blur-sm bg-card/80 dark:bg-card/90 shadow-xl card-hover-lift animate-fade-in-scale">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-9 h-9 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-heading font-bold">Iniciar sesión</CardTitle>
          <CardDescription className="text-muted-foreground">Ingresa a tu cuenta para continuar</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="space-y-5 pt-2">
            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">Usuario</label>
              <Input
                id="username"
                type="text"
                placeholder="nombredeusuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div className="space-y-2 pb-6">
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
