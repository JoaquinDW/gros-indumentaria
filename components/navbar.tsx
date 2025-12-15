"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { items } = useCart()
  const cartCount = items.length

  const navLinks = [
    { id: "inicio", label: "Inicio", href: "/" },
    { id: "clubes", label: "Clubes", href: "/clubes" },
    { id: "productos", label: "Productos", href: "/clubes" },
    { id: "contacto", label: "Contacto", href: "/contacto" },
  ]

  return (
    <nav
      className="sticky top-0 z-50"
      style={{ backgroundColor: "var(--gros-white)", borderBottom: "1px solid var(--border)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold font-serif" style={{ color: "var(--gros-red)" }}>
              GROS
            </div>
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
          </div>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link href="/carrito">
              <Button
                variant="outline"
                size="icon"
                className="relative bg-transparent"
                style={{ borderColor: "var(--gros-red)", color: "var(--gros-red)" }}
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
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)} style={{ color: "var(--gros-black)" }}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
            {navLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="block px-4 py-2 rounded font-bold transition hover:opacity-70"
                style={{ color: "var(--gros-black)" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}
