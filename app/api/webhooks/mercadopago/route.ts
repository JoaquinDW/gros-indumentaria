import { type NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"
import { createClient } from "@supabase/supabase-js"
import crypto from "crypto"
import { notifyRelatedClubs } from "@/lib/email"

/**
 * Validates MercadoPago webhook signature
 * Documentation: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
function validateWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): boolean {
  if (!xSignature || !xRequestId) {
    return false
  }

  // Parse x-signature header (format: "ts=...,v1=...")
  const parts = xSignature.split(",")
  let ts: string | null = null
  let hash: string | null = null

  for (const part of parts) {
    const [key, value] = part.split("=")
    if (key === "ts") ts = value
    if (key === "v1") hash = value
  }

  if (!ts || !hash) {
    return false
  }

  // Build the manifest string
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

  // Calculate HMAC-SHA256
  const calculatedHash = crypto
    .createHmac("sha256", secret)
    .update(manifest)
    .digest("hex")

  return calculatedHash === hash
}

/**
 * Mercado Pago Webhook Handler
 * Receives payment notifications from Mercado Pago and saves them as source of truth
 * Documentation: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    // Get headers for signature validation
    const xSignature = request.headers.get("x-signature")
    const xRequestId = request.headers.get("x-request-id")

    // Get the notification data
    const body = await request.json()

    console.log("Mercado Pago Webhook received:", JSON.stringify(body, null, 2))

    // Validate webhook signature if secret is configured
    const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET
    if (webhookSecret && webhookSecret !== "YOUR_WEBHOOK_SECRET_HERE") {
      const isValid = validateWebhookSignature(
        xSignature,
        xRequestId,
        body.data?.id?.toString() || "",
        webhookSecret
      )

      if (!isValid) {
        console.error("Invalid webhook signature")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
      console.log("Webhook signature validated successfully")
    } else {
      console.warn("Webhook signature validation skipped - MERCADOPAGO_WEBHOOK_SECRET not configured")
    }

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

      // Check if order already exists (should exist from create-preference)
      const { data: existingOrder, error: fetchError } = await supabase
        .from("orders")
        .select("*")
        .eq("external_reference", external_reference)
        .single()

      // Handle fetch errors (PGRST116 = not found, which is acceptable)
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching order:", fetchError)
        throw new Error(`Database fetch failed: ${fetchError.message}`)
      }

      const orderUpdateData = {
        mercado_pago_payment_id: paymentId,
        payment_status: status,
        payment_status_detail: status_detail,
        transaction_amount: transaction_amount,
        status: mapPaymentStatusToOrderStatus(status),
        updated_at: new Date().toISOString(),
      }

      if (existingOrder) {
        // Update existing order (normal flow - order created in create-preference)
        const { error: updateError } = await supabase
          .from("orders")
          .update(orderUpdateData)
          .eq("id", existingOrder.id)

        if (updateError) {
          console.error("Error updating order:", updateError)
          throw new Error(`Database update failed: ${updateError.message}`)
        }

        console.log(`✅ Order ${existingOrder.order_number} updated with payment status: ${status}`)
      } else {
        // Fallback: Create order if it doesn't exist (webhook arrived before create-preference finished)
        console.warn(`Order not found for ${external_reference}, creating from webhook data`)
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
            customer_locality: metadata?.customer_locality || "",
            items: items,
            total_amount: transaction_amount,
            external_reference: external_reference,
            payment_method: "mercado_pago",
            notes: metadata?.customer_notes || "",
            delivery_method: metadata?.delivery_method || "correo",
            club_id: metadata?.club_id ? parseInt(metadata.club_id) : null,
            created_at: new Date().toISOString(),
            ...orderUpdateData,
          })
          .select()
          .single()

        if (insertError) {
          console.error("Error creating order:", insertError)
          throw new Error(`Database insert failed: ${insertError.message}`)
        }

        console.log(`✅ New order created from webhook: ${newOrder?.order_number}`)
      }

      // Handle different payment statuses for additional actions
      switch (status) {
        case "approved":
          console.log("✅ Payment approved!")
          // Send notification to related clubs
          try {
            const { data: fullOrder } = await supabase
              .from("orders")
              .select("*")
              .eq("external_reference", external_reference)
              .single()

            if (fullOrder) {
              await notifyRelatedClubs(fullOrder, "new_order", supabase)
            }
          } catch (emailError) {
            console.error("Error sending club notifications:", emailError)
          }
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
    // Return 500 so MercadoPago retries the webhook (up to 3 times)
    return NextResponse.json(
      {
        error: "Internal server error",
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
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
