import { type NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"

/**
 * Mercado Pago Webhook Handler
 * Receives payment notifications from Mercado Pago and saves them as source of truth
 * Documentation: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get the notification data
    const body = await request.json()

    console.log("Mercado Pago Webhook received:", JSON.stringify(body, null, 2))

    // Validate access token
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken || accessToken === "YOUR_ACCESS_TOKEN_HERE") {
      console.error("Mercado Pago access token not configured")
      return NextResponse.json({ error: "Not configured" }, { status: 500 })
    }

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Process the notification based on type
    const { type, data } = body

    if (type === "payment") {
      // Initialize Mercado Pago SDK
      const client = new MercadoPagoConfig({
        accessToken: accessToken,
      })

      const payment = new Payment(client)

      // Get payment details from Mercado Pago
      const paymentId = data.id
      const paymentInfo = await payment.get({ id: paymentId })

      console.log("Payment info:", JSON.stringify(paymentInfo, null, 2))

      const {
        status,
        status_detail,
        external_reference,
        transaction_amount,
        metadata,
        payer,
        additional_info,
      } = paymentInfo

      console.log(`Payment ${paymentId} - Status: ${status}, Detail: ${status_detail}`)
      console.log(`Order Reference: ${external_reference}, Amount: ${transaction_amount}`)

      // Check if order already exists
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("*")
        .eq("external_reference", external_reference)
        .single()

      if (existingOrder) {
        // Update existing order
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            mercado_pago_payment_id: paymentId,
            payment_status: status,
            payment_status_detail: status_detail,
            transaction_amount: transaction_amount,
            status: mapPaymentStatusToOrderStatus(status),
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingOrder.id)

        if (updateError) {
          console.error("Error updating order:", updateError)
          throw updateError
        }

        console.log(`✅ Order ${existingOrder.order_number} updated with payment status: ${status}`)
      } else {
        // Create new order from webhook data (this is the source of truth)
        const items = additional_info?.items || []

        const { data: newOrder, error: insertError } = await supabase
          .from("orders")
          .insert({
            order_number: external_reference || `ORDER-${paymentId}`,
            customer_name: metadata?.customer_name || payer?.first_name || "N/A",
            customer_email: metadata?.customer_email || payer?.email || "N/A",
            customer_phone: metadata?.customer_phone || payer?.phone?.number || "",
            customer_address: metadata?.customer_address || "",
            customer_province: metadata?.customer_province || "",
            items: items,
            total_amount: transaction_amount,
            mercado_pago_payment_id: paymentId,
            payment_status: status,
            payment_status_detail: status_detail,
            external_reference: external_reference,
            transaction_amount: transaction_amount,
            status: mapPaymentStatusToOrderStatus(status),
            payment_method: "mercado_pago",
            notes: metadata?.customer_notes || "",
            delivery_method: metadata?.delivery_method || "correo",
            club_id: metadata?.club_id ? parseInt(metadata.club_id) : null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) {
          console.error("Error creating order:", insertError)
          throw insertError
        }

        console.log(`✅ New order created: ${newOrder?.order_number}`)
      }

      // Handle different payment statuses for additional actions
      switch (status) {
        case "approved":
          console.log("✅ Payment approved!")
          // TODO: Send confirmation email
          // TODO: Update inventory
          break

        case "pending":
          console.log("⏳ Payment pending")
          break

        case "rejected":
          console.log("❌ Payment rejected")
          break

        case "cancelled":
          console.log("🚫 Payment cancelled")
          break

        case "refunded":
          console.log("💸 Payment refunded")
          // TODO: Restore inventory
          break

        default:
          console.log(`ℹ️ Payment status: ${status}`)
      }

      return NextResponse.json({ success: true, status })
    }

    // Return success for other notification types
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    // Always return 200 to avoid Mercado Pago retrying the webhook
    return NextResponse.json({ error: "Internal error", success: false }, { status: 200 })
  }
}

/**
 * Maps Mercado Pago payment status to order status
 */
function mapPaymentStatusToOrderStatus(paymentStatus: string): string {
  const statusMap: Record<string, string> = {
    approved: "paid",
    pending: "pending",
    in_process: "pending",
    rejected: "rejected",
    cancelled: "cancelled",
    refunded: "refunded",
    charged_back: "refunded",
  }

  return statusMap[paymentStatus] || "pending"
}

// Optionally handle GET requests (for webhook verification)
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint is active" })
}
