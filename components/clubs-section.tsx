"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ScrollReveal } from "@/components/scroll-reveal"
import { staggerContainer, fadeInUp } from "@/lib/animations"

interface Club {
  id: number
  name: string
  slug: string
  description?: string
  logo_url?: string
  order_index: number
  active: boolean
  client_type: "club" | "organization"
}

export function ClubsSection() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClubs()
  }, [])

  const loadClubs = async () => {
    try {
      const response = await fetch("/api/clubs?type=club")
      const data = await response.json()
      if (data.clubs) {
        // Only show active clubs (not organizations) on the public site
        setClubs(
          data.clubs.filter(
            (club: Club) => club.active && club.client_type === "club",
          ),
        )
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
      className="py-20 px-4 md:px-8 overflow-hidden"
      style={{ backgroundColor: "var(--gros-white)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header with animation */}
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
              Clubes
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="h-1 mx-auto"
              style={{ backgroundColor: "var(--gros-red)" }}
            />
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-6 text-lg"
              style={{ color: "#666666" }}
            >
              Clubes deportivos que confían en nosotros
            </motion.p>
          </div>
        </ScrollReveal>

        {/* Grid with stagger animation */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8 items-center"
        >
          {clubs.map((club, index) => (
            <Link
              key={club.id}
              href={`/clubes/${club.slug}`}
              aria-label={`Ver productos de ${club.name}`}
            >
              <motion.div
                variants={fadeInUp}
                whileHover={{
                  y: -10,
                  scale: 1.05,
                  transition: { type: "spring", stiffness: 300, damping: 15 },
                }}
                className="flex items-center justify-center p-6  group relative cursor-pointer"
                style={{ backgroundColor: "var(--gros-sand)" }}
              >
                {/* Floating animation */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                  className="w-full"
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
                </motion.div>

                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    boxShadow: "0 0 20px rgba(196, 58, 47, 0.3)",
                  }}
                />
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
