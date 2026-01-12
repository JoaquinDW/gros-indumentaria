"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { LogOut, Plus, Package, ShoppingCart, ImageIcon, Folder, Users, GripVertical } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { AlertModal } from "@/components/ui/alert-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ImageUpload } from "@/components/ui/image-upload"
import { MultipleImageUpload } from "@/components/ui/multiple-image-upload"
import { ImagePositionEditor } from "@/components/ui/image-position-editor"
import { Modal } from "@/components/ui/modal"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Sortable Product Card Component
function SortableProductCard({
  product,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  product: any
  onEdit: (product: any) => void
  onDelete: (id: number) => void
  onToggleActive: (id: number, active: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style} className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
            style={{ touchAction: "none" }}
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">NOMBRE</p>
            <p className="font-bold" style={{ color: "var(--gros-black)" }}>
              {product.name}
            </p>
          </div>
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
            onClick={() => onToggleActive(product.id, product.active)}
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
            onClick={() => onEdit(product)}
            variant="outline"
            className="border-gros-red text-gros-red hover:bg-gros-red/10 bg-transparent"
            style={{ borderColor: "var(--gros-red)", color: "var(--gros-red)" }}
          >
            Editar
          </Button>
          <Button
            onClick={() => onDelete(product.id)}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
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

  const [carouselImages, setCarouselImages] = useState<any[]>([])

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    description: "",
    price: 0,
    image_url: "",
    images: [] as string[],
    image_positions: [] as Array<{ x: number; y: number; scale: number }>,
    sizes: [] as string[],
    fabrics: {} as Record<string, number>,
    lead_time: "7-10 días",
    active: true,
    club_ids: [] as number[],
  })
  const [editingProduct, setEditingProduct] = useState<number | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)

  // Temporary input states for sizes and fabrics
  const [sizesInput, setSizesInput] = useState("")
  const [fabricEntries, setFabricEntries] = useState<Array<{ name: string; price: string }>>([
    { name: "", price: "" },
  ])

  const [newCarouselImage, setNewCarouselImage] = useState({
    title: "",
    description: "",
    image_url: "",
    cta_text: "",
    cta_link: "",
  })
  const [editingCarouselImage, setEditingCarouselImage] = useState<number | null>(null)
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false)

  const [categories, setCategories] = useState<any[]>([])
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image_url: "",
    order_index: 0,
  })
  const [editingCategory, setEditingCategory] = useState<number | null>(null)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)

  const [clubs, setClubs] = useState<any[]>([])
  const [newClub, setNewClub] = useState({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    order_index: 0,
    background_type: "color",
    background_value: "#1a1a1a",
    background_image_url: "",
  })
  const [editingClub, setEditingClub] = useState<number | null>(null)
  const [isClubModalOpen, setIsClubModalOpen] = useState(false)
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
      loadCarouselImages()
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

  const loadCarouselImages = async () => {
    try {
      const response = await fetch("/api/carousel")
      const data = await response.json()
      if (data.carouselImages) {
        setCarouselImages(data.carouselImages)
      }
    } catch (error) {
      console.error("Error loading carousel images:", error)
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
      // Separate club_ids from product data
      const { club_ids, ...productData } = newProduct

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear producto")
      }

      // Now associate the product with the selected clubs
      if (club_ids.length > 0 && data.product?.id) {
        for (const clubId of club_ids) {
          try {
            await fetch(`/api/clubs/${clubId}/products`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ product_ids: [data.product.id] }),
            })
          } catch (clubError) {
            console.error(`Error associating product with club ${clubId}:`, clubError)
          }
        }
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
        images: [],
        image_positions: [],
        sizes: [],
        fabrics: {},
        lead_time: "7-10 días",
        active: true,
        club_ids: [],
      })
      setSizesInput("")
      setFabricEntries([{ name: "", price: "" }])
      setIsProductModalOpen(false)
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
      // Separate club_ids from product data
      const { club_ids, ...productData } = newProduct

      const response = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar producto")
      }

      // Update club associations
      // First, get current clubs for this product
      const currentClubsResponse = await fetch(`/api/products/${id}/clubs`)
      const currentClubsData = await currentClubsResponse.json()
      const currentClubIds = currentClubsData.clubs?.map((c: any) => c.id) || []

      // Find clubs to remove
      const toRemove = currentClubIds.filter((clubId: number) => !club_ids.includes(clubId))
      // Find clubs to add
      const toAdd = club_ids.filter((clubId: number) => !currentClubIds.includes(clubId))

      // Remove from clubs
      for (const clubId of toRemove) {
        try {
          await fetch(`/api/clubs/${clubId}/products?product_id=${id}`, {
            method: "DELETE",
          })
        } catch (clubError) {
          console.error(`Error removing product from club ${clubId}:`, clubError)
        }
      }

      // Add to clubs
      for (const clubId of toAdd) {
        try {
          await fetch(`/api/clubs/${clubId}/products`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_ids: [id] }),
          })
        } catch (clubError) {
          console.error(`Error adding product to club ${clubId}:`, clubError)
        }
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
        images: [],
        image_positions: [],
        sizes: [],
        fabrics: {},
        lead_time: "7-10 días",
        active: true,
        club_ids: [],
      })
      setSizesInput("")
      setFabricEntries([{ name: "", price: "" }])
      setEditingProduct(null)
      setIsProductModalOpen(false)
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
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Producto",
      message: "¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.",
      onConfirm: async () => {
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
      },
    })
  }

  const startEditProduct = async (product: any) => {
    setEditingProduct(product.id)

    // Load clubs associated with this product
    let productClubIds: number[] = []
    try {
      const clubsResponse = await fetch(`/api/products/${product.id}/clubs`)
      const clubsData = await clubsResponse.json()
      if (clubsData.clubs) {
        productClubIds = clubsData.clubs.map((c: any) => c.id)
      }
    } catch (error) {
      console.error("Error loading product clubs:", error)
    }

    setNewProduct({
      name: product.name,
      category: product.category,
      description: product.description || "",
      price: product.price,
      image_url: product.image_url || "",
      images: product.images || (product.image_url ? [product.image_url] : []),
      image_positions: product.image_positions || [],
      sizes: product.sizes || [],
      fabrics: product.fabrics || {},
      lead_time: product.lead_time || "7-10 días",
      active: product.active !== undefined ? product.active : true,
      club_ids: productClubIds,
    })
    // Populate input fields for editing
    setSizesInput(Array.isArray(product.sizes) ? product.sizes.join(", ") : "")

    // Convert fabrics object to array of entries for editing
    const fabricsObj = product.fabrics || {}
    if (Object.keys(fabricsObj).length > 0) {
      setFabricEntries(
        Object.entries(fabricsObj).map(([name, price]) => ({
          name,
          price: String(price),
        }))
      )
    } else {
      setFabricEntries([{ name: "", price: "" }])
    }
    setIsProductModalOpen(true)
  }

  const cancelEditProduct = () => {
    setEditingProduct(null)
    setNewProduct({
      name: "",
      category: "",
      description: "",
      price: 0,
      image_url: "",
      images: [],
      image_positions: [],
      sizes: [],
      fabrics: {},
      lead_time: "7-10 días",
      active: true,
      club_ids: [],
    })
    setSizesInput("")
    setFabricEntries([{ name: "", price: "" }])
    setIsProductModalOpen(false)
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

  const addCarouselImage = async () => {
    if (!newCarouselImage.title || !newCarouselImage.image_url) {
      setAlertModal({
        isOpen: true,
        message: "Por favor completa título e imagen",
        type: "error",
      })
      return
    }

    try {
      const response = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCarouselImage,
          order_index: carouselImages.length,
          active: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al crear imagen del carrusel")
      }

      setAlertModal({
        isOpen: true,
        message: "Imagen del carrusel creada exitosamente",
        type: "success",
      })
      setNewCarouselImage({
        title: "",
        description: "",
        image_url: "",
        cta_text: "",
        cta_link: "",
      })
      setIsCarouselModalOpen(false)
      loadCarouselImages()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al crear imagen del carrusel",
        type: "error",
      })
    }
  }

  const updateCarouselImage = async (id: number) => {
    if (!newCarouselImage.title || !newCarouselImage.image_url) {
      setAlertModal({
        isOpen: true,
        message: "Por favor completa título e imagen",
        type: "error",
      })
      return
    }

    try {
      const response = await fetch(`/api/carousel/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCarouselImage),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar imagen del carrusel")
      }

      setAlertModal({
        isOpen: true,
        message: "Imagen del carrusel actualizada exitosamente",
        type: "success",
      })
      setNewCarouselImage({
        title: "",
        description: "",
        image_url: "",
        cta_text: "",
        cta_link: "",
      })
      setEditingCarouselImage(null)
      setIsCarouselModalOpen(false)
      loadCarouselImages()
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al actualizar imagen del carrusel",
        type: "error",
      })
    }
  }

  const startEditCarouselImage = (image: any) => {
    setEditingCarouselImage(image.id)
    setNewCarouselImage({
      title: image.title,
      description: image.description || "",
      image_url: image.image_url || "",
      cta_text: image.cta_text || "",
      cta_link: image.cta_link || "",
    })
    setIsCarouselModalOpen(true)
  }

  const cancelEditCarouselImage = () => {
    setEditingCarouselImage(null)
    setNewCarouselImage({
      title: "",
      description: "",
      image_url: "",
      cta_text: "",
      cta_link: "",
    })
    setIsCarouselModalOpen(false)
  }

  const deleteCarouselImage = async (imageId: number) => {
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Imagen",
      message: "¿Estás seguro de que deseas eliminar esta imagen del carrusel? Esta acción no se puede deshacer.",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/carousel/${imageId}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || "Error al eliminar imagen del carrusel")
          }

          setAlertModal({
            isOpen: true,
            message: "Imagen del carrusel eliminada exitosamente",
            type: "success",
          })
          loadCarouselImages()
        } catch (error) {
          setAlertModal({
            isOpen: true,
            message: error instanceof Error ? error.message : "Error al eliminar imagen del carrusel",
            type: "error",
          })
        }
      },
    })
  }

  const updateCarouselOrder = async (imageId: number, direction: "up" | "down") => {
    const index = carouselImages.findIndex((img) => img.id === imageId)
    if (direction === "up" && index > 0) {
      const newOrder = carouselImages[index - 1].order_index
      await fetch(`/api/carousel/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: newOrder }),
      })
      await fetch(`/api/carousel/${carouselImages[index - 1].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: carouselImages[index].order_index }),
      })
      loadCarouselImages()
    } else if (direction === "down" && index < carouselImages.length - 1) {
      const newOrder = carouselImages[index + 1].order_index
      await fetch(`/api/carousel/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: newOrder }),
      })
      await fetch(`/api/carousel/${carouselImages[index + 1].id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_index: carouselImages[index].order_index }),
      })
      loadCarouselImages()
    }
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
      setIsCategoryModalOpen(false)
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
      setIsCategoryModalOpen(false)
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
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Categoría",
      message: "¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer.",
      onConfirm: async () => {
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
      },
    })
  }

  const startEditCategory = (category: any) => {
    setEditingCategory(category.id)
    setNewCategory({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url || "",
      order_index: category.order_index || 0,
    })
    setIsCategoryModalOpen(true)
  }

  const cancelEditCategory = () => {
    setEditingCategory(null)
    setNewCategory({ name: "", description: "", image_url: "", order_index: 0 })
    setIsCategoryModalOpen(false)
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
      // Generate slug from name if slug is empty
      const clubData = {
        ...newClub,
        slug: newClub.slug || newClub.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      }

      const response = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clubData),
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
      setIsClubModalOpen(false)
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
      // Generate slug from name if slug is empty
      const clubData = {
        ...newClub,
        slug: newClub.slug || newClub.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      }

      const response = await fetch(`/api/clubs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clubData),
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
      setIsClubModalOpen(false)
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
    setConfirmDialog({
      isOpen: true,
      title: "Eliminar Club",
      message: "¿Estás seguro de que deseas eliminar este club? Esta acción no se puede deshacer.",
      onConfirm: async () => {
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
      },
    })
  }

  const startEditClub = (club: any) => {
    setEditingClub(club.id)
    setNewClub({
      name: club.name,
      slug: club.slug || "",
      description: club.description || "",
      logo_url: club.logo_url || "",
      order_index: club.order_index || 0,
      background_type: club.background_type || "color",
      background_value: club.background_value || "#1a1a1a",
      background_image_url: club.background_image_url || "",
    })
    setIsClubModalOpen(true)
  }

  const cancelEditClub = () => {
    setEditingClub(null)
    setNewClub({
      name: "",
      slug: "",
      description: "",
      logo_url: "",
      order_index: 0,
      background_type: "color",
      background_value: "#1a1a1a",
      background_image_url: "",
    })
    setIsClubModalOpen(false)
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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = products.findIndex((p) => p.id === active.id)
    const newIndex = products.findIndex((p) => p.id === over.id)

    // Optimistically update the UI
    const newProducts = arrayMove(products, oldIndex, newIndex)
    setProducts(newProducts)

    // Update order_index for all affected products
    const productOrders = newProducts.map((product, index) => ({
      id: product.id,
      order_index: index,
    }))

    try {
      const response = await fetch("/api/products/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productOrders }),
      })

      if (!response.ok) {
        throw new Error("Error al reordenar productos")
      }

      setAlertModal({
        isOpen: true,
        message: "Productos reordenados exitosamente",
        type: "success",
      })
    } catch (error) {
      // Revert the optimistic update on error
      loadProducts()
      setAlertModal({
        isOpen: true,
        message: error instanceof Error ? error.message : "Error al reordenar productos",
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
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "var(--gros-black)" }}>
                  Productos ({products.length})
                </h2>
                <Button
                  onClick={() => setIsProductModalOpen(true)}
                  className="hover:opacity-90 font-bold"
                  style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nuevo Producto
                </Button>
              </div>

              {products.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">No hay productos registrados</p>
                </Card>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {products.map((product) => (
                        <SortableProductCard
                          key={product.id}
                          product={product}
                          onEdit={startEditProduct}
                          onDelete={deleteProduct}
                          onToggleActive={toggleProductActive}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          )}

          {activeTab === "categories" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "var(--gros-black)" }}>
                  Categorías ({categories.length})
                </h2>
                <Button
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="hover:opacity-90 font-bold"
                  style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nueva Categoría
                </Button>
              </div>

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
          )}

          {activeTab === "clubs" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "var(--gros-black)" }}>
                  Clubes ({clubs.length})
                </h2>
                <Button
                  onClick={() => setIsClubModalOpen(true)}
                  className="hover:opacity-90 font-bold"
                  style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nuevo Club
                </Button>
              </div>

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
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold" style={{ color: "var(--gros-black)" }}>
                  Imágenes del Carrusel ({carouselImages.length})
                </h2>
                <Button
                  onClick={() => setIsCarouselModalOpen(true)}
                  className="hover:opacity-90 font-bold"
                  style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nueva Imagen
                </Button>
              </div>

              <div className="space-y-4">
                {carouselImages.map((image, idx) => (
                  <Card key={image.id} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                      <div>
                        <p className="text-xs text-gray-500 font-bold">TÍTULO</p>
                        <p className="font-bold" style={{ color: "var(--gros-black)" }}>
                          {image.title}
                        </p>
                        {image.description && <p className="text-sm text-gray-600 mt-1">{image.description}</p>}
                        {image.cta_text && (
                          <p className="text-xs text-gray-500 mt-1">
                            CTA: {image.cta_text} → {image.cta_link}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-1">
                        <img
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.title}
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-bold">ORDEN</p>
                        <p className="font-bold" style={{ color: "var(--gros-red)" }}>
                          {image.order_index}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <div className="flex gap-1">
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
                          size="sm"
                          onClick={() => startEditCarouselImage(image)}
                          variant="outline"
                          className="border-gros-red text-gros-red hover:bg-gros-red/10 bg-transparent"
                          style={{ borderColor: "var(--gros-red)", color: "var(--gros-red)" }}
                        >
                          Editar
                        </Button>
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
          )}
        </div>
      </section>

      {/* Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={cancelEditProduct}
        title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
        size="xl"
      >
        <div className="space-y-4">
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
              <ImagePositionEditor
                label="Imágenes del Producto"
                value={newProduct.images}
                positions={newProduct.image_positions}
                onChange={(urls, positions) =>
                  setNewProduct({
                    ...newProduct,
                    images: urls,
                    image_positions: positions,
                    image_url: urls[0] || ""
                  })
                }
                maxImages={5}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
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
                Tipos de Tela y Precios
              </label>
              <div className="space-y-2">
                {fabricEntries.map((entry, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={entry.name}
                      onChange={(e) => {
                        const newEntries = [...fabricEntries]
                        newEntries[index].name = e.target.value
                        setFabricEntries(newEntries)
                      }}
                      onBlur={() => {
                        const fabricsObj: Record<string, number> = {}
                        fabricEntries.forEach((entry) => {
                          if (entry.name.trim() && entry.price.trim()) {
                            fabricsObj[entry.name.trim()] = Number.parseFloat(entry.price) || 0
                          }
                        })
                        setNewProduct({ ...newProduct, fabrics: fabricsObj })
                      }}
                      placeholder="Nombre (ej: Algodón)"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={entry.price}
                      onChange={(e) => {
                        const newEntries = [...fabricEntries]
                        newEntries[index].price = e.target.value
                        setFabricEntries(newEntries)
                      }}
                      onBlur={() => {
                        const fabricsObj: Record<string, number> = {}
                        fabricEntries.forEach((entry) => {
                          if (entry.name.trim() && entry.price.trim()) {
                            fabricsObj[entry.name.trim()] = Number.parseFloat(entry.price) || 0
                          }
                        })
                        setNewProduct({ ...newProduct, fabrics: fabricsObj })
                      }}
                      placeholder="Precio"
                      className="w-32"
                    />
                    {fabricEntries.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newEntries = fabricEntries.filter((_, i) => i !== index)
                          setFabricEntries(newEntries)
                          const fabricsObj: Record<string, number> = {}
                          newEntries.forEach((entry) => {
                            if (entry.name.trim() && entry.price.trim()) {
                              fabricsObj[entry.name.trim()] = Number.parseFloat(entry.price) || 0
                            }
                          })
                          setNewProduct({ ...newProduct, fabrics: fabricsObj })
                        }}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFabricEntries([...fabricEntries, { name: "", price: "" }])}
                  className="w-full"
                >
                  + Agregar Tipo de Tela
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {Object.keys(newProduct.fabrics).length > 0
                  ? `${Object.keys(newProduct.fabrics).length} tipo(s) de tela configurado(s)`
                  : "Agrega tipos de tela con sus respectivos precios"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                Clubes (Opcional)
              </label>
              <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-2">
                {clubs.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay clubes disponibles</p>
                ) : (
                  clubs.map((club) => (
                    <label key={club.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newProduct.club_ids.includes(club.id)}
                        onChange={(e) => {
                          const clubIds = e.target.checked
                            ? [...newProduct.club_ids, club.id]
                            : newProduct.club_ids.filter((id) => id !== club.id)
                          setNewProduct({ ...newProduct, club_ids: clubIds })
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{club.name}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {newProduct.club_ids.length > 0
                  ? `${newProduct.club_ids.length} club(es) seleccionado(s)`
                  : "Selecciona los clubes donde este producto estará disponible"}
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
          <div className="flex gap-2 pt-4">
            <Button
              onClick={editingProduct ? () => updateProduct(editingProduct) : addProduct}
              className="hover:opacity-90 font-bold"
              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
            >
              {editingProduct ? "Actualizar Producto" : "Crear Producto"}
            </Button>
            <Button onClick={cancelEditProduct} variant="outline" className="font-bold">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={cancelEditCategory}
        title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}
        size="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                Nombre *
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
          <div className="flex gap-2 pt-4">
            <Button
              onClick={editingCategory ? () => updateCategory(editingCategory) : addCategory}
              className="hover:opacity-90 font-bold"
              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
            >
              {editingCategory ? "Actualizar Categoría" : "Crear Categoría"}
            </Button>
            <Button onClick={cancelEditCategory} variant="outline" className="font-bold">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Club Modal */}
      <Modal
        isOpen={isClubModalOpen}
        onClose={cancelEditClub}
        title={editingClub ? "Editar Club" : "Nuevo Club"}
        size="md"
      >
        <div className="space-y-4">
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
                Slug (Opcional)
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

          {/* Background Customization */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-sm font-bold mb-4" style={{ color: "var(--gros-black)" }}>
              Personalización de Fondo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                  Tipo de Fondo
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setNewClub({ ...newClub, background_type: "color" })}
                    variant={newClub.background_type === "color" ? "default" : "outline"}
                    className={newClub.background_type === "color" ? "font-bold" : ""}
                    style={newClub.background_type === "color" ? { backgroundColor: "var(--gros-red)", color: "var(--gros-white)" } : {}}
                  >
                    Color
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setNewClub({ ...newClub, background_type: "image" })}
                    variant={newClub.background_type === "image" ? "default" : "outline"}
                    className={newClub.background_type === "image" ? "font-bold" : ""}
                    style={newClub.background_type === "image" ? { backgroundColor: "var(--gros-red)", color: "var(--gros-white)" } : {}}
                  >
                    Imagen
                  </Button>
                </div>
              </div>

              {newClub.background_type === "color" && (
                <div>
                  <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                    Color de Fondo
                  </label>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { name: "Negro Gros", value: "#1a1a1a" },
                      { name: "Rojo Gros", value: "#C43A2F" },
                      { name: "Azul Gros", value: "#2E5C8A" },
                      { name: "Marrón Gros", value: "#6B3E3E" },
                      { name: "Arena Gros", value: "#F5F1E8" },
                    ].map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setNewClub({ ...newClub, background_value: color.value })}
                        className={`p-3 rounded border-2 text-left transition ${
                          newClub.background_value === color.value
                            ? "border-[var(--gros-red)] ring-2 ring-[var(--gros-red)]/20"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color.value }}
                          />
                          <span className="text-xs font-bold">{color.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-gray-600">
                      O ingresa un color personalizado (hex):
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={newClub.background_value}
                        onChange={(e) => setNewClub({ ...newClub, background_value: e.target.value })}
                        placeholder="#1a1a1a"
                        className="flex-1"
                      />
                      <input
                        type="color"
                        value={newClub.background_value}
                        onChange={(e) => setNewClub({ ...newClub, background_value: e.target.value })}
                        className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {newClub.background_type === "image" && (
                <div>
                  <ImageUpload
                    label="Imagen de Fondo"
                    value={newClub.background_image_url}
                    onChange={(url) => setNewClub({ ...newClub, background_image_url: url })}
                    onRemove={() => setNewClub({ ...newClub, background_image_url: "" })}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    La imagen se mostrará con una superposición oscura para mantener la legibilidad del texto.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={editingClub ? () => updateClub(editingClub) : addClub}
              className="hover:opacity-90 font-bold"
              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
            >
              {editingClub ? "Actualizar Club" : "Crear Club"}
            </Button>
            <Button onClick={cancelEditClub} variant="outline" className="font-bold">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Carousel Modal */}
      <Modal
        isOpen={isCarouselModalOpen}
        onClose={cancelEditCarouselImage}
        title={editingCarouselImage ? "Editar Imagen del Carrusel" : "Nueva Imagen del Carrusel"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                Título *
              </label>
              <Input
                value={newCarouselImage.title}
                onChange={(e) => setNewCarouselImage({ ...newCarouselImage, title: e.target.value })}
                placeholder="Título del slide"
              />
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
          </div>
          <div>
            <ImageUpload
              label="Imagen del Carrusel *"
              value={newCarouselImage.image_url}
              onChange={(url) => setNewCarouselImage({ ...newCarouselImage, image_url: url })}
              onRemove={() => setNewCarouselImage({ ...newCarouselImage, image_url: "" })}
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
          <div className="flex gap-2 pt-4">
            <Button
              onClick={editingCarouselImage ? () => updateCarouselImage(editingCarouselImage) : addCarouselImage}
              className="hover:opacity-90 font-bold"
              style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
            >
              {editingCarouselImage ? "Actualizar Imagen" : "Crear Imagen"}
            </Button>
            <Button onClick={cancelEditCarouselImage} variant="outline" className="font-bold">
              Cancelar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        message={alertModal.message}
        type={alertModal.type}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  )
}
