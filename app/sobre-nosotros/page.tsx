"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { ScrollReveal } from "@/components/scroll-reveal"
import { MagneticButton } from "@/components/magnetic-button"
import {
  fadeInUp,
  staggerContainer,
  scaleIn,
} from "@/lib/animations"
import { Calendar, Percent, Scissors, MapPin, Heart, Clock, Users } from "lucide-react"
import Link from "next/link"

const staticHighlights = [
  {
    icon: Calendar,
    value: "2019",
    label: "Desde",
    description: "Experiencia en el rubro",
  },
  {
    icon: Percent,
    value: "90%",
    label: "Producción textil",
    description: "De nuestra capacidad",
  },
  {
    icon: Scissors,
    value: "100%",
    label: "Confección propia",
    description: "Diseño a terminación",
  },
  {
    icon: MapPin,
    value: "5",
    label: "Provincias",
    description: "Alcance nacional",
  },
]

const valores = [
  {
    icon: Heart,
    title: "Calidad",
    description: "Utilizamos insumos de primera calidad y la mejor tecnología en impresión y sublimación de telas.",
  },
  {
    icon: Clock,
    title: "Cumplimiento",
    description: "Priorizamos el cumplimiento en los tiempos de entrega acordados con nuestros clientes.",
  },
  {
    icon: Users,
    title: "Atención personalizada",
    description: "Garantizamos la satisfacción de nuestros clientes con un trato cercano y personalizado.",
  },
]

export default function SobreNosotrosPage() {
  const [clientCount, setClientCount] = useState<number | null>(null)

  useEffect(() => {
    loadClientCount()
  }, [])

  const loadClientCount = async () => {
    try {
      const response = await fetch("/api/clubs")
      const data = await response.json()
      if (data.clubs) {
        // Count all active clients (both clubs and organizations)
        const activeClients = data.clubs.filter(
          (client: { active: boolean }) => client.active
        ).length
        setClientCount(activeClients)
      }
    } catch (error) {
      console.error("Error loading client count:", error)
    }
  }

  const highlights = [
    ...staticHighlights,
    {
      icon: Users,
      value: clientCount !== null ? `${clientCount}+` : "...",
      label: "Clientes",
      description: "Confían en nosotros",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section
        className="py-20 px-4 md:px-8 relative overflow-hidden"
        style={{ backgroundColor: "var(--gros-sand)" }}
      >
        {/* Decorative circles */}
        <div
          className="absolute top-10 left-10 w-32 h-32 rounded-full opacity-20 blur-2xl"
          style={{ backgroundColor: "var(--gros-red)" }}
        />
        <div
          className="absolute bottom-10 right-10 w-40 h-40 rounded-full opacity-15 blur-3xl"
          style={{ backgroundColor: "var(--gros-blue)" }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6"
              style={{ color: "var(--gros-black)" }}
            >
              Quiénes Somos
            </motion.h1>
            <motion.div
              className="h-1 w-24 mx-auto mb-8"
              style={{ backgroundColor: "var(--gros-red)" }}
              initial={{ width: 0 }}
              animate={{ width: 96 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
            <motion.p
              className="text-lg md:text-xl leading-relaxed"
              style={{ color: "#666666" }}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
            >
              GROS es una PYME del centroeste chaqueño, comprometida con la calidad
              y la satisfacción de nuestros clientes.
            </motion.p>
          </ScrollReveal>
        </div>
      </section>

      {/* Historia Section */}
      <section
        className="py-20 px-4 md:px-8"
        style={{ backgroundColor: "var(--gros-white)" }}
      >
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2
                className="text-3xl md:text-4xl font-serif font-bold mb-4"
                style={{ color: "var(--gros-black)" }}
              >
                Nuestra Historia
              </h2>
              <motion.div
                className="h-1 w-20 mx-auto"
                style={{ backgroundColor: "var(--gros-red)" }}
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </ScrollReveal>

          {/* Timeline */}
          <div className="space-y-12">
            <ScrollReveal>
              <motion.div
                className="flex flex-col md:flex-row gap-6 items-start"
                variants={fadeInUp}
              >
                <div
                  className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: "var(--gros-red)" }}
                >
                  2019
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--gros-black)" }}
                  >
                    Los inicios
                  </h3>
                  <p style={{ color: "#666666" }} className="leading-relaxed">
                    Nacimos como Gráfica de Impresión en Gran Formato en el centroeste chaqueño,
                    ofreciendo soluciones de impresión de alta calidad para empresas y comercios de la región.
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal>
              <motion.div
                className="flex flex-col md:flex-row gap-6 items-start"
                variants={fadeInUp}
              >
                <div
                  className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: "var(--gros-maroon)" }}
                >
                  2021
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--gros-black)" }}
                  >
                    Expansión al mundo textil
                  </h3>
                  <p style={{ color: "#666666" }} className="leading-relaxed">
                    Iniciamos el proyecto Textil dedicándonos a la producción de Indumentaria Deportiva.
                    Hoy esta unidad de negocios comprende el 90% de nuestra producción.
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>

            <ScrollReveal>
              <motion.div
                className="flex flex-col md:flex-row gap-6 items-start"
                variants={fadeInUp}
              >
                <div
                  className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: "var(--gros-blue)" }}
                >
                  Hoy
                </div>
                <div className="flex-1">
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--gros-black)" }}
                  >
                    Alcance nacional
                  </h3>
                  <p style={{ color: "#666666" }} className="leading-relaxed">
                    Clubes, equipos particulares y empresas son ya parte de nuestra familia,
                    la cual ha logrado traspasar las fronteras de la provincia y ya cuenta con
                    miembros en Corrientes, Santa Fe, Buenos Aires y Tierra del Fuego.
                  </p>
                </div>
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section
        className="py-20 px-4 md:px-8"
        style={{ backgroundColor: "var(--gros-sand)" }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {highlights.map((item, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-2xl"
                style={{ backgroundColor: "var(--gros-white)" }}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "var(--gros-red)", color: "white" }}
                >
                  <item.icon className="w-7 h-7" />
                </div>
                <div
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ color: "var(--gros-red)" }}
                >
                  {item.value}
                </div>
                <div
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--gros-black)" }}
                >
                  {item.label}
                </div>
                <div className="text-xs" style={{ color: "#666666" }}>
                  {item.description}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Valores Section */}
      <section
        className="py-20 px-4 md:px-8"
        style={{ backgroundColor: "var(--gros-white)" }}
      >
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2
                className="text-3xl md:text-4xl font-serif font-bold mb-4"
                style={{ color: "var(--gros-black)" }}
              >
                Nuestros Valores
              </h2>
              <motion.div
                className="h-1 w-20 mx-auto mb-6"
                style={{ backgroundColor: "var(--gros-red)" }}
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
              <p style={{ color: "#666666" }} className="max-w-2xl mx-auto">
                La premisa principal es la de satisfacer las necesidades de nuestros clientes,
                priorizando estos valores fundamentales.
              </p>
            </div>
          </ScrollReveal>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {valores.map((valor, index) => (
              <motion.div
                key={index}
                className="text-center p-8 rounded-2xl border"
                style={{ borderColor: "var(--border)" }}
                variants={fadeInUp}
                whileHover={{
                  y: -8,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  transition: { duration: 0.3 },
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: "var(--gros-sand)", color: "var(--gros-red)" }}
                >
                  <valor.icon className="w-8 h-8" />
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--gros-black)" }}
                >
                  {valor.title}
                </h3>
                <p style={{ color: "#666666" }} className="leading-relaxed">
                  {valor.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Proceso Section */}
      <section
        className="py-20 px-4 md:px-8"
        style={{ backgroundColor: "var(--gros-sand)" }}
      >
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-serif font-bold mb-4"
                style={{ color: "var(--gros-black)" }}
              >
                Nuestro Proceso
              </h2>
              <motion.div
                className="h-1 w-20 mx-auto mb-6"
                style={{ backgroundColor: "var(--gros-red)" }}
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <motion.div
              className="p-8 md:p-12 rounded-3xl"
              style={{ backgroundColor: "var(--gros-white)" }}
              variants={fadeInUp}
            >
              <p
                className="text-lg leading-relaxed mb-6"
                style={{ color: "#666666" }}
              >
                La confección es <strong style={{ color: "var(--gros-black)" }}>100% propia</strong> desde
                el diseño a la terminación de la prenda. Utilizamos insumos de primera calidad y contamos
                con la mejor tecnología en impresión y sublimación de telas.
              </p>
              <p
                className="text-lg leading-relaxed"
                style={{ color: "#666666" }}
              >
                La costura se realiza cuidando cada detalle, garantizando productos de la más alta calidad
                para clubes, equipos particulares y empresas.
              </p>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Tiendas Virtuales Section */}
      <section
        className="py-20 px-4 md:px-8"
        style={{ backgroundColor: "var(--gros-white)" }}
      >
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-serif font-bold mb-4"
                style={{ color: "var(--gros-black)" }}
              >
                Tiendas Virtuales para Clubes
              </h2>
              <motion.div
                className="h-1 w-20 mx-auto mb-6"
                style={{ backgroundColor: "var(--gros-red)" }}
                initial={{ width: 0 }}
                whileInView={{ width: 80 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <motion.div
              className="text-center"
              variants={fadeInUp}
            >
              <p
                className="text-lg leading-relaxed mb-8"
                style={{ color: "#666666" }}
              >
                El proyecto de Tiendas Virtuales para clubes amateurs y profesionales busca garantizar
                a los mismos generar <strong style={{ color: "var(--gros-black)" }}>ingresos genuinos</strong> a
                través de la indumentaria deportiva y el merchandising oficial.
              </p>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 px-4 md:px-8"
        style={{
          background: "linear-gradient(135deg, var(--gros-red) 0%, var(--gros-maroon) 100%)",
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-6">
              ¿Querés formar parte de nuestra familia?
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Contactanos para conocer más sobre nuestros servicios y cómo podemos ayudarte.
            </p>
            <Link href="/contacto">
              <MagneticButton
                className="px-8 py-4 text-lg font-bold rounded-full"
                style={{
                  backgroundColor: "var(--gros-white)",
                  color: "var(--gros-red)",
                }}
                glow={true}
              >
                Contactanos
              </MagneticButton>
            </Link>
          </ScrollReveal>
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
              GROS Indumentaria © 2025
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
