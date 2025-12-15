"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"

export default function CheckoutErrorPage() {
  const searchParams = useSearchParams()
  const ref = searchParams.get("ref")

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4 max-w-2xl">
        <XCircle className="h-24 w-24 text-red-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold font-serif text-gros-black mb-4">Error en el Pago</h1>
        <p className="text-xl text-gray-600 mb-8">
          No pudimos procesar tu pago. Esto puede deberse a fondos insuficientes, problemas con tu tarjeta o la
          transacción fue rechazada.
        </p>

        <div className="bg-red-50 border border-red-200 p-6 rounded-lg mb-8">
          <h2 className="font-bold text-gros-black mb-3">¿Qué puedes hacer?</h2>
          <ul className="text-left space-y-2 text-gray-700">
            <li>✓ Verificar que tu tarjeta tenga fondos suficientes</li>
            <li>✓ Intentar con otro método de pago</li>
            <li>✓ Contactar a tu banco si el problema persiste</li>
            <li>✓ Intentar nuevamente en unos minutos</li>
          </ul>
        </div>

        {ref && (
          <div className="mb-6 text-sm text-gray-500">
            <p>Referencia de orden: {ref}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/checkout" className="block">
            <Button className="w-full bg-gros-red text-white hover:bg-gros-maroon font-bold h-12">
              Intentar Nuevamente
            </Button>
          </Link>
          <Link href="/carrito" className="block">
            <Button
              variant="outline"
              className="w-full font-bold h-12 border-gros-red text-gros-red hover:bg-gros-red/10 bg-transparent"
            >
              Volver al Carrito
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button
              variant="outline"
              className="w-full font-bold h-12 border-gray-300 text-gray-700 bg-transparent"
            >
              Ir al Inicio
            </Button>
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-2">¿Necesitas ayuda?</p>
          <p className="text-sm text-gray-500">
            Contáctanos por WhatsApp o email y con gusto te ayudaremos a completar tu pedido.
          </p>
        </div>
      </div>
    </div>
  )
}
