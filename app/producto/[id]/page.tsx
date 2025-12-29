"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ShoppingCart, MessageCircle } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useRouter } from "next/navigation"
import { AlertModal } from "@/components/ui/alert-modal"

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const productId = Number.parseInt(id)
  const router = useRouter()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedFabric, setSelectedFabric] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [customText, setCustomText] = useState("")
  const [currentPrice, setCurrentPrice] = useState(0)
  const { addItem } = useCart()
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    message: string
    type: "success" | "error" | "info"
    actionButton?: {
      label: string
      onClick: () => void
    }
  }>({
    isOpen: false,
    message: "",
    type: "info",
  })

  useEffect(() => {
    loadProduct()
  }, [productId])

  const loadProduct = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()

      if (data.products) {
        const foundProduct = data.products.find((p: any) => p.id === productId)

        if (foundProduct) {
          // Transform product data - fabrics is now an object with prices
          const transformedProduct = {
            ...foundProduct,
            images: foundProduct.images && foundProduct.images.length > 0
              ? foundProduct.images
              : (foundProduct.image_url ? [foundProduct.image_url] : ["/placeholder.svg"]),
            sizes: foundProduct.sizes || ["S", "M", "L", "XL"],
            fabrics: foundProduct.fabrics || {},
            leadTime: foundProduct.lead_time || "7-10 días",
            description_long: foundProduct.description || "Producto de alta calidad personalizable."
          }

          setProduct(transformedProduct)

          // Set initial fabric and price if available
          const fabricNames = Object.keys(transformedProduct.fabrics)
          if (fabricNames.length > 0) {
            const firstFabric = fabricNames[0]
            setSelectedFabric(firstFabric)
            setCurrentPrice(transformedProduct.fabrics[firstFabric])
          } else {
            // If no fabrics, use base price
            setCurrentPrice(foundProduct.price)
          }
        } else {
          setNotFound(true)
        }
      }
    } catch (error) {
      console.error("Error loading product:", error)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  // Update price when fabric selection changes
  const handleFabricChange = (fabricName: string) => {
    setSelectedFabric(fabricName)
    if (product.fabrics[fabricName]) {
      setCurrentPrice(product.fabrics[fabricName])
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setAlertModal({
        isOpen: true,
        message: "Por favor selecciona un talle",
        type: "error",
      })
      return
    }
    if (Object.keys(product.fabrics).length > 0 && !selectedFabric) {
      setAlertModal({
        isOpen: true,
        message: "Por favor selecciona un tipo de tela",
        type: "error",
      })
      return
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: currentPrice, // Use current price based on selected fabric
      quantity,
      size: selectedSize,
      color: "Sin color",
      fabric: selectedFabric || "Sin especificar",
      customText,
      image: product.images[0],
    })

    setAlertModal({
      isOpen: true,
      message: "Producto agregado al carrito exitosamente",
      type: "success",
      actionButton: {
        label: "Ir al Carrito",
        onClick: () => router.push("/carrito"),
      },
    })
  }

  // Loading state
  if (loading) {
    return (
      <div style={{ backgroundColor: "var(--gros-white)" }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg" style={{ color: "#666666" }}>Cargando producto...</p>
        </div>
      </div>
    )
  }

  // Not found state
  if (notFound || !product) {
    return (
      <div style={{ backgroundColor: "var(--gros-white)" }} className="min-h-screen">
        <header className="border-b py-4 px-4 md:px-8" style={{ backgroundColor: "var(--gros-white)" }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link
              href="/clubes"
              className="flex items-center gap-2 hover:opacity-75"
              style={{ color: "var(--gros-red)" }}
            >
              <ChevronLeft className="h-5 w-5" />
              Volver al catálogo
            </Link>
          </div>
        </header>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4" style={{ color: "var(--gros-black)" }}>
              Producto no encontrado
            </h1>
            <p className="text-lg mb-6" style={{ color: "#666666" }}>
              El producto que buscas no existe o no está disponible.
            </p>
            <Link href="/clubes">
              <Button
                style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                className="hover:opacity-90"
              >
                Ver todos los productos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: "var(--gros-white)" }} className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 z-40 py-4 px-4 md:px-8" style={{ backgroundColor: "var(--gros-white)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/clubes"
            className="flex items-center gap-2 hover:opacity-75"
            style={{ color: "var(--gros-red)" }}
          >
            <ChevronLeft className="h-5 w-5" />
            Volver al catálogo
          </Link>
        </div>
      </header>

      {/* Product Detail */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="rounded-lg overflow-hidden h-96 md:h-[500px]"
              style={{ backgroundColor: "var(--gros-sand)" }}
            >
              <img
                src={product.images[selectedImage] || "/placeholder.svg?height=500&width=500&query=product"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              {product.images.map((image: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className="h-20 w-20 rounded-lg overflow-hidden border-2 transition"
                  style={{ borderColor: selectedImage === idx ? "var(--gros-red)" : "#e0e0e0" }}
                >
                  <img
                    src={image || "/placeholder.svg?height=80&width=80&query=product"}
                    alt={`${product.name} ${idx}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <Badge variant="secondary" className="mb-3">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold font-serif mb-2" style={{ color: "var(--gros-black)" }}>
                {product.name}
              </h1>
              <p className="text-xl mb-4" style={{ color: "#666666" }}>
                {product.description}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold" style={{ color: "var(--gros-red)" }}>
                  ${currentPrice}
                </span>
                <span className="text-sm" style={{ color: "#999999" }}>
                  por unidad
                </span>
              </div>
              <p className="text-sm mt-2" style={{ color: "#999999" }}>
                Producción: {product.leadTime}
              </p>
            </div>

            <Card className="p-6 space-y-6" style={{ backgroundColor: "var(--gros-white)" }}>
              {/* Sizes */}
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: "var(--gros-black)" }}>
                  Talle
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="py-2 px-3 text-center border-2 rounded font-semibold transition"
                      style={{
                        borderColor: selectedSize === size ? "var(--gros-red)" : "#d0d0d0",
                        backgroundColor: selectedSize === size ? "var(--gros-red)" : "var(--gros-white)",
                        color: selectedSize === size ? "var(--gros-white)" : "var(--gros-black)",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fabrics */}
              {Object.keys(product.fabrics).length > 0 && (
                <div>
                  <label className="block text-sm font-bold mb-3" style={{ color: "var(--gros-black)" }}>
                    Tipo de Tela
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(product.fabrics).map(([fabricName, price]: [string, any]) => (
                      <button
                        key={fabricName}
                        onClick={() => handleFabricChange(fabricName)}
                        className="py-3 px-4 text-left border-2 rounded font-semibold transition"
                        style={{
                          borderColor: selectedFabric === fabricName ? "var(--gros-red)" : "#d0d0d0",
                          backgroundColor: selectedFabric === fabricName ? "var(--gros-red)" : "var(--gros-white)",
                          color: selectedFabric === fabricName ? "var(--gros-white)" : "var(--gros-black)",
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span>{fabricName}</span>
                          <span className="text-sm font-bold">${price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: "var(--gros-black)" }}>
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-10 w-10 border rounded hover:bg-gray-100"
                    style={{ borderColor: "#d0d0d0" }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="h-10 w-16 text-center border rounded"
                    style={{ borderColor: "#d0d0d0" }}
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-10 w-10 border rounded hover:bg-gray-100"
                    style={{ borderColor: "#d0d0d0" }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Customization */}
              <div>
                <label className="block text-sm font-bold mb-3" style={{ color: "var(--gros-black)" }}>
                  Texto personalizado (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mi Club 2025"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  maxLength={30}
                  className="w-full px-3 py-2 border rounded"
                  style={{ borderColor: "#d0d0d0" }}
                />
                <p className="text-xs mt-1" style={{ color: "#999999" }}>
                  {customText.length}/30 caracteres
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleAddToCart}
                  className="w-full font-bold h-12 hover:opacity-90"
                  style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Agregar al Carrito
                </Button>
                <a href="https://wa.me/5491234567890?text=Me%20interesa%20este%20producto" className="block">
                  <Button
                    className="w-full font-bold h-12"
                    style={{
                      backgroundColor: "var(--gros-white)",
                      color: "var(--gros-red)",
                      border: "2px solid var(--gros-red)",
                    }}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Consultar por WhatsApp
                  </Button>
                </a>
              </div>
            </Card>

            {/* Description */}
            <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: "var(--gros-sand)" }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: "var(--gros-black)" }}>
                Detalles del Producto
              </h3>
              <p className="whitespace-pre-line text-sm" style={{ color: "#555555" }}>
                {product.description_long}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-8 px-4 md:px-8 mt-12" style={{ backgroundColor: "var(--gros-black)" }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2">Gros Indumentaria © 2025</p>
          <p style={{ color: "#999999" }}>Prendas Personalizadas de Calidad</p>
        </div>
      </footer>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        type={alertModal.type}
        actionButton={alertModal.actionButton}
      />
    </div>
  )
}
