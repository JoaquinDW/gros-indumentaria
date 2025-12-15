"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Mail, Phone, MapPin, Send } from "lucide-react"

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      <header className="bg-white border-b-4 border-gros-red py-12 px-4 md:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gros-red mb-4 inline-block transition-colors font-semibold"
          >
            ← Volver al inicio
          </Link>
          <h1 className="text-5xl font-bold font-serif text-gros-black">
            Contacto
          </h1>
          <p className="text-xl text-gray-700 mt-3">
            Estamos aquí para ayudarte
          </p>
        </div>
      </header>

      {/* Content */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-6">
            <Card className="p-6 bg-white border-l-4 border-l-gros-red shadow-md hover:shadow-lg transition-shadow duration-300">
              <Phone className="h-10 w-10 text-gros-red mb-4" />
              <h3 className="text-xl font-bold text-gros-black mb-3">
                Teléfono
              </h3>
              <p className="text-gray-900 font-semibold mb-4 text-lg">
                +54 9 11 1234 5678
              </p>
              <a
                href="https://wa.me/5491234567890"
                className="text-gros-red hover:text-gros-maroon font-bold transition-colors text-base"
              >
                Escribir por WhatsApp →
              </a>
            </Card>

            <Card className="p-6 bg-white border-l-4 border-l-gros-red shadow-md hover:shadow-lg transition-shadow duration-300">
              <Mail className="h-10 w-10 text-gros-red mb-4" />
              <h3 className="text-xl font-bold text-gros-black mb-3">Email</h3>
              <p className="text-gray-900 font-semibold text-base">
                info@grosindum.com
              </p>
            </Card>

            <Card className="p-6 bg-white border-l-4 border-l-gros-red shadow-md hover:shadow-lg transition-shadow duration-300">
              <MapPin className="h-10 w-10 text-gros-red mb-4" />
              <h3 className="text-xl font-bold text-gros-black mb-3">
                Ubicación
              </h3>
              <p className="text-gray-900 font-semibold text-base">
                Presidencia de la Plaza, Chaco, Argentina
              </p>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-10 bg-white shadow-md border-t-4 border-t-gros-red">
              <h2 className="text-3xl font-bold text-gros-black mb-8">
                Envíanos un Mensaje
              </h2>

              {submitted ? (
                <div className="text-center py-12 bg-green-50 rounded-lg border-2 border-green-500">
                  <div className="text-5xl mb-4 text-green-600">✓</div>
                  <h3 className="text-2xl font-bold text-green-900 mb-3">
                    Mensaje Enviado
                  </h3>
                  <p className="text-gray-900 font-medium text-lg">
                    Gracias por contactarnos. Nos pondremos en contacto pronto.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
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
                        className="border-gray-300 bg-white focus:border-gros-red focus:ring-gros-red"
                      />
                    </div>
                    <div>
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
                        className="border-gray-300 bg-white focus:border-gros-red focus:ring-gros-red"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Teléfono
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+54 9 11 1234 5678"
                      className="border-gray-300 bg-white focus:border-gros-red focus:ring-gros-red"
                    />
                  </div>

                  <div>
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
                      className="border-gray-300 bg-white focus:border-gros-red focus:ring-gros-red"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Mensaje *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tu mensaje..."
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-md bg-white focus:border-gros-red focus:ring-2 focus:ring-gros-red focus:outline-none transition-colors"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gros-red text-white hover:bg-gros-maroon font-bold h-14 text-lg shadow-md hover:shadow-lg transition-all"
                  >
                    <Send className="mr-2 h-6 w-6" />
                    Enviar Mensaje
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 md:px-8 bg-gros-sand mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold font-serif text-gros-black mb-6">
            ¿Necesitas ayuda urgente?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Contáctanos por WhatsApp para una respuesta inmediata
          </p>
          <a href="https://wa.me/5491234567890">
            <Button className="bg-gros-red text-white hover:bg-gros-maroon font-bold h-12 px-8">
              Abrir WhatsApp
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gros-black text-white py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="mb-2">Gros Indumentaria © 2025</p>
          <p className="text-gray-400">Prendas Personalizadas de Calidad</p>
        </div>
      </footer>
    </div>
  )
}
