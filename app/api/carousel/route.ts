import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - List all carousel images (public sees only active, ordered by order_index)
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated to determine query
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let query = supabase
      .from("carousel_images")
      .select("*")
      .order("order_index", { ascending: true })

    // If not authenticated, only show active carousel images
    if (!session) {
      query = query.eq("active", true)
    }

    const { data: carouselImages, error } = await query

    if (error) {
      console.error("Error fetching carousel images:", error)
      return NextResponse.json(
        { error: "Error al obtener imágenes del carrusel", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ carouselImages })
  } catch (error) {
    console.error("Error in GET /api/carousel:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// POST - Create a new carousel image
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, image_url, description, cta_text, cta_link, order_index, active } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "El título es requerido" }, { status: 400 })
    }
    if (!image_url) {
      return NextResponse.json({ error: "La URL de la imagen es requerida" }, { status: 400 })
    }

    const { data: carouselImage, error } = await supabase
      .from("carousel_images")
      .insert({
        title,
        image_url,
        description: description || null,
        cta_text: cta_text || null,
        cta_link: cta_link || null,
        order_index: order_index !== undefined ? order_index : 0,
        active: active !== undefined ? active : true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating carousel image:", error)
      return NextResponse.json(
        { error: "Error al crear imagen del carrusel", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ carouselImage }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/carousel:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
