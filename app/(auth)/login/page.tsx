import { Metadata } from 'next'
import Link from 'next/link'
import { Eye, Radio } from 'lucide-react'
import { LoginForm } from '@/components/auth/LoginForm'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: 'Sign In | FBL Badminton',
  description: 'Sign in to your FBL Badminton account',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: activeTournaments } = await supabase
    .from('tournaments')
    .select('id, name, venue')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const live = (activeTournaments ?? []) as Array<{ id: string; name: string; venue: string }>

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Welcome back</h2>
        <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
      </div>
      <LoginForm />

      {live.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Live Auctions</p>
          </div>
          <div className="space-y-2">
            {live.map((t) => (
              <Link
                key={t.id}
                href={`/watch/${t.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                    {t.name}
                  </p>
                  <p className="text-xs text-slate-500">{t.venue}</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-blue-400 transition-colors">
                  <Eye className="h-3.5 w-3.5" />
                  Watch
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
