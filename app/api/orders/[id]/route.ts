import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { notifyRelatedClubs, sendCustomerNotification } from "@/lib/email"

/**
 * Get a specific order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get order by ID
    const { data: order, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching order:", error)
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error in order API:", error)
    return NextResponse.json(
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
    const { id } = await params
    const body = await request.json()

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current order to check for status change
    const { data: currentOrder } = await supabase
      .from("orders")
      .select("status")
      .eq("id", id)
      .single()

    const oldStatus = currentOrder?.status
    const newStatus = body.status

    // Update order
    const { data: order, error } = await supabase
      .from("orders")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating order:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If status changed, notify related clubs and customer
    if (newStatus && oldStatus !== newStatus && order) {
      try {
        // Notify related clubs
        await notifyRelatedClubs(order, "status_change", supabase, newStatus)
        // Notify customer
        await sendCustomerNotification(order, "status_change", newStatus)
      } catch (emailError) {
        console.error("Error sending status notifications:", emailError)
      }
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error("Error in order update API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
