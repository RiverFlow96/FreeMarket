import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authFetch } from "@/utils/authFetch";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";
import { type Currency } from "@/utils/currency";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepPrice } from "./StepPrice";
import { StepImages } from "./StepImages";
import { StepReview } from "./StepReview";

interface Category {
  name: string;
}

interface PlanInfo {
  plan: string;
  product_limit: number;
  product_count: number;
  can_add_product: boolean;
}

interface FormData {
  name: string;
  description: string;
  category: string;
  price: string;
  currency: Currency;
  negotiable: boolean;
  images: File[];
}

interface Errors {
  name?: string;
  description?: string;
  category?: string;
  price?: string;
  currency?: string;
  images?: string;
}

const STEPS = [
  { num: 1, title: "Básico" },
  { num: 2, title: "Precio" },
  { num: 3, title: "Imágenes" },
  { num: 4, title: "Revisión" },
];

interface MultiStepFormProps {
  categories: Category[];
  planInfo: PlanInfo | null;
  loadingPlan: boolean;
}

export function MultiStepForm({ categories, planInfo, loadingPlan }: MultiStepFormProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    category: "",
    price: "",
    currency: "CUP",
    negotiable: false,
    images: [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const validateStep = (step: number): boolean => {
    const newErrors: Errors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "El nombre es requerido";
      } else if (formData.name.length > 100) {
        newErrors.name = "El nombre no puede exceder 100 caracteres";
      }

      if (formData.description.length > 1000) {
        newErrors.description = "La descripción no puede exceder 1000 caracteres";
      }
    }

    if (step === 2) {
      if (!formData.price || parseFloat(formData.price) < 0) {
        newErrors.price = "El precio debe ser un número positivo";
      }

      if (!formData.currency) {
        newErrors.currency = "La moneda es requerida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setLoading(true);

    const categoryObj = categories.find((c) => c.name === formData.category);
    const categoryId = categoryObj ? categories.indexOf(categoryObj) + 1 : null;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("currency", formData.currency);
      formDataToSend.append("negotiable", formData.negotiable.toString());
      if (categoryId) formDataToSend.append("category", categoryId.toString());

      formData.images.forEach((image) => {
        formDataToSend.append("images", image);
      });

      const res = await authFetch("/api/v1/products/", {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorMessages: string[] = [];

        try {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            const errorEntries = Object.entries(data);

            for (const [field, messages] of errorEntries) {
              if (Array.isArray(messages)) {
                for (const msg of messages) {
                  errorMessages.push(`${field}: ${msg}`);
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
        const response = await res.json();
        product = response.data;
      } catch {
        throw new Error("Producto publicado pero no se pudo obtener la respuesta del servidor.");
      }

      toast.success(`Tu producto "${product.name}" ha sido publicado exitosamente.`);
      navigate(`/products/${product.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : "No se pudo publicar el producto. Por favor, inténtalo de nuevo.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (planInfo && !planInfo.can_add_product) {
    const planName = planInfo.plan === "plus" ? "Plus" : planInfo.plan === "pro" ? "Pro" : "Gratis";
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Límite de productos alcanzado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Has alcanzado el límite de <strong>{planInfo.product_limit}</strong> productos de tu plan <strong>{planName}</strong>.
            </p>
            <Button
              className="mt-4 w-full"
              onClick={() => navigate("/profile")}
            >
              Ver planes disponibles
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStepIcon = (stepNum: number) => {
    if (stepNum < currentStep) {
      return <Check className="w-4 h-4" />;
    }
    return stepNum;
  };

  return (
    <div className="space-y-4 sm:space-6 pb-24 lg:pb-6">
      <div className="flex items-center justify-between overflow-x-auto py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {STEPS.map((step, index) => (
          <div key={step.num} className="flex items-center flex-1 min-w-0">
            <div
              className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-medium transition-colors shrink-0 ${
                step.num === currentStep
                  ? "bg-primary text-primary-foreground"
                  : step.num < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {getStepIcon(step.num)}
            </div>
            <span
              className={`hidden md:block ml-2 text-xs sm:text-sm whitespace-nowrap ${
                step.num === currentStep ? "font-medium" : "text-muted-foreground"
              }`}
            >
              {step.title}
            </span>
            {index < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 sm:mx-2 min-w-4 ${
                  step.num < currentStep ? "bg-green-500" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            {currentStep === 1 && "Información básica"}
            {currentStep === 2 && "Precio y moneda"}
            {currentStep === 3 && "Imágenes"}
            {currentStep === 4 && "Revisión y publicar"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <StepBasicInfo
              name={formData.name}
              description={formData.description}
              category={formData.category}
              categories={categories}
              errors={{
                name: errors.name,
                description: errors.description,
                category: errors.category,
              }}
              onNameChange={(val) => setFormData({ ...formData, name: val })}
              onDescriptionChange={(val) => setFormData({ ...formData, description: val })}
              onCategoryChange={(val) => setFormData({ ...formData, category: val })}
            />
          )}

          {currentStep === 2 && (
            <StepPrice
              price={formData.price}
              currency={formData.currency}
              negotiable={formData.negotiable}
              errors={{ price: errors.price, currency: errors.currency }}
              onPriceChange={(val) => setFormData({ ...formData, price: val })}
              onCurrencyChange={(val) => setFormData({ ...formData, currency: val })}
              onNegotiableChange={(val) => setFormData({ ...formData, negotiable: val })}
            />
          )}

          {currentStep === 3 && (
            <StepImages
              images={formData.images}
              errors={{ images: errors.images }}
              onImagesChange={(images) => setFormData({ ...formData, images })}
            />
          )}

          {currentStep === 4 && (
            <StepReview
              formData={formData}
              onEditStep={handleEditStep}
            />
          )}

          <div className="lg:flex lg:justify-between mt-6 sm:mt-8 pt-4 border-t hidden">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={loading}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Atrás
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                Siguiente
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  "Publicar producto"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 lg:hidden z-50">
        <div className="flex gap-3 max-w-2xl mx-auto">
          {currentStep > 1 ? (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Atrás</span>
            </Button>
          ) : (
            <div className="flex-1" />
          )}

          {currentStep < 4 ? (
            <Button onClick={handleNext} className="flex-1">
              Siguiente
              <ChevronRight className="w-4 h-4 ml-1 sm:ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Publicando...</span>
                </>
              ) : (
                "Publicar"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
