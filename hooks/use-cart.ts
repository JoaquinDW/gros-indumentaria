"use client"

import { useState, useCallback, useEffect } from "react"

export interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  size: string
  color: string
  fabric: string
  customText?: string
  image: string
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("gros_cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error loading cart:", error)
      }
    }
    setIsLoading(false)
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("gros_cart", JSON.stringify(items))
    }
  }, [items, isLoading])

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (i) => i.productId === item.productId && i.size === item.size && i.color === item.color && i.fabric === item.fabric,
      )

      if (existingItem) {
        return prev.map((i) => (i === existingItem ? { ...i, quantity: i.quantity + item.quantity } : i))
      }

      return [...prev, item]
    })
  }, [])

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return {
    items,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    isLoading,
  }
}
