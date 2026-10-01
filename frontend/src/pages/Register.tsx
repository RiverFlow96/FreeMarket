import { getApiUrl } from "@/utils/apiUrl";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Loader2, MapPin } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/v1/users/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, phone: phone || null, address: address || "" }),
      });

      if (!res.ok) {
        const data = await res.json();
        const errors = Object.entries(data);
        const errorMessages: string[] = [];

        for (const [field, messages] of errors) {
          if (Array.isArray(messages)) {
            for (const msg of messages) {
              if (field === "username") {
                errorMessages.push(`Usuario: ${msg}`);
              } else if (field === "email") {
                errorMessages.push(`Email: ${msg}`);
              } else if (field === "password") {
                errorMessages.push(`Contraseña: ${msg}`);
              } else {
                errorMessages.push(msg);
              }
            }
          }
        }

        if (errorMessages.length === 0) {
          throw new Error("No se pudo crear la cuenta. Por favor, inténtalo de nuevo.");
        }
        throw new Error(errorMessages.join(". "));
      }

      const loginRes = await fetch(getApiUrl("/api/v1/token/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!loginRes.ok) {
        throw new Error("Tu cuenta fue creada, pero no pudiste iniciar sesión automáticamente. Por favor, inicia sesión.");
      }

      const data = await loginRes.json();
      login(data.access, data.refresh, { id: 0, username, email });
      navigate("/products");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al crear tu cuenta. Por favor, inténtalo de nuevo.");
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
          <CardTitle className="text-3xl font-heading font-bold">Crear cuenta</CardTitle>
          <CardDescription className="text-muted-foreground">Únete a FreeMarket y empieza a vender</CardDescription>
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
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Teléfono (opcional)</label>
              <Input
                id="phone"
                type="tel"
                placeholder="1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Dirección (opcional)
              </label>
              <Input
                id="address"
                type="text"
                placeholder="Calle, ciudad, provincia..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/30"
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
                className="h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-2">
            <Button type="submit" className="w-full h-11 text-base font-medium" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Creando cuenta..." : "Registrarse"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
