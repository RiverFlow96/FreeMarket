import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, ImagePlus, Loader2 } from "lucide-react";

const MAX_IMAGES = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface StepImagesProps {
  images: File[];
  errors: { images?: string };
  onImagesChange: (images: File[]) => void;
}

export function StepImages({ images, errors, onImagesChange }: StepImagesProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > MAX_IMAGES) {
      alert(`Máximo ${MAX_IMAGES} imágenes permitidas`);
      return;
    }

    const validFiles = files.filter((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`El archivo ${file.name} no es un formato válido. Solo se permiten JPG, PNG y WebP.`);
        return false;
      }
      return true;
    });

    onImagesChange([...images, ...validFiles]);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="images" className="text-sm font-medium">
          Imágenes del producto (opcional)
        </Label>
        <p className="text-xs text-muted-foreground">
          Máximo {MAX_IMAGES} imágenes. Formatos: JPG, PNG, WebP
        </p>

        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            id="images"
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <Label
            htmlFor="images"
            className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg cursor-pointer hover:bg-accent transition-colors"
          >
            <ImagePlus className="w-4 h-4" />
            <span>Subir imágenes</span>
          </Label>
          <span className="text-sm text-muted-foreground">
            {images.length}/{MAX_IMAGES}
          </span>
        </div>

        {errors.images && (
          <span className="text-xs text-destructive">{errors.images}</span>
        )}
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((file, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={() => setLoading(false)}
                />
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
