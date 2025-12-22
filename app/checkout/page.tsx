"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCart } from "@/hooks/use-cart"
import { ArrowRight, Loader2 } from "lucide-react"
import { AlertModal } from "@/components/ui/alert-modal"

interface Club {
  id: number
  name: string
  slug: string
  active: boolean
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [clubs, setClubs] = useState<Club[]>([])
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    message: string
    type: "success" | "error" | "info"
  }>({
    isOpen: false,
    message: "",
    type: "info",
  })

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    province: "",
    notes: "",
    deliveryMethod: "correo" as "correo" | "club",
    clubId: "",
  })

  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    try {
      const response = await fetch("/api/clubs")
      const data = await response.json()
      if (data.clubs) {
        setClubs(data.clubs.filter((c: Club) => c.active))
      }
    } catch (error) {
      console.error("Error loading clubs:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCheckout = async (method: "mercadopago" | "whatsapp") => {
    if (!formData.name || !formData.email || !formData.phone) {
      setAlertModal({
        isOpen: true,
        message: "Por favor completa todos los campos requeridos",
        type: "error",
      })
      return
    }

    // Validate club selection if delivery method is club pickup
    if (formData.deliveryMethod === "club" && !formData.clubId) {
      setAlertModal({
        isOpen: true,
        message: "Por favor selecciona un club para el retiro",
        type: "error",
      })
      return
    }

    if (method === "mercadopago") {
      setLoading(true)
      try {
        const response = await fetch("/api/create-preference", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items,
            customerData: formData,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          setAlertModal({
            isOpen: true,
            message: data.error || "Error al procesar el pago",
            type: "error",
          })
          return
        }

        if (data.redirectUrl) {
          window.location.href = data.redirectUrl
        } else {
          setAlertModal({
            isOpen: true,
            message: "No se pudo obtener la URL de pago",
            type: "error",
          })
        }
      } catch (error) {
        console.error("Error:", error)
        setAlertModal({
          isOpen: true,
          message: "Error al procesar el pago",
          type: "error",
        })
      } finally {
        setLoading(false)
      }
    } else if (method === "whatsapp") {
      const orderSummary = items
        .map((item) => {
          const fabricText = item.fabric && item.fabric !== "Sin especificar" ? `, ${item.fabric}` : ""
          return `${item.quantity}x ${item.name} (${item.size}, ${item.color}${fabricText}) - $${item.price * item.quantity}`
        })
        .join("\n")

      // Build delivery info
      let deliveryInfo = ""
      if (formData.deliveryMethod === "club") {
        const selectedClub = clubs.find((c) => c.id.toString() === formData.clubId)
        deliveryInfo = `\n\nMétodo de entrega: Retiro en el club\nClub: ${selectedClub?.name || "No especificado"}`
      } else {
        deliveryInfo = `\n\nMétodo de entrega: Envío a domicilio (Correo Argentino)\nDirección: ${formData.address}\nProvincia: ${formData.province}`
      }

      const message = `Hola! Quiero hacer un pedido:\n\n${orderSummary}\n\nTotal: $${total}\n\nDatos de contacto:\nNombre: ${formData.name}\nEmail: ${formData.email}\nTeléfono: ${formData.phone}${deliveryInfo}${formData.notes ? `\n\nNotas: ${formData.notes}` : ""}`

      const whatsappUrl = `https://wa.me/5491234567890?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")

      // Clear cart and redirect to success
      clearCart()
      router.push("/checkout/success?method=whatsapp")
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gros-black mb-4">Tu carrito está vacío</h1>
        <Link href="/clubes">
          <Button className="bg-gros-red text-white hover:bg-gros-maroon">Ir al Catálogo</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gros-red text-white py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold font-serif">Checkout</h1>
        </div>
      </header>

      {/* Main Content */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gros-black mb-6">Datos de Contacto</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gros-black mb-2">Nombre Completo *</label>
                  <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Tu nombre" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gros-black mb-2">Email *</label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gros-black mb-2">Teléfono *</label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+54 9 11 1234 5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gros-black mb-2">Dirección</label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Calle y número"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gros-black mb-2">Provincia</label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  >
                    <option value="">Selecciona una provincia</option>
                    <option value="Buenos Aires">Buenos Aires</option>
                    <option value="CABA">CABA</option>
                    <option value="Córdoba">Córdoba</option>
                    <option value="Rosario">Rosario</option>
                    <option value="Mendoza">Mendoza</option>
                    <option value="La Plata">La Plata</option>
                    <option value="Otras">Otras</option>
                  </select>
                </div>

                {/* Delivery Method */}
                <div>
                  <label className="block text-sm font-bold text-gros-black mb-3">Método de Entrega *</label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-4 border rounded cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="correo"
                        checked={formData.deliveryMethod === "correo"}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-bold text-gros-black">Envío a Domicilio (Correo Argentino)</div>
                        <p className="text-sm text-gray-600">
                          Recibirás tu pedido en la dirección indicada. El costo de envío se calculará según la provincia.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 border rounded cursor-pointer hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value="club"
                        checked={formData.deliveryMethod === "club"}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-bold text-gros-black">Retiro en el Club</div>
                        <p className="text-sm text-gray-600">
                          Retira tu pedido directamente en el club seleccionado. Sin costo adicional.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Club Selection - Only shown when club delivery is selected */}
                {formData.deliveryMethod === "club" && (
                  <div>
                    <label className="block text-sm font-bold text-gros-black mb-2">Seleccionar Club *</label>
                    <select
                      name="clubId"
                      value={formData.clubId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                      <option value="">Selecciona un club</option>
                      {clubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gros-black mb-2">Notas o comentarios</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Información adicional sobre tu pedido..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-20">
              <h2 className="text-2xl font-bold text-gros-black mb-4">Resumen del Pedido</h2>

              <div className="space-y-3 mb-6 pb-6 border-b">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-bold">${item.price * item.quantity}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.quantity}x - {item.size} - {item.color}
                      {item.fabric && item.fabric !== "Sin especificar" && ` - ${item.fabric}`}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between mb-6 text-lg">
                <span className="font-bold text-gros-black">Total:</span>
                <span className="font-bold text-gros-red text-2xl">${total}</span>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => handleCheckout("mercadopago")}
                  disabled={loading}
                  className="w-full bg-[#C41E3A] text-white hover:bg-[#8B1538] font-bold h-12 text-base"
                  style={{ backgroundColor: loading ? '#999' : '#C41E3A' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Pagar con Mercado Pago
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                <Link href="/carrito" className="block">
                  <Button
                    variant="outline"
                    className="w-full font-bold h-12 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Volver al Carrito
                  </Button>
                </Link>
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

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  )
}
