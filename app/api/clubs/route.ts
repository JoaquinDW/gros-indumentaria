import { type NextRequest, NextResponse } from "next/server"
import { getAdminContext, requireAdmin } from "@/lib/auth/admin"

// GET - List all clubs or filter by type
export async function GET(request: NextRequest) {
  try {
    const { supabase, isAdmin } = await getAdminContext()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'club' or 'organization'

    let query = supabase
      .from("clubs")
      .select("*")
      .order("order_index", { ascending: true })

    // Non-admin callers only see active clubs.
    if (!isAdmin) {
      query = query.eq("active", true)
    }

    // Filter by client_type if specified
    if (type === 'club' || type === 'organization') {
      query = query.eq("client_type", type)
    }

    const { data: clubs, error } = await query

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener clubes", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ clubs })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}

// POST - Create a new club
export async function POST(request: NextRequest) {
  try {
    const authorization = await requireAdmin()
    if (!authorization.authorized) return authorization.response

    const { supabase } = authorization

    const body = await request.json()
    const { name, slug, description, logo_url, order_index, active, client_type, background_type, background_value, background_image_url, email } = body

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Generate slug from name if not provided
    const clubSlug = slug || name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, "") // Remove leading/trailing hyphens

    const { data: club, error } = await supabase
      .from("clubs")
      .insert({
        name,
        slug: clubSlug,
        description: description || null,
        logo_url: logo_url || null,
        order_index: order_index || 0,
        active: active !== undefined ? active : true,
        client_type: client_type || 'club',
        background_type: background_type || 'color',
        background_value: background_value || '#1a1a1a',
        background_image_url: background_image_url || null,
        email: email || null,
      })
      .select()
      .single()

    if (error) {
      // Check for unique constraint violation on slug
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Ya existe un club con ese nombre o identificador" },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: "Error al crear club", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ club }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}
