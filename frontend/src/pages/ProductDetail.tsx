import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, ArrowLeft, Mail, Phone, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice } from "@/utils/currency";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string | null;
  category_name?: string;
  seller_name?: string;
  seller_email?: string;
  seller_phone?: number | null;
}

function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    if (url.includes("/backend/media/")) {
      const match = url.match(/\/backend\/media\/(.+)/);
      if (match) {
        let extractedUrl = decodeURIComponent(match[1]);
        extractedUrl = extractedUrl.replace(/^http:\/+/, "https://").replace(/^https:\/+/, "https://");
        if (extractedUrl.startsWith("http://") || extractedUrl.startsWith("https://")) {
          return extractedUrl;
        }
      }
    }
    const decoded = decodeURIComponent(url);
    if (decoded.startsWith("http://") || decoded.startsWith("https://")) {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/v1/products/${id}/`);
        if (!res.ok) throw new Error("Error al obtener producto");
        const data = await res.json();
        setProduct(data);
        setLoading(false);
      } catch {
        setError("No se pudo cargar el producto.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error || "Producto no encontrado"}</p>
        <Button asChild variant="outline">
          <Link to="/products">Volver a productos</Link>
        </Button>
      </div>
    );
  }

  const cleanedUrl = cleanImageUrl(product.image);
  const showImage = cleanedUrl && !imageError;

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

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="aspect-square lg:aspect-auto lg:h-[500px] bg-muted rounded-lg overflow-hidden">
            {showImage ? (
              <img
                src={cleanedUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <ShoppingBag className="w-24 h-24 text-muted-foreground/50" />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              {product.category_name && (
                <Badge variant="secondary" className="mb-2">
                  {product.category_name}
                </Badge>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold">{product.name}</h1>
              <p className="text-3xl sm:text-4xl font-bold text-primary mt-2">
                {formatPrice(product.price)}
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-lg font-semibold mb-2">Descripción</h2>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            <Separator />

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Información del vendedor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vendedor</p>
                    <p className="font-medium">{product.seller_name || "No disponible"}</p>
                  </div>
                </div>

                {product.seller_email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${product.seller_email}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {product.seller_email}
                      </a>
                    </div>
                  </div>
                )}

                {product.seller_phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Teléfono</p>
                      <a
                        href={`tel:${product.seller_phone}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {product.seller_phone}
                      </a>
                    </div>
                  </div>
                )}

                {!product.seller_email && !product.seller_phone && (
                  <p className="text-muted-foreground text-sm">
                    No hay información de contacto disponible.
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                {product.seller_email && (
                  <Button className="flex-1" asChild>
                    <a href={`mailto:${product.seller_email}?subject=Consulta sobre: ${product.name}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar mensaje
                    </a>
                  </Button>
                )}
                {product.seller_phone && (
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`tel:${product.seller_phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
