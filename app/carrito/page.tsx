"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Trash2, ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { Navbar } from "@/components/navbar"

export default function CartPage() {
  const router = useRouter()
  const { items, total, removeItem, updateQuantity, isLoading } = useCart()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-500">Cargando carrito...</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <header className="bg-gros-red text-white py-8 px-4 md:px-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold font-serif">Mi Carrito</h1>
          </div>
        </header>

        <section className="py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gros-black mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">Agrega productos para comenzar a armar tu pedido</p>
            <Link href="/clubes">
              <Button className="bg-gros-red text-white hover:bg-gros-maroon">Ir al Catálogo</Button>
            </Link>
          </div>
        </section>

        <footer className="bg-gros-black text-white py-8 px-4 md:px-8 mt-12">
          <div className="max-w-7xl mx-auto text-center">
            <p className="mb-2">Gros Indumentaria © 2025</p>
            <p className="text-gray-400">Prendas Personalizadas de Calidad</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Header */}
      <header className="bg-gros-red text-white py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold font-serif">Mi Carrito</h1>
        </div>
      </header>

      {/* Cart Content */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.productId}-${item.size}-${item.color}`} className="p-4">
                <div className="flex gap-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="h-24 w-24 object-cover rounded bg-gros-sand"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gros-black mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Talle: {item.size} • Color: {item.color}
                      {item.fabric && item.fabric !== "Sin especificar" && ` • Tela: ${item.fabric}`}
                    </p>
                    {item.customText && (
                      <p className="text-sm text-gros-red mb-2">Personalización: {item.customText}</p>
                    )}
                    <p className="text-lg font-bold text-gros-red">${item.price}</p>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item.productId)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                        className="h-8 w-8 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="h-8 w-8 border border-gray-300 rounded hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gros-black mb-4">Resumen</h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-bold">${total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-bold">Calculado en checkout</span>
                </div>
              </div>

              <div className="flex justify-between mb-6 text-lg">
                <span className="font-bold text-gros-black">Total:</span>
                <span className="font-bold text-gros-red text-2xl">${total}</span>
              </div>

              <div className="space-y-3">
                <Link href="/checkout" className="block">
                  <Button className="w-full bg-gros-red text-white hover:bg-gros-maroon font-bold h-12">
                    Continuar al Checkout
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

              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="font-bold mb-3 text-gros-black">Pagar directamente:</p>
                <Button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-blue-500 text-white hover:bg-blue-600 font-bold h-12 mb-2"
                >
                  Pagar con Mercado Pago
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Completarás tus datos en el siguiente paso
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gros-black text-white py-8 px-4 md:px-8 mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2">Gros Indumentaria © 2025</p>
          <p className="text-gray-400">Prendas Personalizadas de Calidad</p>
        </div>
      </footer>
    </div>
  )
}
