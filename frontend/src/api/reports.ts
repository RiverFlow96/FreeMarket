import { getApiUrl } from "@/utils/apiUrl";

const API_BASE = "/api/v1";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export interface Report {
  id: number;
  product: number;
  product_name: string;
  reporter: number;
  reporter_username: string;
  reason: string;
  description: string | null;
  created_at: string;
  status: string;
}

export interface CreateReportData {
  product: number;
  reason: string;
  description?: string;
}

export const reportsApi = {
  async create(data: CreateReportData): Promise<Report> {
    const res = await fetch(getApiUrl(`${API_BASE}/reports/`), {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || "Error al crear reporte");
    }
    return res.json();
  },

  async getAll(): Promise<Report[]> {
    const res = await fetch(getApiUrl(`${API_BASE}/reports/`), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error("Error al obtener reportes");
    }
    return res.json();
  },

  async getById(id: number): Promise<Report> {
    const res = await fetch(getApiUrl(`${API_BASE}/reports/${id}/`), {
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      throw new Error("Error al obtener reporte");
    }
    return res.json();
  },
};
