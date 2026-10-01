import { getApiUrl, getMediaUrl } from "@/utils/apiUrl";
import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingBag,
  ArrowLeft,
  Mail,
  Phone,
  User,
  MapPin,
  Send,
  Flag,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatPrice, type Currency } from "@/utils/currency";
import { SkeletonProductDetail } from "@/components/ui/SkeletonProductDetail";
import { ContactSellerDialog } from "@/components/ContactSellerDialog";
import { ReportModal } from "@/components/ReportModal";
import { useAuthStore } from "@/store/authStore";
import { ErrorState } from "@/components/ui/ErrorState";

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

const cleanImageUrl = getMediaUrl;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSellerInfo, setShowSellerInfo] = useState(true);
  const { isAuthenticated } = useAuthStore();

  const retryRef = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    fetch(getApiUrl(`/api/v1/products/${id}/`))
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener producto");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);

        document.title = `${data.name} | FreeMarket`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute(
            "content",
            data.description?.substring(0, 160) ||
              "Producto en FreeMarket",
          );
        }
      })
      .catch(() => {
        setError("No se pudo cargar el producto.");
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(retryRef, 0);
    return () => clearTimeout(timer);
  }, [retryRef]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <SkeletonProductDetail />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
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
        <ErrorState
          message={error || "Producto no encontrado"}
          onRetry={retryRef}
        />
      </div>
    );
  }

  const cleanedUrl = cleanImageUrl(product.image);
  const showImage = cleanedUrl && !imageError;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/products"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver a productos</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
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

          <div className="space-y-4 sm:space-6">
            <div>
              {product.category_name && (
                <Badge variant="secondary" className="mb-2">
                  {product.category_name}
                </Badge>
              )}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                {product.name}
              </h1>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mt-2">
                {formatPrice(product.price, (product.currency as Currency) || "CUP")}
              </p>
            </div>

            <Separator />

            <div>
              <h2 className="text-base sm:text-lg font-semibold mb-2">
                Descripción
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            <Separator />

            <Card>
              <CardHeader className="pb-2">
                <button
                  className="flex items-center justify-between w-full text-left"
                  onClick={() => setShowSellerInfo(!showSellerInfo)}
                >
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información del vendedor
                  </CardTitle>
                  <div className="lg:hidden">
                    {showSellerInfo ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>
              </CardHeader>

              <div
                className={`overflow-hidden transition-all ${
                  showSellerInfo ? "max-h-[500px]" : "max-h-0 lg:max-h-none"
                }`}
              >
                <CardContent className="space-y-3 sm:space-y-4 pt-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Vendedor
                      </p>
                      <p className="font-medium text-sm sm:text-base">
                        {product.seller_name || "No disponible"}
                      </p>
                    </div>
                  </div>

                  {product.seller_email && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Email
                        </p>
                        <a
                          href={`mailto:${product.seller_email}`}
                          className="font-medium text-primary hover:underline text-sm sm:text-base block truncate"
                        >
                          {product.seller_email}
                        </a>
                      </div>
                    </div>
                  )}

                  {product.seller_phone && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Teléfono
                        </p>
                        <a
                          href={`tel:${product.seller_phone}`}
                          className="font-medium text-primary hover:underline text-sm sm:text-base"
                        >
                          {product.seller_phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {product.seller_address && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Dirección
                        </p>
                        <p className="font-medium text-sm sm:text-base">
                          {product.seller_address}
                        </p>
                      </div>
                    </div>
                  )}

                  {!product.seller_email && !product.seller_phone && (
                    <p className="text-muted-foreground text-sm">
                      No hay información de contacto disponible.
                    </p>
                  )}
                </CardContent>
              </div>

              {(product.seller_email || product.seller_phone) && (
                <>
                  <div className="hidden lg:block">
                    <CardFooter className="flex gap-2 flex-wrap pt-4">
                      <Button
                        className="flex-1"
                        onClick={() => setShowContactDialog(true)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Contactar vendedor
                      </Button>
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
                  </div>

                  <div className="lg:hidden px-4 pb-4">
                    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-2 z-50">
                      <Button
                        className="flex-1"
                        onClick={() => setShowContactDialog(true)}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Contactar
                      </Button>
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
                    </div>
                    <div className="h-20" />
                  </div>
                </>
              )}
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
