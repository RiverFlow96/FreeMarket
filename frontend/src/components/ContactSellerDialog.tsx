import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MessageCircle } from "lucide-react"

interface ContactSellerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sellerName: string
  sellerEmail?: string | null
  sellerPhone?: number | null
  productName: string
}

export function ContactSellerDialog({
  open,
  onOpenChange,
  sellerName,
  sellerEmail,
  sellerPhone,
  productName,
}: ContactSellerDialogProps) {

  const handleEmailClick = () => {
    if (sellerEmail) {
      const subject = encodeURIComponent(`Consulta sobre: ${productName}`)
      window.location.href = `mailto:${sellerEmail}?subject=${subject}`
    }
    onOpenChange(false)
  }

  const handleWhatsAppClick = () => {
    if (sellerPhone) {
      const message = encodeURIComponent(`Hola, estoy interesado en: ${productName}`)
      const phone = sellerPhone.toString().replace(/\D/g, "")
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
    }
    onOpenChange(false)
  }

  const handleSMSClick = () => {
    if (sellerPhone) {
      const message = encodeURIComponent(`Hola, estoy interesado en: ${productName}`)
      window.location.href = `sms:${sellerPhone}?body=${message}`
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contactar a {sellerName}</DialogTitle>
          <DialogDescription>
            Elige cómo quieres contactar al vendedor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {sellerEmail && (
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-3"
              onClick={handleEmailClick}
            >
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <div className="text-left">
                <div className="font-medium">Enviar email</div>
                <div className="text-xs text-muted-foreground">{sellerEmail}</div>
              </div>
            </Button>
          )}

          {sellerPhone && (
            <>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">WhatsApp</div>
                  <div className="text-xs text-muted-foreground">Mensaje instantáneo</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={handleSMSClick}
              >
                <MessageCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="text-left">
                  <div className="font-medium">Mensaje de texto</div>
                  <div className="text-xs text-muted-foreground">SMS</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                asChild
              >
                <a href={`tel:${sellerPhone}`}>
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">Llamar</div>
                    <div className="text-xs text-muted-foreground">{sellerPhone}</div>
                  </div>
                </a>
              </Button>
            </>
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
