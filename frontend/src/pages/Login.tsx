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
      const res = await fetch("/api/v1/token/", {
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

      const userRes = await fetch("/api/v1/users/me/", {
        headers: { Authorization: `Bearer ${data.access}` },
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        login(data.access, data.refresh, { id: userData.id, username: userData.username, email: userData.email });
        navigate("/products");
      } else {
        login(data.access, data.refresh, { id: 0, username, email: "" });
        navigate("/products");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al iniciar sesión. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
          <CardDescription>Ingresa a tu cuenta para continuar</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
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
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Contraseña</label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Regístrate
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
