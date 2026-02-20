import { Resend } from "resend"

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  approved: "Aprobado",
  in_production: "En producción",
  shipped: "Enviado",
  delivered: "Entregado",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
}

interface OrderItem {
  title?: string
  name?: string
  quantity: number
  unit_price?: number
  price?: number
}

interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  customer_address?: string
  items: OrderItem[]
  total_amount: number
  status: string
  delivery_method?: string
  club_id?: number
  notes?: string
}

interface Club {
  id: number
  name: string
  email: string
}

function formatOrderItems(items: OrderItem[]): string {
  if (!items || items.length === 0) return "<p>Sin productos especificados</p>"

  return `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e5e7eb;">Producto</th>
          <th style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">Cantidad</th>
          <th style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">Precio</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${item.title || item.name || "Producto"}</td>
            <td style="padding: 8px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
            <td style="padding: 8px; text-align: right; border-bottom: 1px solid #e5e7eb;">$${item.unit_price || item.price || "-"}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `
}

function getClubEmailTemplate(type: "new_order" | "status_change", order: Order, club: Club, newStatus?: string): { subject: string; html: string } {
  const statusLabel = STATUS_LABELS[newStatus || order.status] || order.status

  if (type === "new_order") {
    return {
      subject: `Nueva orden #${order.order_number} - ${club.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #C43A2F; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">GROS Indumentaria</h1>
          </div>

          <div style="padding: 20px; background-color: #ffffff;">
            <h2 style="color: #333;">Nueva Orden Recibida</h2>
            <p>Hola <strong>${club.name}</strong>,</p>
            <p>Se ha recibido una nueva orden con productos relacionados a tu club.</p>

            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Número de Orden:</strong> ${order.order_number}</p>
              <p style="margin: 4px 0;"><strong>Cliente:</strong> ${order.customer_name}</p>
              <p style="margin: 4px 0;"><strong>Email:</strong> ${order.customer_email}</p>
              ${order.customer_phone ? `<p style="margin: 4px 0;"><strong>Teléfono:</strong> ${order.customer_phone}</p>` : ""}
              <p style="margin: 4px 0;"><strong>Total:</strong> $${order.total_amount}</p>
              <p style="margin: 4px 0;"><strong>Estado:</strong> ${statusLabel}</p>
            </div>

            <h3 style="color: #333;">Productos:</h3>
            ${formatOrderItems(order.items)}

            ${order.notes ? `<p style="margin-top: 16px;"><strong>Notas:</strong> ${order.notes}</p>` : ""}
          </div>

          <div style="padding: 16px; background-color: #f3f4f6; text-align: center; font-size: 12px; color: #6b7280;">
            <p>Este es un email automático de GROS Indumentaria.</p>
          </div>
        </div>
      `
    }
  }

  // status_change
  return {
    subject: `Orden #${order.order_number} - Estado actualizado: ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #C43A2F; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GROS Indumentaria</h1>
        </div>

        <div style="padding: 20px; background-color: #ffffff;">
          <h2 style="color: #333;">Actualización de Orden</h2>
          <p>Hola <strong>${club.name}</strong>,</p>
          <p>El estado de una orden relacionada a tu club ha cambiado.</p>

          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Número de Orden:</strong> ${order.order_number}</p>
            <p style="margin: 4px 0;"><strong>Cliente:</strong> ${order.customer_name}</p>
            <p style="margin: 4px 0;"><strong>Nuevo Estado:</strong> <span style="color: #C43A2F; font-weight: bold;">${statusLabel}</span></p>
          </div>

          <h3 style="color: #333;">Productos:</h3>
          ${formatOrderItems(order.items)}
        </div>

        <div style="padding: 16px; background-color: #f3f4f6; text-align: center; font-size: 12px; color: #6b7280;">
          <p>Este es un email automático de GROS Indumentaria.</p>
        </div>
      </div>
    `
  }
}

function getCustomerEmailTemplate(type: "new_order" | "status_change", order: Order, newStatus?: string): { subject: string; html: string } {
  const statusLabel = STATUS_LABELS[newStatus || order.status] || order.status

  if (type === "new_order") {
    return {
      subject: `Confirmación de tu pedido #${order.order_number} - GROS Indumentaria`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #C43A2F; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">GROS Indumentaria</h1>
          </div>

          <div style="padding: 20px; background-color: #ffffff;">
            <h2 style="color: #333;">¡Gracias por tu compra!</h2>
            <p>Hola <strong>${order.customer_name}</strong>,</p>
            <p>Hemos recibido tu pedido y ya estamos trabajando en él.</p>

            <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Número de Pedido:</strong> ${order.order_number}</p>
              <p style="margin: 4px 0;"><strong>Total:</strong> $${order.total_amount}</p>
              <p style="margin: 4px 0;"><strong>Estado:</strong> ${statusLabel}</p>
              ${order.delivery_method === "club" ? `<p style="margin: 4px 0;"><strong>Retiro:</strong> En tu club</p>` : `<p style="margin: 4px 0;"><strong>Envío a:</strong> ${order.customer_address || "Dirección no especificada"}</p>`}
            </div>

            <h3 style="color: #333;">Detalle de tu pedido:</h3>
            ${formatOrderItems(order.items)}

            ${order.notes ? `<p style="margin-top: 16px;"><strong>Notas:</strong> ${order.notes}</p>` : ""}

            <p style="margin-top: 24px;">Te notificaremos cuando tu pedido cambie de estado.</p>
          </div>

          <div style="padding: 16px; background-color: #f3f4f6; text-align: center; font-size: 12px; color: #6b7280;">
            <p>Si tenés alguna consulta, respondé a este email o contactanos.</p>
            <p>GROS Indumentaria</p>
          </div>
        </div>
      `
    }
  }

  // status_change
  return {
    subject: `Tu pedido #${order.order_number} está ${statusLabel.toLowerCase()} - GROS Indumentaria`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #C43A2F; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">GROS Indumentaria</h1>
        </div>

        <div style="padding: 20px; background-color: #ffffff;">
          <h2 style="color: #333;">Actualización de tu pedido</h2>
          <p>Hola <strong>${order.customer_name}</strong>,</p>
          <p>Tu pedido ha sido actualizado.</p>

          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Número de Pedido:</strong> ${order.order_number}</p>
            <p style="margin: 4px 0;"><strong>Nuevo Estado:</strong> <span style="color: #C43A2F; font-weight: bold;">${statusLabel}</span></p>
          </div>

          <h3 style="color: #333;">Detalle de tu pedido:</h3>
          ${formatOrderItems(order.items)}

          ${newStatus === "shipped" ? `<p style="margin-top: 16px; color: #059669;"><strong>¡Tu pedido está en camino!</strong></p>` : ""}
          ${newStatus === "delivered" ? `<p style="margin-top: 16px; color: #059669;"><strong>¡Tu pedido fue entregado! Esperamos que lo disfrutes.</strong></p>` : ""}
        </div>

        <div style="padding: 16px; background-color: #f3f4f6; text-align: center; font-size: 12px; color: #6b7280;">
          <p>Si tenés alguna consulta, respondé a este email o contactanos.</p>
          <p>GROS Indumentaria</p>
        </div>
      </div>
    `
  }
}

export async function sendCustomerNotification(
  order: Order,
  type: "new_order" | "status_change",
  newStatus?: string
): Promise<{ success: boolean; error?: string }> {
  if (!order.customer_email) {
    console.log(`Order ${order.order_number} has no customer email, skipping notification`)
    return { success: true }
  }

  const resend = getResendClient()
  if (!resend) {
    console.error("RESEND_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const { subject, html } = getCustomerEmailTemplate(type, order, newStatus)

    const { data, error } = await resend.emails.send({
      from: "GROS Indumentaria <notificaciones@gros.website>",
      to: order.customer_email,
      subject,
      html,
    })

    if (error) {
      console.error(`Failed to send email to customer ${order.customer_email}:`, error)
      return { success: false, error: error.message }
    }

    console.log(`Email sent to customer ${order.customer_email} - ID: ${data?.id}`)
    return { success: true }
  } catch (error) {
    console.error(`Error sending email to customer ${order.customer_email}:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendClubNotification(
  club: Club,
  order: Order,
  type: "new_order" | "status_change",
  newStatus?: string
): Promise<{ success: boolean; error?: string }> {
  if (!club.email) {
    console.log(`Club ${club.name} has no email configured, skipping notification`)
    return { success: true }
  }

  const resend = getResendClient()
  if (!resend) {
    console.error("RESEND_API_KEY not configured")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const { subject, html } = getClubEmailTemplate(type, order, club, newStatus)

    const { data, error } = await resend.emails.send({
      from: "GROS Indumentaria <notificaciones@gros.website>",
      to: club.email,
      subject,
      html,
    })

    if (error) {
      console.error(`Failed to send email to ${club.email}:`, error)
      return { success: false, error: error.message }
    }

    console.log(`Email sent to ${club.email} (${club.name}) - ID: ${data?.id}`)
    return { success: true }
  } catch (error) {
    console.error(`Error sending email to ${club.email}:`, error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function notifyRelatedClubs(
  order: Order,
  type: "new_order" | "status_change",
  supabase: any,
  newStatus?: string
): Promise<void> {
  const clubIds = new Set<number>()

  // 1. Add club_id if order has delivery to club
  if (order.club_id) {
    clubIds.add(order.club_id)
  }

  // 2. Find clubs related to products in the order via club_products
  if (order.items && order.items.length > 0) {
    // Extract product IDs from order items
    const productIds = order.items
      .map((item: any) => item.product_id || item.id)
      .filter((id: any) => id != null)

    if (productIds.length > 0) {
      const { data: clubProducts, error } = await supabase
        .from("club_products")
        .select("club_id")
        .in("product_id", productIds)

      if (!error && clubProducts) {
        for (const cp of clubProducts) {
          clubIds.add(cp.club_id)
        }
      }
    }
  }

  if (clubIds.size === 0) {
    console.log("No related clubs found for order", order.order_number)
    return
  }

  // 3. Fetch clubs with emails
  const { data: clubs, error: clubsError } = await supabase
    .from("clubs")
    .select("id, name, email")
    .in("id", Array.from(clubIds))
    .not("email", "is", null)

  if (clubsError) {
    console.error("Error fetching clubs:", clubsError)
    return
  }

  // 4. Send notifications to each club
  for (const club of clubs || []) {
    if (club.email) {
      await sendClubNotification(club, order, type, newStatus)
    }
  }
}
