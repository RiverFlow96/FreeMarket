import { getApiUrl } from "@/utils/apiUrl";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authFetch } from "@/utils/authFetch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { MultiStepForm } from "@/components/sell/MultiStepForm";

interface Category {
  name: string;
}

interface PlanInfo {
  plan: string;
  product_limit: number;
  product_count: number;
  can_add_product: boolean;
}

export default function SellProduct() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoadingPlan(true);
      try {
        const [categoriesRes, planRes] = await Promise.all([
          fetch(getApiUrl("/api/v1/categories/")),
          authFetch("/api/v1/products/my_plan/"),
        ]);

        const catsData = await categoriesRes.json();
        setCategories(catsData.results || catsData);

        if (planRes.ok) {
          const planData = await planRes.json();
          setPlanInfo(planData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingPlan(false);
      }
    };

    fetchData();
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Vender producto</CardTitle>
                <CardDescription>
                  Completa los datos de tu producto en 4 pasos
                  {planInfo && (
                    <span className="ml-2 text-muted-foreground">
                      ({planInfo.product_count}/{planInfo.product_limit} productos)
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MultiStepForm
              categories={categories}
              planInfo={planInfo}
              loadingPlan={loadingPlan}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
