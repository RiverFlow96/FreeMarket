import { getApiUrl } from "@/utils/apiUrl";
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { Flag } from "lucide-react"

const REPORT_REASONS = [
  { value: "inapropiated", label: "Contenido inapropiado" },
  { value: "fraud", label: "Posible fraude/estafa" },
  { value: "spam", label: "Spam o publicidad" },
  { value: "violated_terms", label: "Violación de términos" },
  { value: "other", label: "Otro" },
]

interface ReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: number
  productName: string
}

export function ReportModal({
  open,
  onOpenChange,
  productId,
  productName,
}: ReportModalProps) {
  const [reason, setReason] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Por favor selecciona una razón para el reporte")
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(getApiUrl("/api/v1/reports/"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product: productId,
          reason,
          description: description || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Error al enviar el reporte")
      }

      toast.success("Gracias por tu reporte. Lo revisaremos pronto.");
      setReason("")
      setDescription("")
      onOpenChange(false)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al enviar el reporte. Intenta de nuevo."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason("")
    setDescription("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-destructive" />
            Reportar producto
          </DialogTitle>
          <DialogDescription>
            Reportar &quot;{productName}&quot; por contenido inapropiado
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Razón del reporte</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una razón" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción (opcional)</label>
            <Textarea
              placeholder="Proporciona más detalles sobre el reporte..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason}
            className="flex-1"
          >
            {isSubmitting ? "Enviando..." : "Enviar reporte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
