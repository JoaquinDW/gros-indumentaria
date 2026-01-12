"use client"

import { WhatsAppButton } from "./whatsapp-button"

export function FloatingWhatsApp() {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce">
      <WhatsAppButton
        message="Hola Gros Indumentaria! Quiero consultar sobre vuestros productos."
        phoneNumber="5493734443259"
      />
    </div>
  )
}
