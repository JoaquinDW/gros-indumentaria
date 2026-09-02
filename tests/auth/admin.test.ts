import { beforeEach, describe, expect, it, vi } from "vitest"

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}))

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}))

import { requireAdmin } from "@/lib/auth/admin"

function createSupabaseMock({
  user = null,
  userError = null,
  adminUser = null,
  adminError = null,
}: {
  user?: { id: string } | null
  userError?: unknown
  adminUser?: { user_id: string } | null
  adminError?: unknown
}) {
  const membershipQuery = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: adminUser,
      error: adminError,
    }),
  }

  membershipQuery.select.mockReturnValue(membershipQuery)
  membershipQuery.eq.mockReturnValue(membershipQuery)

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: userError,
      }),
    },
    from: vi.fn().mockReturnValue(membershipQuery),
  }
}

describe("requireAdmin", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects an unauthenticated request and prevents caching", async () => {
    const supabase = createSupabaseMock({})
    createClientMock.mockResolvedValue(supabase)

    const result = await requireAdmin()

    expect(result.authorized).toBe(false)
    if (result.authorized) throw new Error("Expected authorization to fail")

    expect(result.response.status).toBe(401)
    expect(result.response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    )
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it("rejects a signed-in user without an admin membership", async () => {
    const supabase = createSupabaseMock({ user: { id: "user-1" } })
    createClientMock.mockResolvedValue(supabase)

    const result = await requireAdmin()

    expect(result.authorized).toBe(false)
    if (result.authorized) throw new Error("Expected authorization to fail")
    expect(result.response.status).toBe(403)
  })

  it("fails closed when the admin lookup fails", async () => {
    const supabase = createSupabaseMock({
      user: { id: "user-1" },
      adminError: { message: "database unavailable" },
    })
    createClientMock.mockResolvedValue(supabase)

    const result = await requireAdmin()

    expect(result.authorized).toBe(false)
    if (result.authorized) throw new Error("Expected authorization to fail")
    expect(result.response.status).toBe(500)
  })

  it("authorizes only a server-validated admin membership", async () => {
    const supabase = createSupabaseMock({
      user: { id: "admin-1" },
      adminUser: { user_id: "admin-1" },
    })
    createClientMock.mockResolvedValue(supabase)

    const result = await requireAdmin()

    expect(result.authorized).toBe(true)
    if (!result.authorized) throw new Error("Expected authorization to pass")
    expect(result.supabase).toBe(supabase)
    expect(supabase.auth.getUser).toHaveBeenCalledOnce()
    expect(supabase.from).toHaveBeenCalledWith("admin_users")
  })
})
