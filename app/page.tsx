"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Carousel } from "@/components/carousel"
import { ClientsSection } from "@/components/clients-section"
import { ScrollProgress } from "@/components/scroll-progress"
import { ScrollReveal } from "@/components/scroll-reveal"
import { MagneticButton, AnimatedButton } from "@/components/magnetic-button"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { staggerContainer, fadeInUp, scaleIn } from "@/lib/animations"
import { Sparkles, Zap, Scissors } from "lucide-react"
import { TiltCard } from "@/components/tilt-card"
import { GrosBackgroundPattern } from "@/components/gros-background-pattern"

export default function Home() {
  const [products, setProducts] = useState<any[]>([])
  const [carouselSlides, setCarouselSlides] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
    loadCarouselImages()
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

  const loadCarouselImages = async () => {
    try {
      const response = await fetch("/api/carousel")
      const data = await response.json()
      if (data.carouselImages && data.carouselImages.length > 0) {
        setCarouselSlides(data.carouselImages)
      } else {
        // Fallback to default slides if no carousel images in database
        setCarouselSlides([
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
        ])
      }
    } catch (error) {
      console.error("Error loading carousel images:", error)
      // Fallback to default slides on error
      setCarouselSlides([
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
      ])
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--gros-white)" }}
    >
      <ScrollProgress />
      <Navbar />

      <Carousel slides={carouselSlides} />

      {/* Featured Products Section */}
      <section
        className="py-20 px-4 md:px-8 overflow-hidden relative"
        style={{ backgroundColor: "var(--gros-white)" }}
      >
        {/* Patrón de fondo inspirado en el logo de Gros */}
        <GrosBackgroundPattern opacity={0.35} variant="mixed" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold font-serif mb-4"
                style={{ color: "var(--gros-black)" }}
              >
                Nuestros Productos
              </motion.h2>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: 96 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-1 mx-auto"
                style={{ backgroundColor: "var(--gros-red)" }}
              />
            </div>
          </ScrollReveal>

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
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {products.map((product) => (
                <motion.div key={product.id} variants={fadeInUp}>
                  <Link href={`/producto/${product.id}`}>
                    <TiltCard className="h-full">
                      <Card
                        className="h-full overflow-hidden cursor-pointer group relative"
                        style={{ backgroundColor: "var(--gros-white)" }}
                      >
                        {/* Shimmer effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none z-10" />

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <div
                            className="relative overflow-hidden"
                            style={{ backgroundColor: "var(--gros-sand)" }}
                          >
                            <motion.img
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.4 }}
                              src={
                                product.image_url ||
                                "/placeholder.svg?height=256&width=256&query=product"
                              }
                              alt={product.name}
                              className="w-full h-64 object-cover"
                            />
                            {/* Red diagonal banner with shimmer */}
                            <div
                              className="absolute top-4 right-0 text-white px-4 py-2 transform rotate-45 origin-right translate-x-12 text-sm font-bold overflow-hidden"
                              style={{ backgroundColor: "var(--gros-red)" }}
                            >
                              <span className="relative z-10">PERSONALIZADO</span>
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{
                                  x: ["-200%", "200%"],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 1,
                                }}
                              />
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
                              <motion.span
                                whileHover={{ scale: 1.1 }}
                                className="text-2xl font-bold"
                                style={{ color: "var(--gros-red)" }}
                              >
                                ${product.price}
                              </motion.span>
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
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
                              </motion.div>
                            </div>
                          </div>
                        </motion.div>
                      </Card>
                    </TiltCard>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Ver más productos button */}
          {!loading && products.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-12"
            >
              <Link href="/clubes">
                <MagneticButton
                  size="lg"
                  glow={true}
                  magneticStrength={0.4}
                  className="bg-[var(--gros-red)] text-white hover:bg-[var(--gros-maroon)] font-bold text-lg px-8 py-6 shadow-lg"
                >
                  Ver Más Productos
                </MagneticButton>
              </Link>
            </motion.div>
          )}
        </div>
      </section>

      {/* Clients Section */}
      <ClientsSection />

      {/* Services Section */}
      <section
        className="py-20 px-4 md:px-8 overflow-hidden relative"
        style={{ backgroundColor: "var(--gros-sand)" }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              y: [0, -30, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-10 right-10 w-32 h-32 rounded-full bg-gradient-to-br from-[var(--gros-red)]/10 to-transparent blur-3xl"
          />
          <motion.div
            animate={{
              y: [0, 30, 0],
              rotate: [0, -5, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-gradient-to-br from-[var(--gros-blue)]/10 to-transparent blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl font-bold font-serif mb-16 text-center"
              style={{ color: "var(--gros-black)" }}
            >
              Nuestros Servicios
            </motion.h2>
          </ScrollReveal>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                title: "Gráfica Textil",
                description:
                  "Impresión de alta calidad en cualquier tipo de prenda con colores vibrantes y duraderos.",
                icon: Sparkles,
                color: "var(--gros-red)",
              },
              {
                title: "Sublimación",
                description:
                  "Técnica avanzada para diseños complejos con integración total en las fibras del tejido.",
                icon: Zap,
                color: "var(--gros-blue)",
              },
              {
                title: "Confección",
                description:
                  "Elaboración de prendas personalizadas con costura profesional y acabados de calidad.",
                icon: Scissors,
                color: "var(--gros-maroon)",
              },
            ].map((service, idx) => {
              const Icon = service.icon
              return (
                <motion.div key={idx} variants={fadeInUp}>
                  <motion.div
                    whileHover={{
                      y: -10,
                      scale: 1.02,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-white/20 h-full relative overflow-hidden group"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
                    }}
                  >
                    {/* Glow effect on hover */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                      style={{
                        background: `radial-gradient(circle at 50% 50%, ${service.color}20, transparent 70%)`,
                      }}
                    />

                    {/* Animated icon */}
                    <motion.div
                      whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                      style={{
                        backgroundColor: `${service.color}20`,
                      }}
                    >
                      <Icon className="w-8 h-8" style={{ color: service.color }} />
                    </motion.div>

                    <h3
                      className="text-2xl font-bold mb-4 font-serif"
                      style={{ color: service.color }}
                    >
                      {service.title}
                    </h3>
                    <p style={{ color: "#666666" }}>{service.description}</p>

                    {/* Decorative corner element */}
                    <div
                      className="absolute top-0 right-0 w-20 h-20 rounded-bl-full opacity-10"
                      style={{ backgroundColor: service.color }}
                    />
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 px-4 md:px-8 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, var(--gros-red) 0%, var(--gros-maroon) 100%)",
        }}
      >
        {/* Animated gradient background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            backgroundImage:
              "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)",
            backgroundSize: "200% 200%",
          }}
        />

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl md:text-5xl font-bold font-serif mb-6"
            >
              ¿Sos un Club? ¡Hablemos!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
            >
              Ofertas especiales para pedidos al por mayor y paquetes
              personalizados para tu club.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/contacto">
                <MagneticButton
                  size="lg"
                  glow={true}
                  magneticStrength={0.5}
                  className="bg-white text-[var(--gros-red)] font-bold hover:bg-white/90 text-lg px-8 py-6 shadow-2xl"
                >
                  Solicitar Presupuesto
                </MagneticButton>
              </Link>
            </motion.div>
          </ScrollReveal>

          {/* Decorative elements */}
          <motion.div
            className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          />
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12 px-4 md:px-8 text-white"
        style={{ backgroundColor: "var(--gros-black)" }}
      >
        <ScrollReveal>
          <div className="max-w-7xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-2 text-lg"
            >
              Gros Indumentaria © 2025
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-4"
              style={{ color: "#999999" }}
            >
              Prendas Personalizadas de Calidad
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a
                href="https://linktr.ee/deweertstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block group"
              >
                <motion.p
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="text-sm"
                  style={{ color: "#666666" }}
                >
                  Desarrollado por{" "}
                  <span
                    className="font-semibold transition-colors duration-300 group-hover:text-[var(--gros-red)]"
                    style={{ color: "#999999" }}
                  >
                    De Weert Studio
                  </span>
                </motion.p>
              </a>
            </motion.div>
          </div>
        </ScrollReveal>
      </footer>
    </div>
  )
}
