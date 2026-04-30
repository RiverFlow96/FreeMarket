import { CURRENCY_LABELS, type Currency } from "@/utils/currency";

interface FormData {
  name: string;
  description: string;
  category: string;
  price: string;
  currency: Currency;
  negotiable: boolean;
  images: File[];
}

interface StepReviewProps {
  formData: FormData;
  onEditStep: (step: number) => void;
}

export function StepReview({
  formData,
  onEditStep,
}: StepReviewProps) {
  const categoryName = formData.category || "Sin categoría";

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b">
          <div>
            <h3 className="font-medium">Información básica</h3>
            <p className="text-sm text-muted-foreground">{formData.name}</p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-sm text-primary hover:underline"
          >
            Editar
          </button>
        </div>

        <div className="text-sm space-y-1">
          <p>
            <span className="text-muted-foreground">Descripción:</span>{" "}
            {formData.description.length > 100
              ? `${formData.description.slice(0, 100)}...`
              : formData.description}
          </p>
          <p>
            <span className="text-muted-foreground">Categoría:</span> {categoryName}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-b">
          <div>
            <h3 className="font-medium">Precio y moneda</h3>
            <p className="text-sm text-muted-foreground">
              {formData.price} {CURRENCY_LABELS[formData.currency]}
              {formData.negotiable && " (negociable)"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-sm text-primary hover:underline"
          >
            Editar
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-b">
          <div>
            <h3 className="font-medium">Imágenes</h3>
            <p className="text-sm text-muted-foreground">
              {formData.images.length} imagen(es) seleccionada(s)
            </p>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-sm text-primary hover:underline"
          >
            Editar
          </button>
        </div>

        {formData.images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-2">
            {formData.images.map((file, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden border"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
