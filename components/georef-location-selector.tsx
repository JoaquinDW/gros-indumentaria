"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface Province {
  id: string
  nombre: string
}

interface Locality {
  id: string
  nombre: string
}

interface GeorefLocationSelectorProps {
  province: string
  locality: string
  onProvinceChange: (provinceId: string, provinceName: string) => void
  onLocalityChange: (localityName: string) => void
  disabled?: boolean
}

export function GeorefLocationSelector({
  province,
  locality,
  onProvinceChange,
  onLocalityChange,
  disabled = false,
}: GeorefLocationSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [localities, setLocalities] = useState<Locality[]>([])
  const [loadingProvinces, setLoadingProvinces] = useState(true)
  const [loadingLocalities, setLoadingLocalities] = useState(false)

  // Load provinces on mount
  useEffect(() => {
    loadProvinces()
  }, [])

  // Load localities when province changes
  useEffect(() => {
    if (province) {
      loadLocalities(province)
    } else {
      setLocalities([])
      onLocalityChange("")
    }
  }, [province])

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true)
      const response = await fetch("/api/georef/provincias")
      const data = await response.json()
      if (data.provinces) {
        setProvinces(data.provinces)
      }
    } catch (error) {
      console.error("Error loading provinces:", error)
    } finally {
      setLoadingProvinces(false)
    }
  }

  const loadLocalities = async (provinceId: string) => {
    try {
      setLoadingLocalities(true)
      const response = await fetch(`/api/georef/localidades?provincia=${provinceId}`)
      const data = await response.json()
      if (data.localities) {
        setLocalities(data.localities)
      }
    } catch (error) {
      console.error("Error loading localities:", error)
    } finally {
      setLoadingLocalities(false)
    }
  }

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value
    const provinceName = provinces.find((p) => p.id === provinceId)?.nombre || ""
    onProvinceChange(provinceId, provinceName)
  }

  const handleLocalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onLocalityChange(e.target.value)
  }

  return (
    <div className="space-y-4">
      {/* Province Selector */}
      <div>
        <label className="block text-sm font-bold text-gros-black mb-2">Provincia *</label>
        <div className="relative">
          <select
            value={province}
            onChange={handleProvinceChange}
            disabled={disabled || loadingProvinces}
            className="w-full px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Selecciona una provincia</option>
            {provinces.map((prov) => (
              <option key={prov.id} value={prov.id}>
                {prov.nombre}
              </option>
            ))}
          </select>
          {loadingProvinces && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* Locality Selector */}
      <div>
        <label className="block text-sm font-bold text-gros-black mb-2">Localidad *</label>
        <div className="relative">
          <select
            value={locality}
            onChange={handleLocalityChange}
            disabled={disabled || !province || loadingLocalities}
            className="w-full px-3 py-2 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!province ? "Primero selecciona una provincia" : "Selecciona una localidad"}
            </option>
            {localities.map((loc) => (
              <option key={loc.id} value={loc.nombre}>
                {loc.nombre}
              </option>
            ))}
          </select>
          {loadingLocalities && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {province && localities.length === 0 && !loadingLocalities && (
          <p className="text-xs text-gray-500 mt-1">No se encontraron localidades para esta provincia</p>
        )}
      </div>
    </div>
  )
}
