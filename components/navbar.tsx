"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, ShoppingCart, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

interface Club {
  id: number
  name: string
  slug: string
  active: boolean
  client_type: "club" | "organization"
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isClubsDropdownOpen, setIsClubsDropdownOpen] = useState(false)
  const [clubs, setClubs] = useState<Club[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { items } = useCart()
  const cartCount = items.length

  const navLinks = [
    { id: "inicio", label: "Inicio", href: "/" },
    { id: "productos", label: "Productos", href: "/clubes" },
    { id: "nosotros", label: "Nosotros", href: "/sobre-nosotros" },
    { id: "contacto", label: "Contacto", href: "/contacto" },
  ]

  useEffect(() => {
    loadClubs()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsClubsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const loadClubs = async () => {
    try {
      const response = await fetch("/api/clubs?type=club")
      const data = await response.json()
      if (data.clubs) {
        // Only show active clubs (not organizations) in navbar
        setClubs(
          data.clubs.filter((c: Club) => c.active && c.client_type === "club"),
        )
      }
    } catch (error) {
      console.error("Error loading clubs:", error)
    }
  }

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        backgroundColor: "var(--gros-white)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/gros-logo.png"
              alt="GROS Indumentaria"
              width={56}
              height={56}
              className="h-15 w-15 object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="font-bold transition hover:opacity-70"
                style={{ color: "var(--gros-black)" }}
              >
                {link.label}
              </Link>
            ))}

            {/* Clubs Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsClubsDropdownOpen(!isClubsDropdownOpen)}
                className="flex items-center gap-1 font-bold transition hover:opacity-70"
                style={{ color: "var(--gros-black)" }}
              >
                Clubes
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isClubsDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isClubsDropdownOpen && clubs.length > 0 && (
                <div
                  className="absolute top-full mt-2 w-56 bg-white rounded-md shadow-lg border py-2"
                  style={{ borderColor: "var(--border)" }}
                >
                  <Link
                    href="/clubes"
                    onClick={() => setIsClubsDropdownOpen(false)}
                    className="block px-4 py-2 font-bold hover:bg-gray-50 transition"
                    style={{ color: "var(--gros-black)" }}
                  >
                    Ver todos los clubes
                  </Link>
                  <div
                    className="border-t my-2"
                    style={{ borderColor: "var(--border)" }}
                  ></div>
                  {clubs.map((club) => (
                    <Link
                      key={club.id}
                      href={`/clubes/${club.slug}`}
                      onClick={() => setIsClubsDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-50 transition"
                      style={{ color: "var(--gros-black)" }}
                    >
                      {club.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link href="/carrito">
              <Button
                variant="outline"
                size="icon"
                className="relative bg-transparent"
                style={{
                  borderColor: "var(--gros-red)",
                  color: "var(--gros-red)",
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: "var(--gros-red)" }}
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              style={{ color: "var(--gros-black)" }}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Full Screen Overlay */}
        <div
          className={`fixed inset-0 bg-white z-40 md:hidden transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{ top: "65px" }}
        >
          <div className="flex flex-col h-full px-8 py-12 space-y-6 overflow-y-auto">
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-2xl font-bold transition hover:opacity-70 border-b pb-4"
                style={{
                  color: "var(--gros-black)",
                  borderColor: "var(--border)",
                }}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Clubs Section */}
            <div
              className="border-b pb-4"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="text-2xl font-bold mb-4"
                style={{ color: "var(--gros-black)" }}
              >
                Clubes
              </div>
              <div className="pl-4 space-y-3">
                <Link
                  href="/clubes"
                  onClick={() => setIsOpen(false)}
                  className="block text-lg font-bold hover:opacity-70 transition"
                  style={{ color: "var(--gros-red)" }}
                >
                  Ver todos los clubes
                </Link>
                {clubs.map((club) => (
                  <Link
                    key={club.id}
                    href={`/clubes/${club.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg hover:opacity-70 transition"
                    style={{ color: "var(--gros-black)" }}
                  >
                    {club.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
