import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// PATCH - Update a product
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const {
      name,
      category,
      description,
      price,
      price_on_request,
      image_url,
      images,
      sizes,
      colors,
      fabrics,
      lead_time,
      active,
      name_field_enabled,
      number_field_enabled,
    } = body

    // Validate images array if provided
    if (images !== undefined && (!Array.isArray(images) || images.length > 5)) {
      return NextResponse.json(
        { error: "Las imágenes deben ser un array de máximo 5 elementos" },
        { status: 400 }
      )
    }

    // Build update object with only provided fields
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (category !== undefined) updateData.category = category
    if (description !== undefined) updateData.description = description

    // Handle price_on_request logic
    if (price_on_request !== undefined) {
      updateData.price_on_request = price_on_request
      // If price_on_request is true, set price to null
      if (price_on_request) {
        updateData.price = null
      }
    }

    // Only update price if provided and price_on_request is not true
    if (price !== undefined && !price_on_request) {
      updateData.price = price
    }

    // Handle images update
    if (images !== undefined) {
      updateData.images = images
      updateData.image_url = images[0] || null // Keep first image in image_url for backward compatibility
    } else if (image_url !== undefined) {
      updateData.image_url = image_url
      // Also update images array to include the new image_url
      updateData.images = image_url ? [image_url] : []
    }

    if (sizes !== undefined) updateData.sizes = sizes
    if (colors !== undefined) updateData.colors = colors
    if (fabrics !== undefined) updateData.fabrics = fabrics
    if (lead_time !== undefined) updateData.lead_time = lead_time
    if (active !== undefined) updateData.active = active
    if (name_field_enabled !== undefined) updateData.name_field_enabled = name_field_enabled
    if (number_field_enabled !== undefined) updateData.number_field_enabled = number_field_enabled
    updateData.updated_at = new Date().toISOString()

    const { data: product, error } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json(
        { error: "Error al actualizar producto", details: error.message },
        { status: 500 }
      )
    }

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error in PATCH /api/products/[id]:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json(
        { error: "Error al eliminar producto", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/products/[id]:", error)
    return NextResponse.json(
      {
        error: "Error al procesar la solicitud",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
