import { NextResponse } from "next/server"

const PRIVATE_NO_STORE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Expires: "0",
  Pragma: "no-cache",
}

export function noStoreJson(
  body: unknown,
  init: ResponseInit = {}
) {
  const headers = new Headers(init.headers)

  for (const [name, value] of Object.entries(PRIVATE_NO_STORE_HEADERS)) {
    headers.set(name, value)
  }

  return NextResponse.json(body, { ...init, headers })
}
