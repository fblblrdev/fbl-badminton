import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAuthUser } from '@/lib/auth-helpers'
import { FixtureService } from '@/services/fixture'
import { z } from 'zod'

const schema = z.object({
  tournament_id: z.string().uuid(),
  type: z.enum(['round_robin', 'knockout', 'manual']),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const auth = await getAuthUser(supabase)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (auth.role !== 'SUPER_ADMIN' && auth.role !== 'TOURNAMENT_MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const result = schema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const service = new FixtureService(supabase)
    const fixtures = await service.generateFixtures(result.data.tournament_id, result.data.type)

    return NextResponse.json({ data: fixtures }, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
