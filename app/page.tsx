"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Carousel } from "@/components/carousel"
import { ClientsSection } from "@/components/clients-section"

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      if (data.products) {
        // Limit to 4 featured products for the home page
        setProducts(data.products.slice(0, 4))
      }
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const carouselSlides = [
    {
      id: 1,
      title: "Prendas Personalizadas",
      description:
        "Gráfica textil, sublimación y confección para clubes y particulares",
      image_url: "/remera-deportiva-personalizada.jpg",
      cta_text: "Ver Catálogo",
      cta_link: "/clubes",
    },
    {
      id: 2,
      title: "Diseños Únicos",
      description: "Personaliza tus prendas con los mejores acabados",
      image_url: "/buzo-deportivo-personalizado.jpg",
      cta_text: "Explorar",
      cta_link: "/clubes",
    },
  ]

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--gros-white)" }}
    >
      <Navbar />

      <Carousel slides={carouselSlides} />

      {/* Featured Products Section */}
      <section
        className="py-20 px-4 md:px-8"
        style={{ backgroundColor: "var(--gros-white)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold font-serif mb-4"
              style={{ color: "var(--gros-black)" }}
            >
              Nuestros Productos
            </h2>
            <div
              className="h-1 w-24 mx-auto"
              style={{ backgroundColor: "var(--gros-red)" }}
            ></div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No hay productos disponibles en este momento</p>
              <Link href="/clubes">
                <Button
                  style={{
                    backgroundColor: "var(--gros-red)",
                    color: "var(--gros-white)",
                  }}
                  className="hover:opacity-90"
                >
                  Ver Catálogo Completo
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} href={`/producto/${product.id}`}>
                  <Card
                    className="h-full overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
                    style={{ backgroundColor: "var(--gros-white)" }}
                  >
                    <div
                      className="relative overflow-hidden"
                      style={{ backgroundColor: "var(--gros-sand)" }}
                    >
                      <img
                        src={
                          product.image_url ||
                          "/placeholder.svg?height=256&width=256&query=product"
                        }
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Red diagonal banner */}
                      <div
                        className="absolute top-4 right-0 text-white px-4 py-2 transform rotate-45 origin-right translate-x-12 text-sm font-bold"
                        style={{ backgroundColor: "var(--gros-red)" }}
                      >
                        PERSONALIZADO
                      </div>
                    </div>
                    <div className="p-4">
                      <p
                        className="text-xs font-bold uppercase mb-2"
                        style={{ color: "var(--gros-blue)" }}
                      >
                        {product.category}
                      </p>
                      <h3
                        className="text-lg font-bold mb-3"
                        style={{ color: "var(--gros-black)" }}
                      >
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: "var(--gros-red)" }}
                        >
                          ${product.price}
                        </span>
                        <Button
                          size="sm"
                          style={{
                            backgroundColor: "var(--gros-red)",
                            color: "var(--gros-white)",
                          }}
                          className="hover:opacity-90"
                        >
                          Agregar
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

      {/* Clients Section */}
      <ClientsSection />

      {/* Services Section */}
      <section
        className="py-20 px-4 md:px-8"
        style={{ backgroundColor: "var(--gros-sand)" }}
      >
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-4xl md:text-5xl font-bold font-serif mb-16 text-center"
            style={{ color: "var(--gros-black)" }}
          >
            Nuestros Servicios
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Gráfica Textil",
                description:
                  "Impresión de alta calidad en cualquier tipo de prenda con colores vibrantes y duraderos.",
              },
              {
                title: "Sublimación",
                description:
                  "Técnica avanzada para diseños complejos con integración total en las fibras del tejido.",
              },
              {
                title: "Confección",
                description:
                  "Elaboración de prendas personalizadas con costura profesional y acabados de calidad.",
              },
            ].map((service, idx) => (
              <div
                key={idx}
                className="p-8 rounded-lg shadow-md"
                style={{ backgroundColor: "var(--gros-white)" }}
              >
                <h3
                  className="text-2xl font-bold mb-4 font-serif"
                  style={{ color: "var(--gros-red)" }}
                >
                  {service.title}
                </h3>
                <p style={{ color: "#666666" }}>{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-16 px-4 md:px-8 text-white"
        style={{ backgroundColor: "var(--gros-red)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif mb-6">
            ¿Sos un Club? ¡Hablemos!
          </h2>
          <p className="text-lg mb-8">
            Ofertas especiales para pedidos al por mayor y paquetes
            personalizados para tu club.
          </p>
          <Link href="/contacto">
            <Button
              size="lg"
              style={{
                backgroundColor: "var(--gros-white)",
                color: "var(--gros-red)",
              }}
              className="font-bold hover:opacity-90"
            >
              Solicitar Presupuesto
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-8 px-4 md:px-8 text-white"
        style={{ backgroundColor: "var(--gros-black)" }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2">Gros Indumentaria © 2025</p>
          <p style={{ color: "#999999" }}>Prendas Personalizadas de Calidad</p>
        </div>
      </footer>
    </div>
  )
}
