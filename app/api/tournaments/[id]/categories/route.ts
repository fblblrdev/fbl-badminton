import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const repo = new TournamentRepository(supabase)
    const categories = await repo.findSkillCategories(id)

    return NextResponse.json({ data: categories })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
