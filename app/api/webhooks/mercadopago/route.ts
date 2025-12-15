import { type NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Payment } from "mercadopago"

/**
 * Mercado Pago Webhook Handler
 * Receives payment notifications from Mercado Pago
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

    // Process the notification based on type
    const { type, data } = body

    if (type === "payment") {
      // Initialize Mercado Pago SDK
      const client = new MercadoPagoConfig({
        accessToken: accessToken,
      })

      const payment = new Payment(client)

      // Get payment details
      const paymentId = data.id
      const paymentInfo = await payment.get({ id: paymentId })

      console.log("Payment info:", JSON.stringify(paymentInfo, null, 2))

      // Here you would typically:
      // 1. Save payment info to database
      // 2. Update order status
      // 3. Send confirmation emails
      // 4. Trigger any business logic (inventory management, etc.)

      const { status, status_detail, external_reference, transaction_amount } = paymentInfo

      console.log(`Payment ${paymentId} - Status: ${status}, Detail: ${status_detail}`)
      console.log(`Order Reference: ${external_reference}, Amount: ${transaction_amount}`)

      // Example: Save to database (you'll need to implement this)
      // await savePaymentToDatabase({
      //   paymentId,
      //   status,
      //   statusDetail: status_detail,
      //   orderReference: external_reference,
      //   amount: transaction_amount,
      //   metadata: paymentInfo.metadata,
      // })

      // Handle different payment statuses
      switch (status) {
        case "approved":
          console.log("✅ Payment approved!")
          // TODO: Update order status to "paid"
          // TODO: Send confirmation email
          // TODO: Update inventory
          break

        case "pending":
          console.log("⏳ Payment pending")
          // TODO: Update order status to "pending"
          break

        case "rejected":
          console.log("❌ Payment rejected")
          // TODO: Update order status to "rejected"
          break

        case "cancelled":
          console.log("🚫 Payment cancelled")
          // TODO: Update order status to "cancelled"
          break

        case "refunded":
          console.log("💸 Payment refunded")
          // TODO: Update order status to "refunded"
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

// Optionally handle GET requests (for webhook verification)
export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint is active" })
}
