"use client"

import { useState } from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MultipleImageUploadProps {
  value?: string[] // Array of image URLs
  onChange: (urls: string[]) => void
  maxImages?: number
  disabled?: boolean
  label?: string
}

export function MultipleImageUpload({
  value = [],
  onChange,
  maxImages = 5,
  disabled = false,
  label = "Imágenes del Producto",
}: MultipleImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Check if adding these files would exceed the limit
    if (value.length + files.length > maxImages) {
      setError(`Puedes subir máximo ${maxImages} imágenes`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Validate file type
        if (!file.type.startsWith("image/")) {
          setError(`El archivo ${file.name} no es una imagen válida`)
          continue
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError(`El archivo ${file.name} excede el tamaño máximo de 5MB`)
          continue
        }

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al subir imagen")
        }

        const data = await response.json()
        uploadedUrls.push(data.url)
      }

      if (uploadedUrls.length > 0) {
        onChange([...value, ...uploadedUrls])
      }
    } catch (err) {
      console.error("Error uploading images:", err)
      setError(err instanceof Error ? err.message : "Error al subir imágenes")
    } finally {
      setLoading(false)
      // Reset the input
      e.target.value = ""
    }
  }

  const handleRemove = async (indexToRemove: number) => {
    const urlToRemove = value[indexToRemove]

    try {
      // Extract the path from the URL
      const url = new URL(urlToRemove)
      const pathMatch = url.pathname.match(/\/product-images\/(.+)$/)

      if (pathMatch) {
        const path = pathMatch[1]

        // Delete from storage
        await fetch(`/api/upload?path=${encodeURIComponent(path)}`, {
          method: "DELETE",
        })
      }
    } catch (err) {
      console.error("Error deleting image:", err)
    }

    // Remove from array
    const newUrls = value.filter((_, index) => index !== indexToRemove)
    onChange(newUrls)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      // Create a fake event to reuse the handleFileChange logic
      const input = document.createElement("input")
      input.type = "file"
      input.files = files
      handleFileChange({ target: input } as any)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const canAddMore = value.length < maxImages

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-xs text-gray-500">
          {value.length} / {maxImages} imágenes
        </span>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {value.map((url, index) => (
          <div
            key={url}
            className="relative aspect-square rounded-lg border-2 border-gray-200 overflow-hidden group"
          >
            <img
              src={url}
              alt={`Imagen ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleRemove(index)}
                disabled={disabled || loading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Principal
              </div>
            )}
          </div>
        ))}

        {/* Upload Button */}
        {canAddMore && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
          >
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center h-full cursor-pointer"
            >
              <div className="text-center">
                {loading ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      Subir {value.length === 0 ? "imágenes" : "más"}
                    </p>
                  </>
                )}
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={disabled || loading}
                className="hidden"
              />
            </label>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        La primera imagen será la imagen principal del producto. Puedes subir hasta {maxImages} imágenes.
        Formatos soportados: JPG, PNG, WebP, GIF. Tamaño máximo: 5MB por imagen.
      </p>
    </div>
  )
}
