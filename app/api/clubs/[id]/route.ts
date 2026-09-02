import { type NextRequest, NextResponse } from "next/server"
import { getAdminContext, requireAdmin } from "@/lib/auth/admin"

// PATCH - Update a club
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const { supabase } = authorization

    const { id } = await params
    const body = await request.json()

    // Extract allowed fields
    const { name, slug, description, logo_url, order_index, active, client_type, background_type, background_value, background_image_url, email } = body

    const updateData: any = {}

    if (name !== undefined) updateData.name = name
    if (slug !== undefined) {
      // Generate slug from name if slug is empty, otherwise normalize provided slug
      const slugToUse = slug || (name !== undefined ? name : '')
      if (slugToUse) {
        updateData.slug = slugToUse
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      }
    }
    if (description !== undefined) updateData.description = description
    if (logo_url !== undefined) updateData.logo_url = logo_url
    if (order_index !== undefined) updateData.order_index = order_index
    if (active !== undefined) updateData.active = active
    if (client_type !== undefined) updateData.client_type = client_type
    if (background_type !== undefined) updateData.background_type = background_type
    if (background_value !== undefined) updateData.background_value = background_value
    if (background_image_url !== undefined) updateData.background_image_url = background_image_url
    if (email !== undefined) updateData.email = email

    const { data: club, error } = await supabase
      .from("clubs")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      // Check for unique constraint violation on slug
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un club con ese identificador" },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Error al actualizar club", details: error.message },
        { status: 500 }
      )
    }

    if (!club) {
      return NextResponse.json({ error: "Club no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ club })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a club
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const { supabase } = authorization

    const { id } = await params

    const { error } = await supabase.from("clubs").delete().eq("id", id)

    if (error) {
      return NextResponse.json(
        { error: "Error al eliminar club", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: "Club eliminado exitosamente" })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}

// GET - Get a single club by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase, isAdmin } = await getAdminContext()
    const { id } = await params

    let query = supabase
      .from("clubs")
      .select("*")
      .eq("id", id)

    if (!isAdmin) {
      query = query.eq("active", true)
    }

    const { data: club, error } = await query.single()

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener club", details: error.message },
        { status: 500 }
      )
    }

    if (!club) {
      return NextResponse.json({ error: "Club no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ club })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
