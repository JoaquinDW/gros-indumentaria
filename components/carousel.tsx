"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface CarouselSlide {
  id: number
  title: string
  description?: string
  image_url: string
  cta_text?: string
  cta_link?: string
}

interface CarouselProps {
  slides: CarouselSlide[]
}

export function Carousel({ slides }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)

  useEffect(() => {
    if (!autoPlay || slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoPlay, slides.length])

  if (slides.length === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center" style={{ backgroundColor: "var(--gros-sand)" }}>
        <p style={{ color: "var(--gros-black)" }}>No hay imágenes en el carrusel</p>
      </div>
    )
  }

  const slide = slides[currentSlide]
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div
      className="relative w-full h-96 md:h-screen overflow-hidden"
      onMouseEnter={() => setAutoPlay(false)}
      onMouseLeave={() => setAutoPlay(true)}
    >
      {/* Slides */}
      {slides.map((s, idx) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={s.image_url || "/placeholder.svg?height=1080&width=1920&query=carousel"}
            alt={s.title}
            className="w-full h-full object-cover"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-bold font-serif mb-4 text-balance">{s.title}</h2>
              {s.description && <p className="text-lg md:text-2xl mb-8">{s.description}</p>}
              {s.cta_text && s.cta_link && (
                <Link key={`cta-${s.id}`} href={s.cta_link}>
                  <Button
                    size="lg"
                    style={{ backgroundColor: "var(--gros-red)", color: "var(--gros-white)" }}
                    className="hover:opacity-90"
                  >
                    {s.cta_text}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition hover:bg-white/20"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <ChevronLeft className="h-8 w-8 text-white" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition hover:bg-white/20"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <ChevronRight className="h-8 w-8 text-white" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-3 w-3 rounded-full transition ${idx === currentSlide ? "w-8" : ""}`}
            style={{
              backgroundColor: idx === currentSlide ? "var(--gros-red)" : "rgba(255, 255, 255, 0.5)",
            }}
          />
        ))}
      </div>
    </div>
  )
}
