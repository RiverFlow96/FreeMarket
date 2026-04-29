import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authFetch } from "@/utils/authFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ArrowLeft, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "@/components/ui/use-toast";

interface Category {
  name: string;
}

export default function SellProduct() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetch("/api/v1/categories/")
      .then(res => res.json())
      .then(data => setCategories(data.results || data))
      .catch(console.error);
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const categoryId = category ? (categories.findIndex(c => c.name === category) + 1) : null;

    try {
      let res: Response;

      if (imageFile) {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("price", price);
        if (categoryId) formData.append("category", categoryId.toString());
        formData.append("image", imageFile);

        res = await authFetch("/api/v1/products/", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await authFetch("/api/v1/products/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            price: parseFloat(price),
            category: categoryId,
            image_url: imageUrl || null,
          }),
        });
      }

      if (!res.ok) {
        const errorMessages: string[] = [];

        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            const errors = Object.entries(data);

            for (const [field, messages] of errors) {
              if (Array.isArray(messages)) {
                for (const msg of messages) {
                  if (field === "name") {
                    errorMessages.push(`Nombre: ${msg}`);
                  } else if (field === "description") {
                    errorMessages.push(`Descripción: ${msg}`);
                  } else if (field === "price") {
                    errorMessages.push(`Precio: ${msg}`);
                  } else if (field === "category") {
                    errorMessages.push(`Categoría: ${msg}`);
                  } else {
                    errorMessages.push(msg);
                  }
                }
              }
            }
          }
        } catch {
          // La respuesta no es JSON válido
        }

        if (errorMessages.length === 0) {
          throw new Error(`Error ${res.status}: No se pudo publicar el producto.`);
        }
        throw new Error(errorMessages.join(". "));
      }

      let product;
      try {
        product = await res.json();
      } catch {
        throw new Error("Producto publicado pero no se pudo obtener la respuesta del servidor.");
      }

      toast({
        title: "Producto publicado",
        description: `Tu producto "${product.name}" ha sido publicado exitosamente.`,
        variant: "success",
      });

      navigate(`/products/${product.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "No se pudo publicar el producto. Por favor, inténtalo de nuevo.";
      setError(errorMessage);
      toast({
        title: "Error al publicar",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/products"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a productos
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Vender producto</CardTitle>
                <CardDescription>Completa los datos de tu producto</CardDescription>
              </div>
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Nombre del producto *</label>
                <Input
                  id="name"
                  placeholder="Ej: iPhone 14 Pro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">Descripción *</label>
                <Textarea
                  id="description"
                  placeholder="Describe tu producto (estado, características, etc.)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="price" className="text-sm font-medium">Precio (CUP) *</label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">Categoría</label>
                  <Select value={category || "none"} onValueChange={(val) => setCategory(val === "none" ? "" : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin categoría</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Imagen del producto (opcional)</label>
                <ImageUpload
                  file={imageFile}
                  url={imageUrl}
                  onFileChange={setImageFile}
                  onUrlChange={setImageUrl}
                />
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShoppingBag className="w-4 h-4 mr-2" />}
                {loading ? "Publicando..." : "Publicar producto"}
              </Button>
            </CardContent>
          </form>
        </Card>
      </main>
    </div>
  );
}
