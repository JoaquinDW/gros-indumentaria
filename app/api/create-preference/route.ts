import { type NextRequest, NextResponse } from "next/server"
import { MercadoPagoConfig, Preference } from "mercadopago"

export async function POST(request: NextRequest) {
  try {
    const { items, customerData } = await request.json()

    // Validate access token
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    if (!accessToken || accessToken === "YOUR_ACCESS_TOKEN_HERE") {
      return NextResponse.json(
        {
          error: "Mercado Pago no está configurado. Por favor configura MERCADOPAGO_ACCESS_TOKEN en .env.local",
        },
        { status: 500 }
      )
    }

    // Initialize Mercado Pago SDK
    const client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: { timeout: 5000 },
    })

    const preference = new Preference(client)

    // Build items array for Mercado Pago
    const mpItems = items.map((item: any) => ({
      id: item.productId.toString(),
      title: `${item.name} (${item.size}, ${item.color})`,
      description: item.customText || "Sin personalización",
      picture_url: item.image,
      category_id: "clothing",
      quantity: item.quantity,
      currency_id: "ARS",
      unit_price: Number(item.price),
    }))

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const externalReference = `ORDER-${Date.now()}`

    // Create preference with all required data
    const preferenceData: any = {
      items: mpItems,
      payer: {
        name: customerData.name,
        email: customerData.email,
        phone: {
          area_code: "",
          number: customerData.phone,
        },
        address: {
          street_name: customerData.address || "N/A",
          zip_code: customerData.province || "N/A",
        },
      },
      back_urls: {
        success: `${baseUrl}/checkout/success?method=mercadopago&ref=${externalReference}`,
        failure: `${baseUrl}/checkout/error?ref=${externalReference}`,
        pending: `${baseUrl}/checkout/pending?ref=${externalReference}`,
      },
      auto_return: "approved",
      external_reference: externalReference,
      statement_descriptor: "GROS INDUMENTARIA",
      metadata: {
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        customer_address: customerData.address,
        customer_province: customerData.province,
        customer_notes: customerData.notes,
      },
    }

    // Only add notification_url if in production (localhost won't work)
    if (!baseUrl.includes("localhost")) {
      preferenceData.notification_url = `${baseUrl}/api/webhooks/mercadopago`
    }

    // Create the preference
    const response = await preference.create({ body: preferenceData })

    // Return the init_point (checkout URL)
    return NextResponse.json({
      id: response.id,
      redirectUrl: response.init_point,
      sandboxUrl: response.sandbox_init_point,
    })
  } catch (error) {
    console.error("Error creating preference:", error)
    return NextResponse.json(
      {
        error: "Error al procesar el pago. Por favor intenta nuevamente.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
