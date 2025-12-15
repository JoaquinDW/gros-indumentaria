"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { Navbar } from "@/components/navbar"

export default function ClubPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      if (data.products) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      if (data.categories) {
        setCategories(data.categories.filter((cat: any) => cat.active))
      }
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div style={{ backgroundColor: "var(--gros-white)" }} className="min-h-screen">
      <Navbar />

      {/* Header */}
      <header className="text-white py-8 px-4 md:px-8" style={{ backgroundColor: "var(--gros-red)" }}>
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="text-sm mb-4 inline-block hover:opacity-90" style={{ color: "#f0f0f0" }}>
            ← Volver al inicio
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold font-serif">Catálogo de Clubes</h1>
          <p className="text-lg mt-2" style={{ color: "#f0f0f0" }}>
            Prendas personalizables para tu club
          </p>
        </div>
      </header>

      {/* Search and Filters */}
      <section
        className="border-b sticky top-0 z-40 py-6 px-4 md:px-8"
        style={{ backgroundColor: "var(--gros-white)" }}
      >
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "" ? "default" : "outline"}
              onClick={() => setSelectedCategory("")}
              style={selectedCategory === "" ? { backgroundColor: "var(--gros-red)", color: "var(--gros-white)" } : {}}
              className="hover:opacity-90"
            >
              Todos
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.name ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.name)}
                style={
                  selectedCategory === category.name
                    ? { backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }
                    : {}
                }
                className="hover:opacity-90"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: "#666666" }}>
                Cargando productos...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: "#666666" }}>
                {products.length === 0
                  ? "No hay productos disponibles en este momento"
                  : "No hay productos que coincidan con tu búsqueda"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`}>
                  <Card
                    className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                    style={{ backgroundColor: "var(--gros-white)" }}
                  >
                    <div className="relative overflow-hidden" style={{ backgroundColor: "var(--gros-sand)" }}>
                      <img
                        src={product.image_url || "/placeholder.svg?height=256&width=256&query=product"}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div
                        className="absolute top-4 right-0 text-white px-4 py-2 transform rotate-45 origin-right translate-x-12 text-sm font-bold"
                        style={{ backgroundColor: "var(--gros-red)" }}
                      >
                        PERSONALIZADO
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-xs font-bold uppercase mb-2" style={{ color: "var(--gros-blue)" }}>
                        {product.category}
                      </p>
                      <h3 className="text-lg font-bold mb-2" style={{ color: "var(--gros-black)" }}>
                        {product.name}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: "#666666" }}>
                        {product.description || "Producto personalizable de alta calidad"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold" style={{ color: "var(--gros-red)" }}>
                          ${product.price}
                        </span>
                        <Button
                          size="sm"
                          style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                          className="hover:opacity-90"
                        >
                          Ver Detalle
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-white py-8 px-4 md:px-8" style={{ backgroundColor: "var(--gros-black)" }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2">Gros Indumentaria © 2025</p>
          <p style={{ color: "#999999" }}>Prendas Personalizadas de Calidad</p>
        </div>
      </footer>
    </div>
  )
}
