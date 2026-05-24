import { createClient } from '@/lib/supabase/server'
import { TournamentRepository } from '@/repositories/tournament'
import { PlayerRepository } from '@/repositories/player'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Trophy, Users, Gavel, Plus, TrendingUp } from 'lucide-react'
import { ROUTES } from '@/lib/constants'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const tournamentRepo = new TournamentRepository(supabase)
  const playerRepo = new PlayerRepository(supabase)

  const tournaments = await tournamentRepo.findAll()

  const active = tournaments.filter((t) => t.status === 'active').length
  const draft = tournaments.filter((t) => t.status === 'draft').length
  const completed = tournaments.filter((t) => t.status === 'completed').length

  const stats = [
    { label: 'Total Tournaments', value: tournaments.length, icon: Trophy, color: 'text-blue-400' },
    { label: 'Active', value: active, icon: TrendingUp, color: 'text-emerald-400' },
    { label: 'Draft', value: draft, icon: Gavel, color: 'text-amber-400' },
    { label: 'Completed', value: completed, icon: Users, color: 'text-slate-400' },
  ]

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description="Manage all tournaments and system settings"
      >
        <Button asChild>
          <Link href={ROUTES.ADMIN_NEW_TOURNAMENT}>
            <Plus className="h-4 w-4 mr-2" />
            New Tournament
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-400">{label}</p>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-3xl font-bold text-white">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Tournaments</h2>
          <Button asChild variant="outline" size="sm">
            <Link href={ROUTES.ADMIN_TOURNAMENTS}>View All</Link>
          </Button>
        </div>

        <div className="rounded-md border border-slate-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Tournament</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Dates</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.slice(0, 5).map((t) => (
                <tr key={t.id} className="border-t border-slate-800 hover:bg-slate-900/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.venue}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={t.status === 'active' ? 'success' : t.status === 'draft' ? 'secondary' : 'outline'}
                      className="text-xs capitalize"
                    >
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {new Date(t.start_date).toLocaleDateString()} – {new Date(t.end_date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/admin/tournaments/${t.id}`}>Manage</Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {tournaments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    No tournaments yet.{' '}
                    <Link href={ROUTES.ADMIN_NEW_TOURNAMENT} className="text-blue-400 hover:underline">
                      Create one
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
