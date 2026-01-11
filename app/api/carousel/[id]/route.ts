import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PATCH - Update a carousel image
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, image_url, description, cta_text, cta_link, order_index, active } = body

    // Build update object with only provided fields
    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (image_url !== undefined) updateData.image_url = image_url
    if (description !== undefined) updateData.description = description
    if (cta_text !== undefined) updateData.cta_text = cta_text
    if (cta_link !== undefined) updateData.cta_link = cta_link
    if (order_index !== undefined) updateData.order_index = order_index
    if (active !== undefined) updateData.active = active
    updateData.updated_at = new Date().toISOString()

    const { data: carouselImage, error } = await supabase
      .from("carousel_images")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating carousel image:", error)
      return NextResponse.json(
        { error: "Error al actualizar imagen del carrusel", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ carouselImage })
  } catch (error) {
    console.error("Error in PATCH /api/carousel/[id]:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a carousel image
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params

    const { error } = await supabase.from("carousel_images").delete().eq("id", id)

    if (error) {
      console.error("Error deleting carousel image:", error)
      return NextResponse.json(
        { error: "Error al eliminar imagen del carrusel", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/carousel/[id]:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
