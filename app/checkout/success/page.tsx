"use client"

import { useSearchParams } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, Package, Truck, Clock, Mail } from "lucide-react"
import { useCart } from "@/hooks/use-cart"

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const method = searchParams.get("method")
  const ref = searchParams.get("ref")
  const paymentId = searchParams.get("payment_id")
  const status = searchParams.get("status")
  const { clearCart } = useCart()

  // Clear cart on successful payment
  useEffect(() => {
    if (method === "mercadopago" && status === "approved") {
      clearCart()
    }
  }, [method, status, clearCart])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="text-center max-w-3xl w-full">
        <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-4xl font-bold font-serif text-gros-black mb-4">¡Pedido Confirmado!</h1>
        <p className="text-xl text-gray-600 mb-8">
          {method === "whatsapp"
            ? "Tu pedido ha sido enviado por WhatsApp. Nos pondremos en contacto pronto para confirmar los detalles y el pago."
            : "¡Gracias por tu compra! Tu pago ha sido procesado exitosamente."}
        </p>

        {/* Payment Details */}
        {method === "mercadopago" && (ref || paymentId) && (
          <div className="bg-white border border-gray-200 p-6 rounded-lg mb-8 text-left">
            <h2 className="font-bold text-gros-black mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Detalles del Pago
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              {ref && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">Referencia de Orden:</span>
                  <span className="font-mono text-gros-red">{ref}</span>
                </div>
              )}
              {paymentId && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-semibold">ID de Pago:</span>
                  <span className="font-mono">{paymentId}</span>
                </div>
              )}
              {status && (
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold">Estado:</span>
                  <span className="font-semibold text-green-600 capitalize">
                    {status === "approved" ? "Aprobado" : status}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Guarda esta información para hacer seguimiento de tu pedido. Recibirás un email de confirmación con todos
              los detalles.
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gros-sand p-6 rounded-lg mb-8 text-left">
          <h2 className="font-bold text-gros-black mb-4 text-center">Próximos Pasos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 bg-white p-4 rounded">
              <Mail className="h-6 w-6 text-gros-red flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Confirmación por Email</h3>
                <p className="text-sm text-gray-600">Recibirás un email con los detalles de tu pedido</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white p-4 rounded">
              <Package className="h-6 w-6 text-gros-red flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Preparación</h3>
                <p className="text-sm text-gray-600">Comenzamos a producir tu prenda personalizada</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white p-4 rounded">
              <Clock className="h-6 w-6 text-gros-red flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Tiempo de Producción</h3>
                <p className="text-sm text-gray-600">7-14 días hábiles aproximadamente</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-white p-4 rounded">
              <Truck className="h-6 w-6 text-gros-red flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Envío y Seguimiento</h3>
                <p className="text-sm text-gray-600">Te enviaremos el tracking cuando despachemos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-8 text-left">
          <h3 className="font-bold text-gros-black mb-3">Información Importante</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Las prendas personalizadas no admiten cambios ni devoluciones</li>
            <li>✓ Verificaremos los datos antes de comenzar la producción</li>
            <li>✓ Si hay algún problema, nos comunicaremos contigo inmediatamente</li>
            <li>✓ Puedes consultarnos en cualquier momento por WhatsApp</li>
          </ul>
        </div>

        {/* Action Buttons */}
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

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-2 font-semibold">¿Tienes preguntas?</p>
          <p className="text-sm text-gray-500">
            Estamos para ayudarte. Contáctanos por WhatsApp, email o redes sociales.
          </p>
        </div>
      </div>
    </div>
  )
}
