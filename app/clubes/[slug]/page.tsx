"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Club {
  id: number
  name: string
  slug: string
  description: string
  logo_url: string
  active: boolean
  background_type?: string
  background_value?: string
  background_image_url?: string
}

interface Product {
  id: number
  name: string
  category: string
  description: string
  price: number
  image_url: string
  sizes: string[]
  colors: string[]
  active: boolean
  lead_time: string
}

export default function ClubPage() {
  const params = useParams()
  const slug = params.slug as string

  const [club, setClub] = useState<Club | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")

  useEffect(() => {
    loadClubData()
  }, [slug])

  const loadClubData = async () => {
    try {
      setLoading(true)

      // Load all clubs to find the one with this slug
      const clubsResponse = await fetch("/api/clubs")
      const clubsData = await clubsResponse.json()
      const foundClub = clubsData.clubs?.find((c: Club) => c.slug === slug)

      if (!foundClub) {
        setLoading(false)
        return
      }

      setClub(foundClub)

      // Load products for this club
      const productsResponse = await fetch(`/api/clubs/${foundClub.id}/products`)
      const productsData = await productsResponse.json()

      if (productsData.products) {
        // Filter only active products for public view
        setProducts(productsData.products.filter((p: Product) => p.active))
      }
    } catch (error) {
      console.error("Error loading club data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories from products
  const categories = Array.from(new Set(products.map((p) => p.category)))

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-4xl font-bold font-serif mb-4" style={{ color: "var(--gros-black)" }}>
            Club no encontrado
          </h1>
          <p className="text-gray-600 mb-8">El club que buscas no existe o no está disponible.</p>
          <Link
            href="/clubes"
            className="px-6 py-3 font-bold hover:opacity-90 transition"
            style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
          >
            Ver todos los clubes
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section
        className="py-16 px-4 md:px-8 relative overflow-hidden"
        style={{
          backgroundColor: club.background_type === "color" ? (club.background_value || "var(--gros-black)") : "var(--gros-black)",
        }}
      >
        {/* Background Image with Overlay */}
        {club.background_type === "image" && club.background_image_url && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${club.background_image_url})`,
              }}
            />
            <div className="absolute inset-0 bg-black/60" />
          </>
        )}

        <div className="max-w-7xl mx-auto text-center relative z-10">
          {club.logo_url && (
            <div className="mb-6 flex justify-center">
              <img
                src={club.logo_url}
                alt={club.name}
                className="h-32 w-32 object-contain rounded-full bg-white p-4"
              />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4" style={{ color: "var(--gros-white)" }}>
            {club.name}
          </h1>
          {club.description && (
            <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: "var(--gros-white)", opacity: 0.9 }}>
              {club.description}
            </p>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`px-4 py-2 rounded font-bold transition ${
                    !selectedCategory
                      ? "text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  style={
                    !selectedCategory
                      ? { backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }
                      : {}
                  }
                >
                  Todos
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded font-bold transition ${
                      selectedCategory === category
                        ? "text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    style={
                      selectedCategory === category
                        ? { backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }
                        : {}
                    }
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                {products.length === 0
                  ? "Este club aún no tiene productos asignados."
                  : "No se encontraron productos que coincidan con tu búsqueda."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={(product.images && product.images[0]) || product.image_url || "/placeholder.svg"}
                  category={product.category}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
