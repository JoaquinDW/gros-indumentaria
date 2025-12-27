import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET - Get all clubs for a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id } = await params

    // Get club_products with full club details
    const { data: clubProducts, error } = await supabase
      .from("club_products")
      .select(`
        id,
        club_id,
        clubs (
          id,
          name,
          slug,
          description,
          logo_url,
          active
        )
      `)
      .eq("product_id", id)

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener clubes del producto", details: error.message },
        { status: 500 }
      )
    }

    // Transform the data to a cleaner format
    const clubs = clubProducts?.map((cp: any) => cp.clubs).filter(Boolean) || []

    return NextResponse.json({ clubs })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
