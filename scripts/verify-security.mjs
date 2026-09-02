#!/usr/bin/env node

try {
  process.loadEnvFile(".env.local")
} catch {
  // CI and deployment environments provide variables directly.
}

const baseUrl = (process.env.TARGET_BASE_URL || "").replace(/\/$/, "")
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "")
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!baseUrl || !supabaseUrl || !anonKey) {
  console.error(
    "Required: TARGET_BASE_URL, NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY"
  )
  process.exit(1)
}

const failures = []

async function check(name, request, validate) {
  try {
    const response = await fetch(request.url, request.init)
    const error = validate(response)

    if (error) {
      failures.push(`${name}: ${error}`)
      console.error(`FAIL ${name}: ${error}`)
      return
    }

    console.log(`PASS ${name}: HTTP ${response.status}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    failures.push(`${name}: ${message}`)
    console.error(`FAIL ${name}: ${message}`)
  }
}

function expectDenied(response) {
  return response.status === 401 || response.status === 403
    ? null
    : `expected 401/403, received ${response.status}`
}

function expectDeniedAndNoStore(response) {
  const deniedError = expectDenied(response)
  if (deniedError) return deniedError

  const cacheControl = response.headers.get("cache-control") || ""
  return cacheControl.includes("no-store")
    ? null
    : `missing no-store cache directive (${cacheControl || "no header"})`
}

const anonHeaders = {
  apikey: anonKey,
  Authorization: `Bearer ${anonKey}`,
}

await check(
  "anonymous order-book request",
  { url: `${baseUrl}/api/orders`, init: { method: "HEAD" } },
  expectDeniedAndNoStore
)

await check(
  "anonymous single-order request",
  {
    url: `${baseUrl}/api/orders/security-probe-not-a-real-order`,
    init: { method: "GET" },
  },
  expectDeniedAndNoStore
)

await check(
  "anonymous order update",
  {
    url: `${baseUrl}/api/orders/security-probe-not-a-real-order`,
    init: {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pending" }),
    },
  },
  expectDeniedAndNoStore
)

for (const table of ["orders", "order_items", "admin_users"]) {
  await check(
    `anonymous Supabase ${table} read`,
    {
      url: `${supabaseUrl}/rest/v1/${table}?select=id&limit=1`,
      init: { method: "HEAD", headers: anonHeaders },
    },
    expectDenied
  )
}

if (failures.length > 0) {
  console.error(`\nSecurity verification failed (${failures.length} check(s)).`)
  process.exit(1)
}

console.log("\nAll anonymous-access security checks passed.")
