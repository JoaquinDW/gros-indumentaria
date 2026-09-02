import type { User } from "@supabase/supabase-js"
import { noStoreJson } from "@/lib/http/no-store-json"
import { createClient } from "@/lib/supabase/server"

type ServerSupabaseClient = Awaited<ReturnType<typeof createClient>>

type AdminContext = {
  supabase: ServerSupabaseClient
  user: User | null
  isAdmin: boolean
  lookupFailed: boolean
}

export type AdminAuthorization =
  | {
      authorized: true
      supabase: ServerSupabaseClient
      user: User
    }
  | {
      authorized: false
      response: Response
    }

/**
 * Returns an authenticated admin context without granting access on errors.
 * Public endpoints can use this to decide whether inactive records may be shown.
 */
export async function getAdminContext(): Promise<AdminContext> {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { supabase, user: null, isAdmin: false, lookupFailed: false }
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle()

  if (adminError) {
    console.error("Unable to verify admin authorization:", adminError)
    return { supabase, user, isAdmin: false, lookupFailed: true }
  }

  return {
    supabase,
    user,
    isAdmin: Boolean(adminUser),
    lookupFailed: false,
  }
}

/**
 * Validates the Supabase user with the Auth server and then checks the
 * server-controlled admin_users table. Authorization always fails closed.
 */
export async function requireAdmin(): Promise<AdminAuthorization> {
  const context = await getAdminContext()

  if (!context.user) {
    return {
      authorized: false,
      response: noStoreJson({ error: "No autorizado" }, { status: 401 }),
    }
  }

  if (context.lookupFailed) {
    return {
      authorized: false,
      response: noStoreJson(
        { error: "No se pudo verificar la autorización" },
        { status: 500 }
      ),
    }
  }

  if (!context.isAdmin) {
    return {
      authorized: false,
      response: noStoreJson({ error: "Acceso prohibido" }, { status: 403 }),
    }
  }

  return {
    authorized: true,
    supabase: context.supabase,
    user: context.user,
  }
}
