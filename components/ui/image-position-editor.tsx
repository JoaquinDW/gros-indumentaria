"use client"

import { useState } from "react"
import { Upload, X, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ImagePosition {
  x: number // 0-100 (percentage)
  y: number // 0-100 (percentage)
  scale: number // 1-2 (zoom level)
}

interface ImagePositionEditorProps {
  value?: string[] // Array of image URLs
  positions?: ImagePosition[]
  onChange: (urls: string[], positions: ImagePosition[]) => void
  maxImages?: number
  disabled?: boolean
  label?: string
}

export function ImagePositionEditor({
  value = [],
  positions = [],
  onChange,
  maxImages = 5,
  disabled = false,
  label = "Imágenes del Producto",
}: ImagePositionEditorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // Initialize positions array with defaults if needed
  const normalizedPositions = value.map((_, index) =>
    positions[index] || { x: 50, y: 50, scale: 1 }
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

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

        if (!file.type.startsWith("image/")) {
          setError(`El archivo ${file.name} no es una imagen válida`)
          continue
        }

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
        const newUrls = [...value, ...uploadedUrls]
        const newPositions = [
          ...normalizedPositions,
          ...uploadedUrls.map(() => ({ x: 50, y: 50, scale: 1 }))
        ]
        onChange(newUrls, newPositions)
      }
    } catch (err) {
      console.error("Error uploading images:", err)
      setError(err instanceof Error ? err.message : "Error al subir imágenes")
    } finally {
      setLoading(false)
      e.target.value = ""
    }
  }

  const handleRemove = async (indexToRemove: number) => {
    const urlToRemove = value[indexToRemove]

    try {
      const url = new URL(urlToRemove)
      const pathMatch = url.pathname.match(/\/product-images\/(.+)$/)

      if (pathMatch) {
        const path = pathMatch[1]
        await fetch(`/api/upload?path=${encodeURIComponent(path)}`, {
          method: "DELETE",
        })
      }
    } catch (err) {
      console.error("Error deleting image:", err)
    }

    const newUrls = value.filter((_, index) => index !== indexToRemove)
    const newPositions = normalizedPositions.filter((_, index) => index !== indexToRemove)
    onChange(newUrls, newPositions)
  }

  const handlePositionChange = (index: number, field: keyof ImagePosition, newValue: number) => {
    const newPositions = [...normalizedPositions]
    newPositions[index] = { ...newPositions[index], [field]: newValue }
    onChange([...value], newPositions)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
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
      <div className="space-y-4">
        {value.map((url, index) => {
          const position = normalizedPositions[index]
          const isEditing = editingIndex === index

          return (
            <div
              key={url}
              className="border-2 border-gray-200 rounded-lg p-4 space-y-3"
            >
              <div className="flex gap-4">
                {/* Image Preview */}
                <div className="relative w-32 h-32 flex-shrink-0 rounded-lg border-2 border-gray-200 overflow-hidden group">
                  <div
                    className="w-full h-full relative"
                    style={{ backgroundColor: "#f5f5dc" }}
                  >
                    <img
                      src={url}
                      alt={`Imagen ${index + 1}`}
                      className="absolute w-full h-full object-contain"
                      style={{
                        objectPosition: `${position.x}% ${position.y}%`,
                        transform: `scale(${position.scale})`,
                      }}
                    />
                  </div>
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

                {/* Position Controls */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Imagen {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingIndex(isEditing ? null : index)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      {isEditing ? "Cerrar" : "Ajustar"}
                    </Button>
                  </div>

                  {isEditing && (
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">
                          Posición X
                        </label>
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={position.x}
                          onChange={(e) =>
                            handlePositionChange(index, "x", Number(e.target.value))
                          }
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{position.x}%</span>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">
                          Posición Y
                        </label>
                        <Input
                          type="range"
                          min="0"
                          max="100"
                          value={position.y}
                          onChange={(e) =>
                            handlePositionChange(index, "y", Number(e.target.value))
                          }
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{position.y}%</span>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">
                          Zoom
                        </label>
                        <Input
                          type="range"
                          min="1"
                          max="2"
                          step="0.1"
                          value={position.scale}
                          onChange={(e) =>
                            handlePositionChange(index, "scale", Number(e.target.value))
                          }
                          className="w-full"
                        />
                        <span className="text-xs text-gray-500">{position.scale}x</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* Upload Button */}
        {canAddMore && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="relative h-32 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
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
        La primera imagen será la imagen principal del producto. Ajusta la posición y zoom de cada imagen.
        Formatos soportados: JPG, PNG, WebP, GIF. Tamaño máximo: 5MB por imagen.
      </p>
    </div>
  )
}
