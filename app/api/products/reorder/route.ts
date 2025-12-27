import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PATCH - Reorder products
export async function PATCH(request: NextRequest) {
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
    const { productOrders } = body

    // Validate required fields
    if (!Array.isArray(productOrders)) {
      return NextResponse.json(
        { error: "Se requiere un array de productOrders" },
        { status: 400 }
      )
    }

    // Update each product's order_index
    const updates = productOrders.map(async ({ id, order_index }) => {
      const { error } = await supabase
        .from("products")
        .update({ order_index })
        .eq("id", id)

      if (error) throw error
    })

    await Promise.all(updates)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("Error in PATCH /api/products/reorder:", error)
    return NextResponse.json(
      {
        error: "Error al reordenar productos",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
