"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { MagneticButton } from "@/components/magnetic-button"

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
  const [direction, setDirection] = useState(0)

  // Parallax effect for the background
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 150])

  useEffect(() => {
    if (slides.length === 0) return

    const interval = setInterval(() => {
      setDirection(1)
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  if (slides.length === 0) {
    return (
      <div
        className="w-full h-96 flex items-center justify-center"
        style={{ backgroundColor: "var(--gros-sand)" }}
      >
        <p style={{ color: "var(--gros-black)" }}>
          No hay imágenes en el carrusel
        </p>
      </div>
    )
  }

  const slide = slides[currentSlide]
  const nextSlide = () => {
    setDirection(1)
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }
  const prevSlide = () => {
    setDirection(-1)
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const slideVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      opacity: 0,
      scale: 1.1,
    }),
  }

  const swipeConfidenceThreshold = 10000
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
  }

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      {/* Slides with AnimatePresence for smooth transitions */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            opacity: { duration: 0.8 },
            scale: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x)

            if (swipe < -swipeConfidenceThreshold) {
              nextSlide()
            } else if (swipe > swipeConfidenceThreshold) {
              prevSlide()
            }
          }}
          className="absolute inset-0"
        >
          {/* Parallax background image */}
          <motion.div style={{ y }} className="absolute inset-0 -top-32">
            <img
              src={
                slide.image_url ||
                "/placeholder.svg?height=1080&width=1920&query=carousel"
              }
              alt={slide.title}
              className="w-full h-[calc(100%+8rem)] object-cover"
            />
          </motion.div>

          {/* Gradient overlay with animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Content with stagger animation */}
          <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4">
            <div className="max-w-2xl">
              <motion.h2
                key={`title-${currentSlide}`}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-4xl md:text-6xl font-bold font-serif mb-4 text-balance"
              >
                {slide.title}
              </motion.h2>
              {slide.description && (
                <motion.p
                  key={`desc-${currentSlide}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-lg md:text-2xl mb-8"
                >
                  {slide.description}
                </motion.p>
              )}
              {slide.cta_text && slide.cta_link && (
                <motion.div
                  key={`cta-${currentSlide}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link href={slide.cta_link}>
                    <MagneticButton
                      size="lg"
                      glow={true}
                      className="bg-[var(--gros-red)] text-white hover:bg-[var(--gros-maroon)]"
                    >
                      {slide.cta_text}
                    </MagneticButton>
                  </Link>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons with improved animations */}
      <motion.button
        onClick={prevSlide}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        whileTap={{ scale: 0.95 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <ChevronLeft className="h-8 w-8 text-white" />
      </motion.button>
      <motion.button
        onClick={nextSlide}
        whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
        whileTap={{ scale: 0.95 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full transition backdrop-blur-sm"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      >
        <ChevronRight className="h-8 w-8 text-white" />
      </motion.button>

      {/* Dots Indicator with animations */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => {
              setDirection(idx > currentSlide ? 1 : -1)
              setCurrentSlide(idx)
            }}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="h-3 rounded-full transition-all duration-300"
            animate={{
              width: idx === currentSlide ? 32 : 12,
              backgroundColor:
                idx === currentSlide
                  ? "var(--gros-red)"
                  : "rgba(255, 255, 255, 0.5)",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <ChevronDown className="h-8 w-8 text-white drop-shadow-lg" />
        </motion.div>
      </motion.div>
    </div>
  )
}
