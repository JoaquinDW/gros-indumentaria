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

    let query = supabase.from("products").select("*").order("order_index", { ascending: true })

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
      price_on_request,
      image_url,
      images,
      sizes,
      fabrics,
      lead_time,
      active,
      name_field_enabled,
      number_field_enabled,
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
    // Validate price: required only if price_on_request is false
    if (!price_on_request && (price === undefined || price === null)) {
      return NextResponse.json(
        { error: "El precio es requerido" },
        { status: 400 }
      )
    }

    // Validate images array if provided
    if (images && (!Array.isArray(images) || images.length > 5)) {
      return NextResponse.json(
        { error: "Las imágenes deben ser un array de máximo 5 elementos" },
        { status: 400 }
      )
    }

    // Build images array: use images if provided, otherwise create from image_url for backward compatibility
    const productImages = images || (image_url ? [image_url] : [])

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name,
        category,
        description: description || null,
        price: price_on_request ? null : price,
        price_on_request: price_on_request || false,
        image_url: productImages[0] || null, // Keep first image in image_url for backward compatibility
        images: productImages,
        sizes: sizes || [],
        fabrics: fabrics || {},
        lead_time: lead_time || "7-10 días",
        active: active !== undefined ? active : true,
        name_field_enabled: name_field_enabled || false,
        number_field_enabled: number_field_enabled || false,
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
