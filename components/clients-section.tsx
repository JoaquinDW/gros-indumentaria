"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface Club {
  id: number
  name: string
  slug: string
  description?: string
  logo_url?: string
  order_index: number
  active: boolean
}

export function ClientsSection() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    try {
      const response = await fetch("/api/clubs")
      const data = await response.json()
      if (data.clubs) {
        // Only show active clubs on the public site
        setClubs(data.clubs.filter((club: Club) => club.active))
      }
    } catch (error) {
      console.error("Error loading clubs:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section
        className="py-20 px-4 md:px-8"
        style={{ backgroundColor: "var(--gros-white)" }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </section>
    )
  }

  if (clubs.length === 0) {
    return null
  }

  return (
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
            Nuestros Clientes
          </h2>
          <div
            className="h-1 w-24 mx-auto"
            style={{ backgroundColor: "var(--gros-red)" }}
          ></div>
          <p className="mt-6 text-lg" style={{ color: "#666666" }}>
            Clubes y organizaciones que confían en nosotros
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 items-center">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="flex items-center justify-center p-6 rounded-lg transition-all duration-300 hover:shadow-lg group"
              style={{ backgroundColor: "var(--gros-sand)" }}
            >
              {club.logo_url ? (
                <div className="relative w-full h-24 grayscale group-hover:grayscale-0 transition-all duration-300">
                  <img
                    src={club.logo_url}
                    alt={club.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <p
                    className="font-bold text-sm md:text-base"
                    style={{ color: "var(--gros-black)" }}
                  >
                    {club.name}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
