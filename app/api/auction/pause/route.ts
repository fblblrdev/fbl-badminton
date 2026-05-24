import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth-helpers'
import { AuctionService } from '@/services/auction'
import { z } from 'zod'

const schema = z.object({
  session_id: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid session_id' }, { status: 400 })
    }

    const service = new AuctionService(supabase)
    const session = await service.pauseAuction(result.data.session_id)

    return NextResponse.json({ data: session })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
