import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Get all products for a specific club
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get club_products with full product details
    const { data: clubProducts, error } = await supabase
      .from("club_products")
      .select(`
        id,
        order_index,
        product_id,
        products (
          id,
          name,
          category,
          description,
          price,
          image_url,
          sizes,
          colors,
          fabrics,
          active,
          lead_time,
          created_at,
          updated_at
        )
      `)
      .eq("club_id", id)
      .order("order_index", { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener productos del club", details: error.message },
        { status: 500 }
      )
    }

    // Transform the data to a cleaner format
    const products = clubProducts?.map((cp: any) => ({
      ...cp.products,
      club_product_id: cp.id,
      order_index: cp.order_index,
    })) || []

    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}

// POST - Add product(s) to a club
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { product_ids } = body // Expecting an array of product IDs

    if (!product_ids || !Array.isArray(product_ids) || product_ids.length === 0) {
      return NextResponse.json(
        { error: "Se requiere un array de product_ids" },
        { status: 400 }
      )
    }

    // Prepare insert data
    const insertData = product_ids.map((product_id, index) => ({
      club_id: parseInt(id),
      product_id,
      order_index: index,
    }))

    const { data: clubProducts, error } = await supabase
      .from("club_products")
      .insert(insertData)
      .select()

    if (error) {
      // Check for unique constraint violation
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Uno o más productos ya están asignados a este club" },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Error al agregar productos al club", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ clubProducts }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}

// DELETE - Remove product from club
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("product_id")

    if (!productId) {
      return NextResponse.json(
        { error: "Se requiere product_id como parámetro de búsqueda" },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from("club_products")
      .delete()
      .eq("club_id", id)
      .eq("product_id", productId)

    if (error) {
      return NextResponse.json(
        { error: "Error al eliminar producto del club", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Producto eliminado del club exitosamente" })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
