"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WhatsAppButtonProps {
  message?: string
  phoneNumber?: string
  className?: string
}

export function WhatsAppButton({
  message = "Hola Gros Indumentaria! Me interesa conocer más sobre vuestros productos.",
  phoneNumber = "5493734443259",
  className = "",
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={className}>
      <Button
        size="lg"
        className="rounded-full w-16 h-16 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        style={{ backgroundColor: "#25D366" }}
        title="Contactar por WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </a>
  )
}
