import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reportsApi, type Report } from "@/api/reports";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, AlertTriangle, Clock, CheckCircle, XCircle, ShoppingBag } from "lucide-react";

const REASON_LABELS: Record<string, string> = {
  inapropiated: "Contenido inapropiado",
  fraud: "Posible fraude/estafa",
  spam: "Spam o publicidad",
  violated_terms: "Violación de términos",
  other: "Otro",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pendiente", color: "bg-yellow-500", icon: Clock },
  reviewed: { label: "Revisado", color: "bg-blue-500", icon: AlertTriangle },
  resolved: { label: "Resuelto", color: "bg-green-500", icon: CheckCircle },
  rejected: { label: "Rechazado", color: "bg-red-500", icon: XCircle },
};

export default function MyReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportsApi.getAll();
        setReports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar reportes");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <Button asChild variant="outline">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Mis Reportes</h1>
          <p className="text-muted-foreground">
            Historial de reportes enviados
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Flag className="w-16 h-16 text-muted-foreground/50" />
            <p className="text-muted-foreground text-center">
              No has enviado ningún reporte aún.
            </p>
            <Button asChild>
              <Link to="/products">Explorar productos</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const statusConfig = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;

              return (
                <Card key={report.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">
                          <Link
                            to={`/products/${report.product}`}
                            className="hover:underline"
                          >
                            {report.product_name}
                          </Link>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Flag className="w-4 h-4" />
                          {REASON_LABELS[report.reason] || report.reason}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className="shrink-0 flex items-center gap-1"
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {report.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {report.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        Reportado el{" "}
                        {new Date(report.created_at).toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                      <Link
                        to={`/products/${report.product}`}
                        className="flex items-center gap-1 hover:underline"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Ver producto
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
