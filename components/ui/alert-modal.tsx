"use client"

import { useEffect } from "react"
import { X, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AlertModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: "success" | "error" | "info"
  actionButton?: {
    label: string
    onClick: () => void
  }
}

export function AlertModal({ isOpen, onClose, title, message, type = "info", actionButton }: AlertModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-600" />
      case "error":
        return <AlertCircle className="h-6 w-6 text-red-600" />
      default:
        return <Info className="h-6 w-6 text-blue-600" />
    }
  }

  const getTitle = () => {
    if (title) return title
    switch (type) {
      case "success":
        return "Éxito"
      case "error":
        return "Error"
      default:
        return "Información"
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-lg shadow-xl animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-bold text-gros-black">{getTitle()}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-4">
          <p className="text-gray-700">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 pt-4 border-t">
          {actionButton && (
            <Button
              onClick={() => {
                actionButton.onClick()
                onClose()
              }}
              variant="outline"
              className="border-gros-red text-gros-red hover:bg-gros-red/10 font-bold"
            >
              {actionButton.label}
            </Button>
          )}
          <Button
            onClick={onClose}
            className="bg-gros-red text-white hover:bg-gros-maroon font-bold"
          >
            {actionButton ? "Cerrar" : "Aceptar"}
          </Button>
        </div>
      </div>
    </div>
  )
}
