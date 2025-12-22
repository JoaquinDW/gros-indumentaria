"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { LogOut, Plus, Package, ShoppingCart, ImageIcon, Folder, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AlertModal } from "@/components/ui/alert-modal"
import { ImageUpload } from "@/components/ui/image-upload"

export default function AdminPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "categories" | "clubs" | "carousel">("orders")
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

  const [products, setProducts] = useState<any[]>([])

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
    description: "",
    price: 0,
    image_url: "",
    sizes: [] as string[],
    colors: [] as string[],
    fabrics: [] as string[],
    lead_time: "7-10 días",
    active: true,
  })
  const [editingProduct, setEditingProduct] = useState<number | null>(null)

  // Temporary input states for sizes, colors, and fabrics (raw text input)
  const [sizesInput, setSizesInput] = useState("")
  const [colorsInput, setColorsInput] = useState("")
  const [fabricsInput, setFabricsInput] = useState("")

  const [newCarouselImage, setNewCarouselImage] = useState({
    title: "",
    description: "",
    image_url: "",
    cta_text: "",
    cta_link: "",
  })

  const [categories, setCategories] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image_url: "",
    order_index: 0,
  })
  const [editingCategory, setEditingCategory] = useState<number | null>(null)

  const [clubs, setClubs] = useState<any[]>([])
  const [newClub, setNewClub] = useState({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    order_index: 0,
  })
  const [editingClub, setEditingClub] = useState<number | null>(null)
  const [selectedClubForProducts, setSelectedClubForProducts] = useState<number | null>(null)
  const [clubProducts, setClubProducts] = useState<number[]>([])

  useEffect(() => {
    setMounted(true)
    setSupabase(createClient())
  }, [])

  // Sincronizar tab con URL query parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['orders', 'products', 'categories', 'clubs', 'carousel'].includes(tab)) {
      setActiveTab(tab as "orders" | "products" | "categories" | "clubs" | "carousel")
    }
  }, [searchParams])

  useEffect(() => {
    if (!supabase) return

    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setLoading(false)
    }
    checkAuth()
  }, [supabase])

  useEffect(() => {
    if (isLoggedIn) {
      loadCategories()
      loadProducts()
      loadClubs()
    }
  }, [isLoggedIn])

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      if (data.products) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

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

  const changeTab = (tab: "orders" | "products" | "categories" | "clubs" | "carousel") => {
    setActiveTab(tab)
    router.push(`/admin?tab=${tab}`)
  }

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
  }

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.category || newProduct.price <= 0) {
      setAlertModal({
        isOpen: true,
        message: "Por favor completa todos los campos requeridos",
        type: "error",
      })
      return
    }

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear producto")
      }

      setAlertModal({
        isOpen: true,
        message: "Producto creado exitosamente",
        type: "success",
      })
      setNewProduct({
        name: "",
        category: "",
        description: "",
        price: 0,
        image_url: "",
        sizes: [],
        colors: [],
        fabrics: [],
        lead_time: "7-10 días",
        active: true,
      })
      setSizesInput("")
      setColorsInput("")
      setFabricsInput("")
      loadProducts()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al crear producto",
        type: "error",
      })
    }
  }

  const updateProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar producto")
      }

      setAlertModal({
        isOpen: true,
        message: "Producto actualizado exitosamente",
        type: "success",
      })
      setNewProduct({
        name: "",
        category: "",
        description: "",
        price: 0,
        image_url: "",
        sizes: [],
        colors: [],
        fabrics: [],
        lead_time: "7-10 días",
        active: true,
      })
      setSizesInput("")
      setColorsInput("")
      setFabricsInput("")
      setEditingProduct(null)
      loadProducts()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al actualizar producto",
        type: "error",
      })
    }
  }

  const deleteProduct = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este producto?")) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar producto")
      }

      setAlertModal({
        isOpen: true,
        message: "Producto eliminado exitosamente",
        type: "success",
      })
      loadProducts()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al eliminar producto",
        type: "error",
      })
    }
  }

  const startEditProduct = (product: any) => {
    setEditingProduct(product.id)
    setNewProduct({
      name: product.name,
      category: product.category,
      description: product.description || "",
      price: product.price,
      image_url: product.image_url || "",
      sizes: product.sizes || [],
      colors: product.colors || [],
      fabrics: product.fabrics || [],
      lead_time: product.lead_time || "7-10 días",
      active: product.active !== undefined ? product.active : true,
    })
    // Populate input fields for editing
    setSizesInput(Array.isArray(product.sizes) ? product.sizes.join(", ") : "")
    setColorsInput(Array.isArray(product.colors) ? product.colors.join(", ") : "")
    setFabricsInput(Array.isArray(product.fabrics) ? product.fabrics.join(", ") : "")
  }

  const cancelEditProduct = () => {
    setEditingProduct(null)
    setNewProduct({
      name: "",
      category: "",
      description: "",
      price: 0,
      image_url: "",
      sizes: [],
      colors: [],
      fabrics: [],
      lead_time: "7-10 días",
      active: true,
    })
    setSizesInput("")
    setColorsInput("")
    setFabricsInput("")
  }

  const toggleProductActive = async (id: number, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al actualizar estado del producto")
      }

      setAlertModal({
        isOpen: true,
        message: `Producto ${!currentActive ? "activado" : "desactivado"} exitosamente`,
        type: "success",
      })
      loadProducts()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al actualizar estado",
        type: "error",
      })
    }
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

  const addCategory = async () => {
    if (!newCategory.name) {
      setAlertModal({
        isOpen: true,
        message: "Por favor completa el nombre de la categoría",
        type: "error",
      })
      return
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear categoría")
      }

      setAlertModal({
        isOpen: true,
        message: "Categoría creada exitosamente",
        type: "success",
      })
      setNewCategory({ name: "", description: "", image_url: "", order_index: 0 })
      loadCategories()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al crear categoría",
        type: "error",
      })
    }
  }

  const updateCategory = async (id: number) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCategory),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar categoría")
      }

      setAlertModal({
        isOpen: true,
        message: "Categoría actualizada exitosamente",
        type: "success",
      })
      setNewCategory({ name: "", description: "", image_url: "", order_index: 0 })
      setEditingCategory(null)
      loadCategories()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al actualizar categoría",
        type: "error",
      })
    }
  }

  const deleteCategory = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar esta categoría?")) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar categoría")
      }

      setAlertModal({
        isOpen: true,
        message: "Categoría eliminada exitosamente",
        type: "success",
      })
      loadCategories()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al eliminar categoría",
        type: "error",
      })
    }
  }

  const startEditCategory = (category: any) => {
    setEditingCategory(category.id)
    setNewCategory({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
      order_index: category.order_index || 0,
    })
  }

  const cancelEditCategory = () => {
    setEditingCategory(null)
    setNewCategory({ name: "", description: "", image_url: "", order_index: 0 })
  }

  const updateCategoryOrder = async (categoryId: number, direction: "up" | "down") => {
    const index = categories.findIndex((cat) => cat.id === categoryId)
    if (direction === "up" && index > 0) {
      const newOrder = categories[index - 1].order_index
      await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: newOrder }),
      })
      await fetch(`/api/categories/${categories[index - 1].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: categories[index].order_index }),
      })
      loadCategories()
    } else if (direction === "down" && index < categories.length - 1) {
      const newOrder = categories[index + 1].order_index
      await fetch(`/api/categories/${categoryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: newOrder }),
      })
      await fetch(`/api/categories/${categories[index + 1].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: categories[index].order_index }),
      })
      loadCategories()
    }
  }

  const loadClubs = async () => {
    try {
      const response = await fetch("/api/clubs")
      const data = await response.json()
      if (data.clubs) {
        setClubs(data.clubs)
      }
    } catch (error) {
      console.error("Error loading clubs:", error)
    }
  }

  const loadClubProducts = async (clubId: number) => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/products`)
      const data = await response.json()
      if (data.products) {
        setClubProducts(data.products.map((p: any) => p.id))
      }
    } catch (error) {
      console.error("Error loading club products:", error)
    }
  }

  const addClub = async () => {
    if (!newClub.name) {
      setAlertModal({
        isOpen: true,
        message: "Por favor completa el nombre del club",
        type: "error",
      })
      return
    }

    try {
      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClub),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear club")
      }

      setAlertModal({
        isOpen: true,
        message: "Club creado exitosamente",
        type: "success",
      })
      setNewClub({ name: "", slug: "", description: "", logo_url: "", order_index: 0 })
      loadClubs()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al crear club",
        type: "error",
      })
    }
  }

  const updateClub = async (id: number) => {
    try {
      const response = await fetch(`/api/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newClub),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar club")
      }

      setAlertModal({
        isOpen: true,
        message: "Club actualizado exitosamente",
        type: "success",
      })
      setNewClub({ name: "", slug: "", description: "", logo_url: "", order_index: 0 })
      setEditingClub(null)
      loadClubs()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al actualizar club",
        type: "error",
      })
    }
  }

  const deleteClub = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este club?")) return

    try {
      const response = await fetch(`/api/clubs/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Error al eliminar club")
      }

      setAlertModal({
        isOpen: true,
        message: "Club eliminado exitosamente",
        type: "success",
      })
      loadClubs()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al eliminar club",
        type: "error",
      })
    }
  }

  const startEditClub = (club: any) => {
    setEditingClub(club.id)
    setNewClub({
      name: club.name,
      slug: club.slug || "",
      description: club.description || "",
      logo_url: club.logo_url || "",
      order_index: club.order_index || 0,
    })
  }

  const cancelEditClub = () => {
    setEditingClub(null)
    setNewClub({ name: "", slug: "", description: "", logo_url: "", order_index: 0 })
  }

  const updateClubOrder = async (clubId: number, direction: "up" | "down") => {
    const index = clubs.findIndex((c) => c.id === clubId)
    if (direction === "up" && index > 0) {
      const newOrder = clubs[index - 1].order_index
      await fetch(`/api/clubs/${clubId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: newOrder }),
      })
      await fetch(`/api/clubs/${clubs[index - 1].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: clubs[index].order_index }),
      })
      loadClubs()
    } else if (direction === "down" && index < clubs.length - 1) {
      const newOrder = clubs[index + 1].order_index
      await fetch(`/api/clubs/${clubId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: newOrder }),
      })
      await fetch(`/api/clubs/${clubs[index + 1].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: clubs[index].order_index }),
      })
      loadClubs()
    }
  }

  const toggleProductInClub = (productId: number) => {
    setClubProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const saveClubProducts = async () => {
    if (!selectedClubForProducts) return

    try {
      // First, get current products for the club
      const response = await fetch(`/api/clubs/${selectedClubForProducts}/products`)
      const data = await response.json()
      const currentProducts = data.products?.map((p: any) => p.id) || []

      // Find products to remove
      const toRemove = currentProducts.filter((id: number) => !clubProducts.includes(id))
      // Find products to add
      const toAdd = clubProducts.filter((id: number) => !currentProducts.includes(id))

      // Remove products
      for (const productId of toRemove) {
        await fetch(`/api/clubs/${selectedClubForProducts}/products?product_id=${productId}`, {
          method: "DELETE",
        })
      }

      // Add products
      if (toAdd.length > 0) {
        await fetch(`/api/clubs/${selectedClubForProducts}/products`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_ids: toAdd }),
        })
      }

      setAlertModal({
        isOpen: true,
        message: "Productos del club actualizados exitosamente",
        type: "success",
      })
      setSelectedClubForProducts(null)
      setClubProducts([])
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al actualizar productos del club",
        type: "error",
      })
    }
  }

  if (!mounted || !supabase || loading) {
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
            onClick={() => changeTab("orders")}
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
            onClick={() => changeTab("products")}
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
            onClick={() => changeTab("categories")}
            className={`py-4 px-2 font-bold border-b-2 transition`}
            style={{
              borderBottomColor: activeTab === "categories" ? "var(--gros-red)" : "transparent",
              color: activeTab === "categories" ? "var(--gros-red)" : "#666666",
            }}
          >
            <Folder className="h-5 w-5 inline mr-2" />
            Categorías
          </button>
          <button
            onClick={() => changeTab("clubs")}
            className={`py-4 px-2 font-bold border-b-2 transition`}
            style={{
              borderBottomColor: activeTab === "clubs" ? "var(--gros-red)" : "transparent",
              color: activeTab === "clubs" ? "var(--gros-red)" : "#666666",
            }}
          >
            <Users className="h-5 w-5 inline mr-2" />
            Clubes
          </button>
          <button
            onClick={() => changeTab("carousel")}
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
                  {editingProduct ? "Editar Producto" : "Agregar Nuevo Producto"}
                </h2>

                <Card className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Nombre *
                      </label>
                      <Input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Nombre del producto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Categoría *
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
                        {categories
                          .filter((cat) => cat.active)
                          .map((category) => (
                            <option key={category.id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Precio *
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Descripción
                      </label>
                      <textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Descripción del producto"
                        className="w-full px-3 py-2 border border-gray-300 rounded min-h-[80px]"
                      />
                    </div>
                    <div>
                      <ImageUpload
                        label="Imagen del Producto"
                        value={newProduct.image_url}
                        onChange={(url) => setNewProduct({ ...newProduct, image_url: url })}
                        onRemove={() => setNewProduct({ ...newProduct, image_url: "" })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Talles (separados por coma)
                      </label>
                      <Input
                        value={sizesInput}
                        onChange={(e) => setSizesInput(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value.trim()
                          const sizes = value ? value.split(",").map((s) => s.trim()).filter((s) => s) : []
                          setNewProduct({
                            ...newProduct,
                            sizes,
                          })
                        }}
                        placeholder="S, M, L, XL"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {Array.isArray(newProduct.sizes) && newProduct.sizes.length > 0
                          ? `${newProduct.sizes.length} talle(s): ${newProduct.sizes.join(", ")}`
                          : "Escribe los talles y presiona Tab o haz clic fuera"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Colores (separados por coma)
                      </label>
                      <Input
                        value={colorsInput}
                        onChange={(e) => setColorsInput(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value.trim()
                          const colors = value ? value.split(",").map((c) => c.trim()).filter((c) => c) : []
                          setNewProduct({
                            ...newProduct,
                            colors,
                          })
                        }}
                        placeholder="Rojo, Negro, Blanco, Azul"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {Array.isArray(newProduct.colors) && newProduct.colors.length > 0
                          ? `${newProduct.colors.length} color(es): ${newProduct.colors.join(", ")}`
                          : "Escribe los colores y presiona Tab o haz clic fuera"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Tipos de Tela (separados por coma)
                      </label>
                      <Input
                        value={fabricsInput}
                        onChange={(e) => setFabricsInput(e.target.value)}
                        onBlur={(e) => {
                          const value = e.target.value.trim()
                          const fabrics = value ? value.split(",").map((f) => f.trim()).filter((f) => f) : []
                          setNewProduct({
                            ...newProduct,
                            fabrics,
                          })
                        }}
                        placeholder="Algodón, Poliéster, Lycra"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {Array.isArray(newProduct.fabrics) && newProduct.fabrics.length > 0
                          ? `${newProduct.fabrics.length} tela(s): ${newProduct.fabrics.join(", ")}`
                          : "Escribe los tipos de tela y presiona Tab o haz clic fuera"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Tiempo de Entrega
                      </label>
                      <Input
                        value={newProduct.lead_time}
                        onChange={(e) => setNewProduct({ ...newProduct, lead_time: e.target.value })}
                        placeholder="7-10 días"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.active}
                        onChange={(e) => setNewProduct({ ...newProduct, active: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-bold" style={{ color: "var(--gros-black)" }}>
                        Producto Activo
                      </span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={editingProduct ? () => updateProduct(editingProduct) : addProduct}
                      className="hover:opacity-90 font-bold"
                      style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                    >
                      <Plus className="mr-2 h-5 w-5" />
                      {editingProduct ? "Actualizar Producto" : "Agregar Producto"}
                    </Button>
                    {editingProduct && (
                      <Button
                        onClick={cancelEditProduct}
                        variant="outline"
                        className="font-bold"
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                  Productos Actuales ({products.length})
                </h2>

                <div className="space-y-4">
                  {products.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-gray-500">No hay productos registrados</p>
                    </Card>
                  ) : (
                    products.map((product) => (
                      <Card key={product.id} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
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
                            <p className={`font-bold ${product.active ? "text-green-600" : "text-gray-400"}`}>
                              {product.active ? "Activo" : "Inactivo"}
                            </p>
                          </div>
                          <div>
                            <Button
                              onClick={() => toggleProductActive(product.id, product.active)}
                              variant="outline"
                              className={`w-full ${
                                product.active
                                  ? "border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                                  : "border-green-500 text-green-600 hover:bg-green-50"
                              }`}
                            >
                              {product.active ? "Desactivar" : "Activar"}
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => startEditProduct(product)}
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
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                  {editingCategory ? "Editar Categoría" : "Agregar Nueva Categoría"}
                </h2>

                <Card className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Nombre
                      </label>
                      <Input
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        placeholder="Nombre de la categoría"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Orden
                      </label>
                      <Input
                        type="number"
                        value={newCategory.order_index}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            order_index: Number.parseInt(e.target.value),
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                      Descripción (Opcional)
                    </label>
                    <Input
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="Descripción de la categoría"
                    />
                  </div>
                  <div>
                    <ImageUpload
                      label="Imagen de la Categoría (Opcional)"
                      value={newCategory.image_url}
                      onChange={(url) => setNewCategory({ ...newCategory, image_url: url })}
                      onRemove={() => setNewCategory({ ...newCategory, image_url: "" })}
                    />
                  </div>
                  <div className="flex gap-2">
                    {editingCategory ? (
                      <>
                        <Button
                          onClick={() => updateCategory(editingCategory)}
                          className="hover:opacity-90 font-bold"
                          style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                        >
                          Actualizar Categoría
                        </Button>
                        <Button
                          onClick={cancelEditCategory}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={addCategory}
                        className="hover:opacity-90 font-bold"
                        style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Agregar Categoría
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                  Categorías Actuales
                </h2>

                <div className="space-y-4">
                  {categories.map((category, idx) => (
                    <Card key={category.id} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="text-xs text-gray-500 font-bold">NOMBRE</p>
                          <p className="font-bold" style={{ color: "var(--gros-black)" }}>
                            {category.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">DESCRIPCIÓN</p>
                          <p className="text-sm" style={{ color: "var(--gros-black)" }}>
                            {category.description || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">ORDEN</p>
                          <p className="font-bold" style={{ color: "var(--gros-red)" }}>
                            {category.order_index}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">ESTADO</p>
                          <p className="font-bold text-green-600">{category.active ? "Activa" : "Inactiva"}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateCategoryOrder(category.id, "up")}
                              disabled={idx === 0}
                              className="hover:opacity-90"
                              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateCategoryOrder(category.id, "down")}
                              disabled={idx === categories.length - 1}
                              className="hover:opacity-90"
                              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                            >
                              ↓
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => startEditCategory(category)}
                            variant="outline"
                            className="border-gros-red text-gros-red hover:bg-gros-red/10 bg-transparent"
                            style={{ borderColor: "var(--gros-red)", color: "var(--gros-red)" }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteCategory(category.id)}
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

          {activeTab === "clubs" && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                  {editingClub ? "Editar Club" : "Agregar Nuevo Club"}
                </h2>

                <Card className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Nombre *
                      </label>
                      <Input
                        value={newClub.name}
                        onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                        placeholder="Nombre del club"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Slug (Opcional - se genera automático)
                      </label>
                      <Input
                        value={newClub.slug}
                        onChange={(e) => setNewClub({ ...newClub, slug: e.target.value })}
                        placeholder="depor-garcitas"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                      Descripción (Opcional)
                    </label>
                    <Input
                      value={newClub.description}
                      onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                      placeholder="Descripción del club"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <ImageUpload
                        label="Logo del Club (Opcional)"
                        value={newClub.logo_url}
                        onChange={(url) => setNewClub({ ...newClub, logo_url: url })}
                        onRemove={() => setNewClub({ ...newClub, logo_url: "" })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        Orden
                      </label>
                      <Input
                        type="number"
                        value={newClub.order_index}
                        onChange={(e) =>
                          setNewClub({
                            ...newClub,
                            order_index: Number.parseInt(e.target.value),
                          })
                        }
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editingClub ? (
                      <>
                        <Button
                          onClick={() => updateClub(editingClub)}
                          className="hover:opacity-90 font-bold"
                          style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                        >
                          Actualizar Club
                        </Button>
                        <Button
                          onClick={cancelEditClub}
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={addClub}
                        className="hover:opacity-90 font-bold"
                        style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Agregar Club
                      </Button>
                    )}
                  </div>
                </Card>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                  Clubes Actuales
                </h2>

                <div className="space-y-4">
                  {clubs.map((club, idx) => (
                    <Card key={club.id} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        <div>
                          <p className="text-xs text-gray-500 font-bold">NOMBRE</p>
                          <p className="font-bold" style={{ color: "var(--gros-black)" }}>
                            {club.name}
                          </p>
                          <p className="text-xs text-gray-500">/{club.slug}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">DESCRIPCIÓN</p>
                          <p className="text-sm" style={{ color: "var(--gros-black)" }}>
                            {club.description || "-"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">ORDEN</p>
                          <p className="font-bold" style={{ color: "var(--gros-red)" }}>
                            {club.order_index}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold">ESTADO</p>
                          <p className="font-bold text-green-600">{club.active ? "Activo" : "Inactivo"}</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => updateClubOrder(club.id, "up")}
                              disabled={idx === 0}
                              className="hover:opacity-90"
                              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                            >
                              ↑
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => updateClubOrder(club.id, "down")}
                              disabled={idx === clubs.length - 1}
                              className="hover:opacity-90"
                              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                            >
                              ↓
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedClubForProducts(club.id)
                              loadClubProducts(club.id)
                            }}
                            variant="outline"
                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                          >
                            Productos
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => startEditClub(club)}
                            variant="outline"
                            className="border-gros-red text-gros-red hover:bg-gros-red/10 bg-transparent"
                            style={{ borderColor: "var(--gros-red)", color: "var(--gros-red)" }}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteClub(club.id)}
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

              {selectedClubForProducts && (
                <div>
                  <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--gros-black)" }}>
                    Asignar Productos a {clubs.find((c) => c.id === selectedClubForProducts)?.name}
                  </h2>

                  <Card className="p-6 space-y-4">
                    <p className="text-sm text-gray-600">
                      Selecciona los productos que pertenecen a este club. Los productos seleccionados aparecerán en la
                      página del club.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto border rounded p-4">
                      {products.map((product) => (
                        <label
                          key={product.id}
                          className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={clubProducts.includes(product.id)}
                            onChange={() => toggleProductInClub(product.id)}
                            className="mt-1 w-4 h-4"
                          />
                          <div className="flex-1">
                            <p className="font-bold text-sm" style={{ color: "var(--gros-black)" }}>
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                            <p className="text-xs font-bold" style={{ color: "var(--gros-red)" }}>
                              ${product.price}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={saveClubProducts}
                        className="hover:opacity-90 font-bold"
                        style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                      >
                        Guardar Productos
                      </Button>
                      <Button
                        onClick={() => {
                          setSelectedClubForProducts(null)
                          setClubProducts([])
                        }}
                        variant="outline"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
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
                      <ImageUpload
                        label="Imagen del Carrusel"
                        value={newCarouselImage.image_url}
                        onChange={(url) => setNewCarouselImage({ ...newCarouselImage, image_url: url })}
                        onRemove={() => setNewCarouselImage({ ...newCarouselImage, image_url: "" })}
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
