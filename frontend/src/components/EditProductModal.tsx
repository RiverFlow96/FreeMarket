import { getApiUrl, getMediaUrl } from "@/utils/apiUrl";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import {
  Pencil,
  Images,
  Trash2,
  Loader2,
  AlertTriangle,
  X,
  Upload,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

interface ProductImage {
  id: number;
  image: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  currency?: string;
  category?: number | null;
  category_name?: string;
  image?: string | null;
  images?: ProductImage[];
  seller_id?: number;
}

interface Category {
  id: number;
  name: string;
}

interface EditProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  onProductUpdated: (product: Product) => void;
  onProductDeleted: () => void;
}

const CURRENCIES = [
  { value: "CUP", label: "Peso Cubano (CUP)" },
  { value: "MLC", label: "Peso Convertible (MLC)" },
  { value: "USD", label: "Dólar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
];

export function EditProductModal({
  open,
  onOpenChange,
  product,
  onProductUpdated,
  onProductDeleted,
}: EditProductModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "images">("details");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || "",
    price: product.price.toString(),
    currency: product.currency || "CUP",
    category: product.category ? String(product.category) : "none",
  });

  const { getAccessToken, accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [localImages, setLocalImages] = useState<ProductImage[]>(product.images || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log("DEBUG store accessToken:", accessToken);
  console.log("DEBUG getAccessToken():", getAccessToken());

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl("/api/v1/categories/"));
      const data = await response.json();
      console.log("DEBUG categories response:", data);
      console.log("DEBUG categories data.data:", data.data);
      console.log("DEBUG categories results:", data.results);
      if (data.success) {
        const cats = data.data || data.results || [];
        console.log("DEBUG categories set:", cats);
        setCategories(cats);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      const initForm = async () => {
        setFormData({
          name: product.name,
          description: product.description || "",
          price: product.price.toString(),
          currency: product.currency || "CUP",
          category: product.category ? String(product.category) : "none",
        });
        setActiveTab("details");
        setShowDeleteConfirm(false);
        setLocalImages(product.images || []);
        await fetchCategories();
      };
      initForm();
    }
  }, [fetchCategories, open, product.category, product.currency, product.description, product.images, product.name, product.price]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isLoading && !isDeleting) {
      onOpenChange(isOpen);
    }
  };

  const handleInputChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("El nombre del producto es requerido");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      toast.error("El precio debe ser un número válido");
      return;
    }

    setIsLoading(true);
    try {
      const token = getAccessToken();
      const response = await fetch(
        getApiUrl(`/api/v1/products/${product.id}/`),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            description: formData.description.trim(),
            price: price,
            currency: formData.currency,
            category: formData.category && formData.category !== "none" ? parseInt(formData.category) : null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || "Error al guardar");
      }

      toast.success("Producto actualizado correctamente");
      onProductUpdated(data.data);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar los cambios"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = getAccessToken();
      const response = await fetch(
        getApiUrl(`/api/v1/products/${product.id}/`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar el producto");
      }

      toast.success("Producto eliminado correctamente");
      onProductDeleted();
      onOpenChange(false);
      navigate("/products");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar el producto"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const token = getAccessToken();
      console.log("DEBUG upload token:", token);
      if (!token) {
        throw new Error("No hay token de autenticación");
      }
      const formData = new FormData();
      formData.append("image", file);

      const url = getApiUrl(`/api/v1/products/${product.id}/add_image/`);
      console.log("DEBUG upload URL:", url);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      console.log("DEBUG upload response status:", response.status);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al subir imagen");
      }

      setLocalImages([...localImages, { id: data.data.id, image: data.data.image }]);
      toast.success("Imagen subida correctamente");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al subir la imagen"
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImageDelete = async (imageId: number) => {
    try {
      const token = getAccessToken();
      const response = await fetch(
        getApiUrl(`/api/v1/products/${product.id}/delete_image/?image_id=${imageId}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar imagen");
      }

      setLocalImages(localImages.filter((img) => img.id !== imageId));
      toast.success("Imagen eliminada correctamente");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar la imagen"
      );
    }
  };

  const handleClose = () => {
    if (!isLoading && !isDeleting) {
      onOpenChange(false);
    }
  };

  const dialogOnOpenChange = (isOpen: boolean) => {
    if (!isLoading && !isDeleting) {
      handleOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={dialogOnOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Editar producto
          </DialogTitle>
          <DialogDescription>
            Modifica los detalles de tu producto
          </DialogDescription>
        </DialogHeader>

        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === "details"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Pencil className="w-4 h-4 inline-block mr-2" />
            Detalles
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
              activeTab === "images"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Images className="w-4 h-4 inline-block mr-2" />
            Imágenes
          </button>
        </div>

        {activeTab === "details" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del producto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: iPhone 13 Pro Max"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe tu producto..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Moneda</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleInputChange("currency", value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  handleInputChange("category", value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      product.category_name || "Selecciona una categoría"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin categoría</SelectItem>
                  {categories.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">Cargando...</div>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {activeTab === "images" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Agrega o elimina imágenes de tu producto
              </span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Agregar imagen
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {localImages.map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
                >
                  {img.image && (
                    <img
                      src={getMediaUrl(img.image) ?? undefined}
                      alt={`Imagen ${img.id}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => handleImageDelete(img.id)}
                    className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {product.image && !localImages.length && (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={getMediaUrl(product.image) ?? undefined}
                    alt="Imagen principal"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {(!product.image && !localImages.length) && (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center col-span-3">
                  <Images className="w-8 h-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">
                    No hay imágenes
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          {showDeleteConfirm ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">
                  ¿Estás seguro de eliminar este producto?
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Esta acción no se puede deshacer. El producto será eliminado
                permanentemente.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Sí, eliminar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar producto
            </Button>
          )}
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading || isDeleting}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading || isDeleting}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              "Guardar cambios"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}