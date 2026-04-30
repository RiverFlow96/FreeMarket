import { useState, useCallback } from "react";
import { reportsApi, type Report, type CreateReportData } from "@/api/reports";

interface UseReportsReturn {
  reports: Report[];
  loading: boolean;
  error: string | null;
  fetchReports: () => Promise<void>;
  createReport: (data: CreateReportData) => Promise<Report>;
}

export function useReports(): UseReportsReturn {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await reportsApi.getAll();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar reportes");
    } finally {
      setLoading(false);
    }
  }, []);

  const createReport = useCallback(async (data: CreateReportData): Promise<Report> => {
    setLoading(true);
    setError(null);
    try {
      const report = await reportsApi.create(data);
      setReports((prev) => [report, ...prev]);
      return report;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al crear reporte";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
  };
}
