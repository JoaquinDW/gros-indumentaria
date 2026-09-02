import { requireAdmin } from "@/lib/auth/admin"
import { noStoreJson } from "@/lib/http/no-store-json"

export const dynamic = "force-dynamic"

/**
 * Orders API - Get all orders (admin only)
 */
export async function GET() {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const { supabase } = authorization

    // Get all orders, sorted by most recent first
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching orders:", error)
      return noStoreJson(
        { error: "Error al obtener pedidos" },
        { status: 500 }
      )
    }

    return noStoreJson({ orders })
  } catch (error) {
    console.error("Error in orders API:", error)
    return noStoreJson(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
