import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - List all products (admins see all, public sees only active)
export async function GET() {
  try {
    const supabase = await createClient()

    // Check if user is authenticated to determine query
    const {
      data: { session },
    } = await supabase.auth.getSession()

    let query = supabase.from("products").select("*").order("created_at", { ascending: false })

    // If not authenticated, only show active products
    if (!session) {
      query = query.eq("active", true)
    }

    const { data: products, error } = await query

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json(
        { error: "Error al obtener productos", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error in GET /api/products:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// POST - Create a new product
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
    const {
      name,
      category,
      description,
      price,
      image_url,
      sizes,
      colors,
      fabrics,
      lead_time,
      active,
    } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      )
    }
    if (!category) {
      return NextResponse.json(
        { error: "La categoría es requerida" },
        { status: 400 }
      )
    }
    if (price === undefined || price === null) {
      return NextResponse.json(
        { error: "El precio es requerido" },
        { status: 400 }
      )
    }

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name,
        category,
        description: description || null,
        price,
        image_url: image_url || null,
        sizes: sizes || [],
        colors: colors || [],
        fabrics: fabrics || [],
        lead_time: lead_time || "7-10 días",
        active: active !== undefined ? active : true,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json(
        { error: "Error al crear producto", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/products:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
