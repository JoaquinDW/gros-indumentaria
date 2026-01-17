import { NextResponse } from "next/server"

interface GeorefProvincia {
  id: string
  nombre: string
  centroide: {
    lat: number
    lon: number
  }
}

interface GeorefResponse {
  provincias: GeorefProvincia[]
  cantidad: number
  total: number
  inicio: number
  parametros: Record<string, any>
}

export async function GET() {
  try {
    const response = await fetch("https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre&max=100", {
      headers: {
        "Accept": "application/json",
      },
      // Cache for 1 week since provinces don't change
      next: { revalidate: 604800 },
    })

    if (!response.ok) {
      throw new Error("Error fetching provinces from Georef API")
    }

    const data: GeorefResponse = await response.json()

    // Return simplified data
    const provinces = data.provincias.map((p) => ({
      id: p.id,
      nombre: p.nombre,
    }))

    return NextResponse.json({ provinces }, { status: 200 })
  } catch (error) {
    console.error("Error in georef/provincias:", error)
    return NextResponse.json({ error: "Failed to fetch provinces" }, { status: 500 })
  }
}
