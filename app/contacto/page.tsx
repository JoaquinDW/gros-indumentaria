"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MapPin, Send, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollReveal } from "@/components/scroll-reveal"
import { MagneticButton } from "@/components/magnetic-button"
import { GrosBackgroundPattern } from "@/components/gros-background-pattern"
import {
  staggerContainer,
  fadeInUp,
  fadeInDown,
  scaleIn,
} from "@/lib/animations"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Send email via API route
    console.log("Form submitted:", formData)
    setSubmitted(true)
    setTimeout(() => {
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
      setSubmitted(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-4 border-gros-red py-12 px-4 md:px-8 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-gros-red mb-4 inline-block transition-colors font-semibold"
            >
              ← Volver al inicio
            </Link>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-5xl font-bold font-serif text-gros-black"
          >
            Contacto
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 96 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1 bg-gros-red mt-4"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-gray-700 mt-3"
          >
            Estamos aquí para ayudarte
          </motion.p>
        </div>
      </header>

      {/* Content */}
      <section className="py-16 px-4 md:px-8 relative overflow-hidden">
        {/* Background Pattern */}
        <GrosBackgroundPattern opacity={0.08} />

        {/* Animated Background Orbs */}
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
            className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-[var(--gros-red)]/10 to-transparent blur-3xl"
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
            className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-gradient-to-br from-[var(--gros-blue)]/10 to-transparent blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          {/* Info Cards */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-6"
          >
            {[
              {
                icon: Phone,
                title: "Teléfono",
                content: "+54 3734 443259",
                link: "https://wa.me/5493734443259",
                linkText: "Escribir por WhatsApp →",
              },
              {
                icon: Mail,
                title: "Email",
                content: "grosindumentaria@gmail.com",
              },
              {
                icon: MapPin,
                title: "Ubicación",
                content: "Presidencia de la Plaza, Chaco, Argentina",
                link: "https://www.google.com/maps/place/GROS/@-27.0057242,-59.8464425,17z/data=!3m1!4b1!4m6!3m5!1s0x9446a1480b760723:0xbaa24be63221c8f1!8m2!3d-27.0057242!4d-59.8464425!16s%2Fg%2F11p56k_qvd?entry=ttu&g_ep=EgoyMDI2MDEwNy4wIKXMDSoASAFQAw%3D%3D",
                linkText: "Ver en Google Maps →",
              },
            ].map((item, idx) => {
              const Icon = item.icon
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
                  >
                    <Card className="p-6 bg-white border-l-4 border-l-gros-red shadow-md hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group">
                      {/* Glow effect on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, rgba(196, 58, 47, 0.1), transparent 70%)`,
                        }}
                      />

                      <motion.div
                        whileHover={{
                          rotate: [0, -10, 10, -10, 0],
                          scale: 1.1,
                        }}
                        transition={{ duration: 0.5 }}
                      >
                        <Icon className="h-10 w-10 text-gros-red mb-4" />
                      </motion.div>

                      <h3 className="text-xl font-bold text-gros-black mb-3">
                        {item.title}
                      </h3>
                      <p className="text-gray-900 font-semibold mb-4 text-base">
                        {item.content}
                      </p>
                      {item.link && (
                        <motion.a
                          href={item.link}
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          className="text-gros-red hover:text-gros-maroon font-bold transition-colors text-base inline-block"
                        >
                          {item.linkText}
                        </motion.a>
                      )}
                    </Card>
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ScrollReveal>
              <Card className="p-10 bg-white shadow-md border-t-4 border-t-gros-red">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="text-3xl font-bold text-gros-black mb-8"
                >
                  Envíanos un Mensaje
                </motion.h2>

                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.5 }}
                      className="text-center py-12 bg-green-50 rounded-lg border-2 border-green-500"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, rotate: 360 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 15,
                          delay: 0.2,
                        }}
                        className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600 text-white mb-4"
                      >
                        <Check className="w-12 h-12" />
                      </motion.div>
                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-2xl font-bold text-green-900 mb-3"
                      >
                        Mensaje Enviado
                      </motion.h3>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="text-gray-900 font-medium text-lg"
                      >
                        Gracias por contactarnos. Nos pondremos en contacto
                        pronto.
                      </motion.p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handleSubmit}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Nombre *
                          </label>
                          <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Tu nombre"
                            required
                            className="border-gray-300 bg-white focus:border-gros-red focus:ring-gros-red transition-all duration-300 focus:scale-[1.02]"
                          />
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                        >
                          <label className="block text-sm font-bold text-gray-900 mb-2">
                            Email *
                          </label>
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="tu@email.com"
                            required
                            className="border-gray-300 bg-white focus:border-gros-red focus:ring-gros-red transition-all duration-300 focus:scale-[1.02]"
                          />
                        </motion.div>
                      </div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                      >
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Teléfono
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+54 9 11 1234 5678"
                          className="border-gray-300 bg-white focus:border-gros-red focus:ring-gros-red transition-all duration-300 focus:scale-[1.02]"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Asunto *
                        </label>
                        <Input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Asunto del mensaje"
                          required
                          className="border-gray-300 bg-white focus:border-gros-red focus:ring-gros-red transition-all duration-300 focus:scale-[1.02]"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                          Mensaje *
                        </label>
                        <motion.textarea
                          whileFocus={{ scale: 1.01 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tu mensaje..."
                          rows={6}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:border-gros-red focus:ring-2 focus:ring-gros-red focus:outline-none transition-all duration-300"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      >
                        <MagneticButton
                          type="submit"
                          size="lg"
                          glow={true}
                          magneticStrength={0.3}
                          className="w-full bg-gros-red text-white hover:bg-gros-maroon font-bold h-14 text-lg shadow-md flex items-center justify-center gap-2"
                        >
                          <div className="flex flex-row items-center justify-center gap-3">
                            <Send className="h-10 w-10 scale-110" />
                            <span>Enviar Mensaje</span>
                          </div>
                        </MagneticButton>
                      </motion.div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-gros-sand mt-12 relative overflow-hidden">
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gros-red/20 rounded-full"
              style={{
                left: `${15 + i * 12}%`,
                top: `${30 + (i % 3) * 20}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
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
              className="text-3xl font-bold font-serif text-gros-black mb-6"
            >
              ¿Necesitas ayuda urgente?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-600 mb-8"
            >
              Contáctanos por WhatsApp para una respuesta inmediata
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <a href="https://wa.me/5493734443259">
                <MagneticButton
                  size="lg"
                  glow={true}
                  magneticStrength={0.5}
                  className="bg-gros-red text-white hover:bg-gros-maroon font-bold h-12 px-8"
                >
                  Abrir WhatsApp
                </MagneticButton>
              </a>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gros-black text-white py-8 px-4 md:px-8">
        <ScrollReveal>
          <div className="max-w-7xl mx-auto text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-2"
            >
              Gros Indumentaria © 2025
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 mb-4"
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
                  className="text-sm text-gray-600"
                >
                  Desarrollado por{" "}
                  <span className="font-semibold transition-colors duration-300 group-hover:text-gros-red text-gray-500">
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
