"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { LogOut, Plus, Package, ShoppingCart, ImageIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AlertModal } from "@/components/ui/alert-modal"

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "carousel">("orders")
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean
    message: string
    type: "success" | "error" | "info"
  }>({
    isOpen: false,
    message: "",
    type: "info",
  })

  // Mock data
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: "ORD-001",
      customerName: "Juan Pérez",
      customerEmail: "juan@example.com",
      totalAmount: 2250,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      orderNumber: "ORD-002",
      customerName: "María García",
      customerEmail: "maria@example.com",
      totalAmount: 5600,
      status: "approved",
      createdAt: new Date().toISOString(),
    },
  ])

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Remera Premium",
      category: "Remeras",
      price: 450,
      active: true,
    },
    {
      id: 2,
      name: "Buzo Deportivo",
      category: "Buzos",
      price: 890,
      active: true,
    },
  ])

  const [carouselImages, setCarouselImages] = useState([
    {
      id: 1,
      title: "Prendas Personalizadas",
      image_url: "/remera-deportiva-personalizada.jpg",
      description: "Gráfica textil, sublimación y confección",
      cta_text: "Ver Catálogo",
      cta_link: "/clubes",
      order_index: 1,
      active: true,
    },
    {
      id: 2,
      title: "Diseños Únicos",
      image_url: "/buzo-deportivo-personalizado.jpg",
      description: "Personaliza tus prendas",
      cta_text: "Explorar",
      cta_link: "/clubes",
      order_index: 2,
      active: true,
    },
  ])

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: 0,
  })

  const [newCarouselImage, setNewCarouselImage] = useState({
    title: "",
    description: "",
    image_url: "",
    cta_text: "",
    cta_link: "",
  })

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setLoading(false)
    }
    checkAuth()
  }, [supabase.auth])

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setAlertModal({
        isOpen: true,
        message: "Error: " + error.message,
        type: "error",
      })
    } else {
      setIsLoggedIn(true)
      setEmail("")
      setPassword("")
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
  }

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const addProduct = () => {
    if (!newProduct.name || !newProduct.category || newProduct.price <= 0) {
      setAlertModal({
        isOpen: true,
        message: "Por favor completa todos los campos",
        type: "error",
      })
      return
    }
    setProducts([
      ...products,
      {
        id: products.length + 1,
        ...newProduct,
        active: true,
      },
    ])
    setNewProduct({ name: "", category: "", price: 0 })
  }

  const deleteProduct = (productId: number) => {
    setProducts(products.filter((p) => p.id !== productId))
  }

  const addCarouselImage = () => {
    if (!newCarouselImage.title || !newCarouselImage.image_url) {
      setAlertModal({
        isOpen: true,
        message: "Por favor completa título e imagen",
        type: "error",
      })
      return
    }
    setCarouselImages([
      ...carouselImages,
      {
        id: carouselImages.length + 1,
        ...newCarouselImage,
        order_index: carouselImages.length + 1,
        active: true,
      },
    ])
    setNewCarouselImage({
      title: "",
      description: "",
      image_url: "",
      cta_text: "",
      cta_link: "",
    })
  }

  const deleteCarouselImage = (imageId: number) => {
    setCarouselImages(carouselImages.filter((img) => img.id !== imageId))
  }

  const updateCarouselOrder = (imageId: number, direction: "up" | "down") => {
    setCarouselImages((prevImages) => {
      const newImages = [...prevImages]
      const index = newImages.findIndex((img) => img.id === imageId)
      if (direction === "up" && index > 0) {
        ;[newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]
      } else if (direction === "down" && index < newImages.length - 1) {
        ;[newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      }
      return newImages
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md p-8">
          <h1 className="text-3xl font-bold font-serif mb-6" style={{ color: "var(--gros-black)" }}>
            Panel Admin
          </h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gros.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
              />
            </div>
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full hover:opacity-90 font-bold"
              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
            >
              {loading ? "Cargando..." : "Ingresar"}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--gros-white)" }}>
      {/* Header */}
      <header className="text-white py-6 px-4 md:px-8" style={{ backgroundColor: "var(--gros-black)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-3xl font-bold font-serif">Panel de Administración</h1>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-white text-white hover:bg-white/10 bg-transparent"
          >
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-8">
          <button
            onClick={() => setActiveTab("orders")}
            className={`py-4 px-2 font-bold border-b-2 transition ${
              activeTab === "orders"
                ? "border-gros-red text-gros-red"
                : "border-transparent text-gray-600 hover:text-gros-red"
            }`}
            style={{
              borderBottomColor: activeTab === "orders" ? "var(--gros-red)" : "transparent",
              color: activeTab === "orders" ? "var(--gros-red)" : "#666666",
            }}
          >
            <ShoppingCart className="h-5 w-5 inline mr-2" />
            Pedidos
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`py-4 px-2 font-bold border-b-2 transition`}
            style={{
              borderBottomColor: activeTab === "products" ? "var(--gros-red)" : "transparent",
              color: activeTab === "products" ? "var(--gros-red)" : "#666666",
            }}
          >
            <Package className="h-5 w-5 inline mr-2" />
            Productos
          </button>
          <button
            onClick={() => setActiveTab("carousel")}
            className={`py-4 px-2 font-bold border-b-2 transition`}
            style={{
              borderBottomColor: activeTab === "carousel" ? "var(--gros-red)" : "transparent",
              color: activeTab === "carousel" ? "var(--gros-red)" : "#666666",
            }}
          >
            <ImageIcon className="h-5 w-5 inline mr-2" />
            Carrusel Hero
          </button>
        </div>
      </div>

      {/* Content */}
      <section className="py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                Gestión de Pedidos
              </h2>

              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center mb-4">
                      <div>
                        <p className="text-xs text-gray-500 font-bold">NÚMERO</p>
                        <p className="font-bold" style={{ color: "var(--gros-black)" }}>
                          {order.orderNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold">CLIENTE</p>
                        <p className="font-bold" style={{ color: "var(--gros-black)" }}>
                          {order.customerName}
                        </p>
                        <p className="text-xs text-gray-600">{order.customerEmail}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold">TOTAL</p>
                        <p className="font-bold text-lg" style={{ color: "var(--gros-red)" }}>
                          ${order.totalAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold">ESTADO</p>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="approved">Aprobado</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregado</option>
                          <option value="rejected">Rechazado</option>
                        </select>
                      </div>
                      <div className="text-right">
                        <Button
                          className="hover:opacity-90"
                          style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                        >
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                  Agregar Nuevo Producto
                </h2>

                <Card className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Nombre
                      </label>
                      <Input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Categoría
                      </label>
                      <select
                        value={newProduct.category}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="">Selecciona categoría</option>
                        <option value="Remeras">Remeras</option>
                        <option value="Buzos">Buzos</option>
                        <option value="Calzas">Calzas</option>
                        <option value="Camperas">Camperas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Precio
                      </label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: Number.parseFloat(e.target.value),
                          })
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={addProduct}
                    className="hover:opacity-90 font-bold"
                    style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Agregar Producto
                  </Button>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                  Productos Actuales
                </h2>

                <div className="space-y-4">
                  {products.map((product) => (
                    <Card key={product.id} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="text-xs text-gray-500 font-bold">NOMBRE</p>
                          <p className="font-bold" style={{ color: "var(--gros-black)" }}>
                            {product.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">CATEGORÍA</p>
                          <p className="font-bold" style={{ color: "var(--gros-black)" }}>
                            {product.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">PRECIO</p>
                          <p className="font-bold text-lg" style={{ color: "var(--gros-red)" }}>
                            ${product.price}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">ESTADO</p>
                          <p className="font-bold text-green-600">{product.active ? "Activo" : "Inactivo"}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="border-gros-red text-gros-red hover:bg-gros-red/10 bg-transparent"
                            style={{ borderColor: "var(--gros-red)", color: "var(--gros-red)" }}
                          >
                            Editar
                          </Button>
                          <Button
                            onClick={() => deleteProduct(product.id)}
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "carousel" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                  Agregar Imagen al Carrusel
                </h2>

                <Card className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Título
                      </label>
                      <Input
                        value={newCarouselImage.title}
                        onChange={(e) => setNewCarouselImage({ ...newCarouselImage, title: e.target.value })}
                        placeholder="Título del slide"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        URL de Imagen
                      </label>
                      <Input
                        value={newCarouselImage.image_url}
                        onChange={(e) => setNewCarouselImage({ ...newCarouselImage, image_url: e.target.value })}
                        placeholder="https://ejemplo.com/imagen.jpg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                      Descripción (Opcional)
                    </label>
                    <Input
                      value={newCarouselImage.description}
                      onChange={(e) => setNewCarouselImage({ ...newCarouselImage, description: e.target.value })}
                      placeholder="Descripción del slide"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Texto del Botón (Opcional)
                      </label>
                      <Input
                        value={newCarouselImage.cta_text}
                        onChange={(e) => setNewCarouselImage({ ...newCarouselImage, cta_text: e.target.value })}
                        placeholder="Ver Catálogo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Link del Botón (Opcional)
                      </label>
                      <Input
                        value={newCarouselImage.cta_link}
                        onChange={(e) => setNewCarouselImage({ ...newCarouselImage, cta_link: e.target.value })}
                        placeholder="/clubes"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={addCarouselImage}
                    className="hover:opacity-90 font-bold w-full"
                    style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                  >
                    <Plus className="mr-2 h-5 w-5" />
                    Agregar Imagen
                  </Button>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                  Imágenes del Carrusel
                </h2>

                <div className="space-y-4">
                  {carouselImages.map((image, idx) => (
                    <Card key={image.id} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 font-bold">TÍTULO</p>
                          <p className="font-bold" style={{ color: "var(--gros-black)" }}>
                            {image.title}
                          </p>
                          {image.description && <p className="text-sm text-gray-600">{image.description}</p>}
                        </div>
                        <div className="md:col-span-1">
                          <img
                            src={image.image_url || "/placeholder.svg"}
                            alt={image.title}
                            className="w-full h-24 object-cover rounded"
                          />
                        </div>
                        <div className="flex gap-2 flex-wrap md:flex-col items-start justify-between">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateCarouselOrder(image.id, "up")}
                              disabled={idx === 0}
                              className="hover:opacity-90"
                              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateCarouselOrder(image.id, "down")}
                              disabled={idx === carouselImages.length - 1}
                              className="hover:opacity-90"
                              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                            >
                              ↓
                            </Button>
                          </div>
                          <Button
                            onClick={() => deleteCarouselImage(image.id)}
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

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
