import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, ArrowLeft, Mail, Phone, User, MapPin, Send, Flag } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, type Currency } from "@/utils/currency";
import { ContactSellerDialog } from "@/components/ContactSellerDialog";
import { ReportModal } from "@/components/ReportModal";
import { useAuthStore } from "@/store/authStore";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string;
  image?: string | null;
  category_name?: string;
  seller_name?: string;
  seller_email?: string;
  seller_phone?: number | null;
  seller_address?: string | null;
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

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { isAuthenticated } = useAuthStore();

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
          <div className="relative w-full max-w-md mx-auto lg:max-w-none aspect-square lg:aspect-[4/3] bg-muted rounded-lg overflow-hidden">
            {showImage ? (
              <img
                src={cleanedUrl}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-contain"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
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
                {formatPrice(product.price, (product.currency as Currency) || "CUP")}
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

                {product.seller_address && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Dirección</p>
                      <p className="font-medium">{product.seller_address}</p>
                    </div>
                  </div>
                )}

                {!product.seller_email && !product.seller_phone && (
                  <p className="text-muted-foreground text-sm">
                    No hay información de contacto disponible.
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 flex-wrap">
                {(product.seller_email || product.seller_phone) && (
                  <Button
                    className="flex-1"
                    onClick={() => setShowContactDialog(true)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Contactar vendedor
                  </Button>
                )}
                {isAuthenticated && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowReportModal(true)}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Reportar
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <ContactSellerDialog
        open={showContactDialog}
        onOpenChange={setShowContactDialog}
        sellerName={product.seller_name || "Vendedor"}
        sellerEmail={product.seller_email}
        sellerPhone={product.seller_phone}
        productName={product.name}
      />

      <ReportModal
        open={showReportModal}
        onOpenChange={setShowReportModal}
        productId={product.id}
        productName={product.name}
      />
    </div>
  );
}
