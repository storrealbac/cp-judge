"user server"

import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  // Get individual params using searchParams.get()
  const token = searchParams.get("token")
  
  if (token !== process.env.JUDGE0_PRIVATE_TOKEN) {
    return Response.json({
      error: "Unauthorized"
    }, { status: 401 })
  }

  return Response.json({ 
    ok: true,
  })
}