import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { authFetch } from "@/utils/authFetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { User, Loader2, Trash2, Edit2, Check, X, ArrowLeft, Crown, Zap, Star, Package, Bell, Clock } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: number;
  name: string;
  price: string;
  image: string | null;
  image_url: string | null;
}

interface PlanInfo {
  plan: string;
  product_limit: number;
  product_count: number;
  can_add_product: boolean;
  product_duration_weeks?: number;
  notification_preference?: string;
}

export default function Profile() {
  const { accessToken, user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notificationPreference, setNotificationPreference] = useState("in_app");

  const [editingEmail, setEditingEmail] = useState(false);
  const [editEmailValue, setEditEmailValue] = useState("");
  const [editingPhone, setEditingPhone] = useState(false);
  const [editPhoneValue, setEditPhoneValue] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [editAddressValue, setEditAddressValue] = useState("");

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [updatingPlan, setUpdatingPlan] = useState(false);

  const hasFetchedRef = useRef<string | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        if (!accessToken) {
          setLoading(false);
          setLoadingPlan(false);
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    if (hasFetchedRef.current === accessToken) {
      return;
    }
    hasFetchedRef.current = accessToken;
    isInitialMount.current = false;

const fetchData = async () => {
      setLoading(true);
      setLoadingPlan(true);

      try {
        const [profileRes, productsRes, planRes] = await Promise.all([
          authFetch("/api/v1/users/me/"),
          authFetch("/api/v1/users/me/products/"),
          authFetch("/api/v1/products/my_plan/"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setUsername(data.username || "");
          setEmail(data.email || "");
          setPhone(data.phone != null ? String(data.phone) : "");
          setAddress(data.address || "");
          setNotificationPreference(data.notification_preference || "in_app");
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data);
        }

        if (planRes.ok) {
          const planData = await planRes.json();
          setPlanInfo(planData.data);
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
      } finally {
        setLoading(false);
        setLoadingPlan(false);
      }
    };

    fetchData();
  }, [accessToken]);

  const saveField = async (field: string, value: string) => {
    setSaving(true);
    try {
      const res = await authFetch("/api/v1/users/me/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (res.ok) {
        const data = await res.json();
        if (field === "email") {
          setEmail(data.email || "");
          useAuthStore.getState().setUser({ ...user!, email: data.email });
        } else if (field === "phone") {
          setPhone(data.phone != null ? String(data.phone) : "");
        } else if (field === "address") {
          setAddress(data.address || "");
        } else if (field === "notification_preference") {
          setNotificationPreference(data.notification_preference || "in_app");
        }
        toast.success(`${field === "phone" ? "Teléfono" : field === "notification_preference" ? "Preferencia de notificación" : field.charAt(0).toUpperCase() + field.slice(1)} actualizada exitosamente.`);
      } else {
        const data = await res.json();
        toast.error(data[field]?.[0] || "Error al actualizar.");
      }
    } catch {
      toast.error("Ocurrió un error al actualizar.");
    } finally {
      setSaving(false);
    }
  };

  const startEditEmail = () => {
    setEditEmailValue(email);
    setEditingEmail(true);
  };
  const cancelEditEmail = () => setEditingEmail(false);
  const confirmEditEmail = async () => {
    setEditingEmail(false);
    await saveField("email", editEmailValue);
  };

  const startEditPhone = () => {
    setEditPhoneValue(phone);
    setEditingPhone(true);
  };
  const cancelEditPhone = () => setEditingPhone(false);
  const confirmEditPhone = async () => {
    setEditingPhone(false);
    await saveField("phone", editPhoneValue);
  };

  const startEditAddress = () => {
    setEditAddressValue(address);
    setEditingAddress(true);
  };
  const cancelEditAddress = () => setEditingAddress(false);
  const confirmEditAddress = async () => {
    setEditingAddress(false);
    await saveField("address", editAddressValue);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);

    try {
      const res = await authFetch("/api/v1/users/change_password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });

      if (res.ok) {
        toast.success("Tu contraseña ha sido actualizada exitosamente.");
        setOldPassword("");
        setNewPassword("");
        setShowPasswordForm(false);
      } else {
        const data = await res.json();
        toast.error(data.old_password?.[0] || "Error al cambiar contraseña.");
      }
    } catch {
      toast.error("Ocurrió un error al cambiar la contraseña.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

if (!accessToken) {
      toast.error("No tienes sesión activa. Por favor, inicia sesión nuevamente.");
      return;
    }

    try {
      const res = await authFetch(`/api/v1/products/${productId}/`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== productId));
        toast.success("El producto ha sido eliminado exitosamente.");
      } else {
        const data = await res.json().catch(() => ({}));
        console.error("Delete product error:", res.status, data);
        toast.error(data.error || `Error al eliminar producto (${res.status})`);
      }
    } catch {
      toast.error("Ocurrió un error al eliminar el producto.");
    }
  };

  const handleChangePlan = async (newPlan: string) => {
    setUpdatingPlan(true);
    try {
      const res = await authFetch("/api/v1/users/update_plan/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });

      if (res.ok) {
        const data = await res.json();
        const newPlan = data.data.plan;
        const newLimit = data.data.product_limit;
        const newDuration = data.data.product_duration_weeks;
        setPlanInfo({
          ...planInfo!,
          plan: newPlan,
          product_limit: newLimit,
          product_count: planInfo!.product_count,
          product_duration_weeks: newDuration,
        });
        toast.success(`Ahora tienes el plan ${newPlan === "plus" ? "Plus" : newPlan === "pro" ? "Pro" : "Gratis"} con límite de ${newLimit} productos y duran ${newDuration} ${newDuration === 1 ? "semana" : "semanas"}.`);
      } else {
        const data = await res.json();
        toast.error(data.plan?.[0] || "Error al actualizar el plan.");
      }
    } catch {
      toast.error("Ocurrió un error al actualizar el plan.");
    } finally {
      setUpdatingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">@{username}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de Contacto</CardTitle>
            <CardDescription>Tu información personal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Usuario</p>
                <p className="font-medium">@{username}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                {editingEmail ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      value={editEmailValue}
                      onChange={(e) => setEditEmailValue(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button size="icon" variant="ghost" onClick={confirmEditEmail} disabled={saving}>
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEditEmail}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <p className="font-medium">{email || <span className="text-muted-foreground italic">No establecido</span>}</p>
                )}
              </div>
              {!editingEmail && (
                <Button size="icon" variant="ghost" onClick={startEditEmail}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                {editingPhone ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="tel"
                      value={editPhoneValue}
                      onChange={(e) => setEditPhoneValue(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button size="icon" variant="ghost" onClick={confirmEditPhone} disabled={saving}>
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEditPhone}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <p className="font-medium">{phone || <span className="text-muted-foreground italic">No establecido</span>}</p>
                )}
              </div>
              {!editingPhone && (
                <Button size="icon" variant="ghost" onClick={startEditPhone}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Dirección</p>
                {editingAddress ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editAddressValue}
                      onChange={(e) => setEditAddressValue(e.target.value)}
                      className="h-8 text-sm"
                    />
                    <Button size="icon" variant="ghost" onClick={confirmEditAddress} disabled={saving}>
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={cancelEditAddress}>
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <p className="font-medium">{address || <span className="text-muted-foreground italic">No establecida</span>}</p>
                )}
              </div>
              {!editingAddress && (
                <Button size="icon" variant="ghost" onClick={startEditAddress}>
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  Notificación de expiración
                </p>
                <Select
                  value={notificationPreference}
                  onValueChange={(value) => {
                    setNotificationPreference(value);
                    saveField("notification_preference", value);
                  }}
                  disabled={saving}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app">Solo en la app</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="both">Email y SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Mi Plan
              </CardTitle>
              <CardDescription>Gestiona tu plan de suscripción</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingPlan ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : planInfo && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {planInfo.plan === "free" && <Star className="w-6 h-6 text-gray-500" />}
                      {planInfo.plan === "plus" && <Zap className="w-6 h-6 text-blue-500" />}
                      {planInfo.plan === "pro" && <Crown className="w-6 h-6 text-amber-500" />}
                      <div>
                        <p className="font-semibold text-lg">
                          {planInfo.plan === "free" ? "Plan Gratis" : planInfo.plan === "plus" ? "Plan Plus" : "Plan Pro"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {planInfo.product_limit} productos permitidos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {planInfo.product_count}/{planInfo.product_limit}
                      </p>
                      <p className="text-xs text-muted-foreground">productos publicados</p>
                    </div>
                  </div>

                  {planInfo.product_duration_weeks && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Tus productos duran <strong>{planInfo.product_duration_weeks} {planInfo.product_duration_weeks === 1 ? "semana" : "semanas"}</strong> antes de expirar
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleChangePlan("free")}
                      disabled={updatingPlan || planInfo.plan === "free"}
                      className={`h-7 px-2.5 rounded-[calc(var(--radius-md)-2px)] text-[0.8rem] font-medium flex items-center justify-center gap-1 transition-all ${
                        planInfo.plan === "free"
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                      } ${updatingPlan || planInfo.plan === "free" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Star className={`w-3.5 h-3.5 ${planInfo.plan === "free" ? "text-white" : "text-gray-500"}`} />
                      Gratis
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangePlan("plus")}
                      disabled={updatingPlan || planInfo.plan === "plus"}
                      className={`h-7 px-2.5 rounded-[calc(var(--radius-md)-2px)] text-[0.8rem] font-medium flex items-center justify-center gap-1 transition-all ${
                        planInfo.plan === "plus"
                          ? "bg-blue-500 text-white hover:bg-blue-600"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                      } ${updatingPlan || planInfo.plan === "plus" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Zap className={`w-3.5 h-3.5 ${planInfo.plan === "plus" ? "text-white" : "text-blue-500"}`} />
                      Plus
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangePlan("pro")}
                      disabled={updatingPlan || planInfo.plan === "pro"}
                      className={`h-7 px-2.5 rounded-[calc(var(--radius-md)-2px)] text-[0.8rem] font-medium flex items-center justify-center gap-1 transition-all ${
                        planInfo.plan === "pro"
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "border border-gray-300 text-gray-600 hover:bg-gray-100"
                      } ${updatingPlan || planInfo.plan === "pro" ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <Crown className={`w-3.5 h-3.5 ${planInfo.plan === "pro" ? "text-white" : "text-amber-500"}`} />
                      Pro
                    </button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    <p>Gratis: 3 productos | Plus: 5 productos | Pro: 10 productos</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cambiar Contraseña</CardTitle>
              <CardDescription>
                {showPasswordForm ? "Ingresa tu contraseña anterior y la nueva" : "Modifica tu contraseña de acceso"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showPasswordForm ? (
                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                  Cambiar contraseña
                </Button>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="oldPassword" className="text-sm font-medium">Contraseña actual</label>
                    <Input
                      id="oldPassword"
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="text-sm font-medium">Nueva contraseña</label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={changingPassword}>
                      {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      {changingPassword ? "Cambiando..." : "Confirmar"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setOldPassword("");
                        setNewPassword("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mis Productos</CardTitle>
              <CardDescription>Administra tus productos en venta</CardDescription>
            </CardHeader>
            <CardContent className="max-h-64 overflow-y-auto">
              {products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No has publicado productos aún"
                  action={{
                    label: "Publicar mi primer producto",
                    onClick: () => navigate("/sell"),
                  }}
                />
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {(product.image || product.image_url) ? (
                          <img
                            src={product.image || product.image_url || undefined}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                            <User className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">${product.price}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
