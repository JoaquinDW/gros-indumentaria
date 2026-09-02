import { NextRequest } from "next/server"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { noStoreJson } from "@/lib/http/no-store-json"

const { requireAdminMock, notificationMocks } = vi.hoisted(() => ({
  requireAdminMock: vi.fn(),
  notificationMocks: {
    notifyRelatedClubs: vi.fn(),
    sendAdminNotification: vi.fn(),
    sendCustomerNotification: vi.fn(),
  },
}))

vi.mock("@/lib/auth/admin", () => ({
  requireAdmin: requireAdminMock,
}))

vi.mock("@/lib/email", () => notificationMocks)

import { GET as getOrders } from "@/app/api/orders/route"
import { PATCH as patchOrder } from "@/app/api/orders/[id]/route"

function unauthorizedResult() {
  return {
    authorized: false as const,
    response: noStoreJson({ error: "No autorizado" }, { status: 401 }),
  }
}

describe("orders API security", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("rejects anonymous order-book reads", async () => {
    requireAdminMock.mockResolvedValue(unauthorizedResult())

    const response = await getOrders()

    expect(response.status).toBe(401)
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    )
  })

  it("returns admin order-book reads with private no-store headers", async () => {
    const query = {
      select: vi.fn(),
      order: vi.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
    }
    query.select.mockReturnValue(query)
    const supabase = { from: vi.fn().mockReturnValue(query) }
    requireAdminMock.mockResolvedValue({
      authorized: true,
      supabase,
      user: { id: "admin-1" },
    })

    const response = await getOrders()

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toBe(
      "private, no-store, max-age=0"
    )
    expect(supabase.from).toHaveBeenCalledWith("orders")
  })

  it("rejects anonymous order updates before reading the request body", async () => {
    requireAdminMock.mockResolvedValue(unauthorizedResult())
    const request = new NextRequest("http://localhost/api/orders/1", {
      method: "PATCH",
      body: JSON.stringify({ status: "approved" }),
    })
    const jsonSpy = vi.spyOn(request, "json")

    const response = await patchOrder(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(401)
    expect(jsonSpy).not.toHaveBeenCalled()
  })

  it("rejects unknown statuses", async () => {
    const supabase = { from: vi.fn() }
    requireAdminMock.mockResolvedValue({
      authorized: true,
      supabase,
      user: { id: "admin-1" },
    })
    const request = new NextRequest("http://localhost/api/orders/1", {
      method: "PATCH",
      body: JSON.stringify({ status: "attacker-controlled" }),
    })

    const response = await patchOrder(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(400)
    expect(supabase.from).not.toHaveBeenCalled()
  })

  it("allowlists the status field and ignores mass-assignment input", async () => {
    let updatePayload: Record<string, unknown> | undefined
    const updatedOrder = { id: 1, status: "approved" }
    const supabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { status: "pending" },
              error: null,
            }),
          }),
        }),
        update: vi.fn((payload: Record<string, unknown>) => {
          updatePayload = payload
          return {
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: updatedOrder,
                  error: null,
                }),
              }),
            }),
          }
        }),
      }),
    }
    requireAdminMock.mockResolvedValue({
      authorized: true,
      supabase,
      user: { id: "admin-1" },
    })
    const request = new NextRequest("http://localhost/api/orders/1", {
      method: "PATCH",
      body: JSON.stringify({
        status: "approved",
        customer_email: "attacker@example.com",
        total_amount: 1,
      }),
    })

    const response = await patchOrder(request, {
      params: Promise.resolve({ id: "1" }),
    })

    expect(response.status).toBe(200)
    expect(updatePayload).toMatchObject({ status: "approved" })
    expect(updatePayload).not.toHaveProperty("customer_email")
    expect(updatePayload).not.toHaveProperty("total_amount")
    expect(Object.keys(updatePayload ?? {}).sort()).toEqual([
      "status",
      "updated_at",
    ])
  })
})
