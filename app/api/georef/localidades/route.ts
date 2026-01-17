import { NextResponse } from "next/server"

interface GeorefLocalidad {
  id: string
  nombre: string
  centroide: {
    lat: number
    lon: number
  }
  provincia: {
    id: string
    nombre: string
  }
  municipio?: {
    id: string
    nombre: string
  }
}

interface GeorefResponse {
  localidades: GeorefLocalidad[]
  cantidad: number
  total: number
  inicio: number
  parametros: Record<string, any>
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const provinciaId = searchParams.get("provincia")

    if (!provinciaId) {
      return NextResponse.json({ error: "Province ID is required" }, { status: 400 })
    }

    // Fetch localities for the given province
    // Using max=5000 to get all localities
    const response = await fetch(
      `https://apis.datos.gob.ar/georef/api/localidades?provincia=${provinciaId}&campos=id,nombre&max=5000&orden=nombre`,
      {
        headers: {
          "Accept": "application/json",
        },
        // Cache for 1 week since localities don't change often
        next: { revalidate: 604800 },
      }
    )

    if (!response.ok) {
      throw new Error("Error fetching localities from Georef API")
    }

    const data: GeorefResponse = await response.json()

    // Return simplified data
    const localities = data.localidades.map((l) => ({
      id: l.id,
      nombre: l.nombre,
    }))

    return NextResponse.json({ localities }, { status: 200 })
  } catch (error) {
    console.error("Error in georef/localidades:", error)
    return NextResponse.json({ error: "Failed to fetch localities" }, { status: 500 })
  }
}
