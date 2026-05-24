import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return NextResponse.json({ data: null })
  } catch {
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 })
  }
}
