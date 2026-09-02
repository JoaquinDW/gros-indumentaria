import { type NextRequest } from "next/server"
import { notifyRelatedClubs, sendAdminNotification, sendCustomerNotification } from "@/lib/email"
import { requireAdmin } from "@/lib/auth/admin"
import { noStoreJson } from "@/lib/http/no-store-json"

export const dynamic = "force-dynamic"

const ALLOWED_ORDER_STATUSES = new Set([
  "pending",
  "approved",
  "in_production",
  "shipped",
  "delivered",
  "rejected",
])

function isValidOrderId(id: string) {
  return /^\d+$/.test(id) && Number.isSafeInteger(Number(id)) && Number(id) > 0
}

/**
 * Get a specific order by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const { supabase } = authorization
    const { id } = await params

    if (!isValidOrderId(id)) {
      return noStoreJson({ error: "ID de pedido inválido" }, { status: 400 })
    }

    // Get order by ID
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching order:", error)
      return noStoreJson({ error: "Pedido no encontrado" }, { status: 404 })
    }

    return noStoreJson({ order })
  } catch (error) {
    console.error("Error in order API:", error)
    return noStoreJson(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * Update order status (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const { supabase } = authorization
    const { id } = await params

    if (!isValidOrderId(id)) {
      return noStoreJson({ error: "ID de pedido inválido" }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const newStatus = body?.status

    if (typeof newStatus !== "string" || !ALLOWED_ORDER_STATUSES.has(newStatus)) {
      return noStoreJson(
        { error: "Estado de pedido inválido" },
        { status: 400 }
      )
    }

    // Get current order to check for status change
    const { data: currentOrder, error: currentOrderError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .single()

    if (currentOrderError || !currentOrder) {
      return noStoreJson({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const oldStatus = currentOrder?.status

    // Update order
    const { data: order, error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating order:", error)
      return noStoreJson(
        { error: "Error al actualizar el pedido" },
        { status: 500 }
      )
    }

    // If status changed, notify related clubs and customer
    if (newStatus && oldStatus !== newStatus && order) {
      try {
        // Never notify clubs when status is "pending"
        if (newStatus !== "pending") {
          await notifyRelatedClubs(order, "status_change", supabase, newStatus)
        }
        // Notify customer
        await sendCustomerNotification(order, "status_change", newStatus)
        // Notify GROS admin
        await sendAdminNotification(order, "status_change", newStatus)
      } catch (emailError) {
        console.error("Error sending status notifications:", emailError)
      }
    }

    return noStoreJson({ order })
  } catch (error) {
    console.error("Error in order update API:", error)
    return noStoreJson(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
