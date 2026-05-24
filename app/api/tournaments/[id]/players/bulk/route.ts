import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth-helpers'
import { PlayerService } from '@/services/player'
import { z } from 'zod'

const bulkSchema = z.object({
  players: z.array(z.object({
    name: z.string().min(1),
    gender: z.string(),
    skill_category: z.string(),
  })).min(1),
})

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (auth.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const result = bulkSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const service = new PlayerService(supabase)
    const players = await service.bulkCreateFromCSV(id, result.data.players)

    return NextResponse.json({ data: players }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
