"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

export default function CheckoutPendingPage() {
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4 max-w-2xl">
        <Clock className="h-24 w-24 text-yellow-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold font-serif text-gros-black mb-4">Pago Pendiente</h1>
        <p className="text-xl text-gray-600 mb-8">
          Tu pago está siendo procesado. Te notificaremos cuando se confirme la transacción.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg mb-8">
          <h2 className="font-bold text-gros-black mb-3">¿Qué significa esto?</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li>⏳ Tu pago está en proceso de verificación</li>
            <li>📧 Recibirás un email cuando se confirme</li>
            <li>💳 Esto puede tomar desde minutos hasta días dependiendo del método de pago</li>
            <li>📱 Te contactaremos si necesitamos información adicional</li>
          </ul>
        </div>

        {ref && (
          <div className="mb-6 text-sm text-gray-500">
            <p>Referencia de orden: {ref}</p>
            <p className="mt-2">
              Guarda esta referencia para hacer seguimiento de tu pedido. Puedes consultarnos por WhatsApp usando este
              número.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full bg-gros-red text-white hover:bg-gros-maroon font-bold h-12">
              Volver al Inicio
            </Button>
          </Link>
          <Link href="/clubes" className="block">
            <Button
              variant="outline"
              className="w-full font-bold h-12 border-gros-red text-gros-red hover:bg-gros-red/10 bg-transparent"
            >
              Seguir Comprando
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="font-bold text-gros-black mb-3">Métodos de pago que pueden quedar pendientes:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="bg-white p-4 rounded border">
              <p className="font-bold mb-2">Transferencia Bancaria</p>
              <p>Hasta 2 días hábiles</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <p className="font-bold mb-2">Pago en Efectivo</p>
              <p>Hasta que realices el pago</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <p className="font-bold mb-2">Rapipago / Pago Fácil</p>
              <p>Hasta que realices el pago</p>
            </div>
            <div className="bg-white p-4 rounded border">
              <p className="font-bold mb-2">Cheque</p>
              <p>Hasta que se acredite</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-2">¿Necesitas ayuda?</p>
          <p className="text-sm text-gray-500">
            Si tienes dudas sobre tu pago, contáctanos por WhatsApp o email con tu número de referencia.
          </p>
        </div>
      </div>
    </div>
  )
}
