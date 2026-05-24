'use client'

import { Users, Coins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import type { TeamWithBalance } from '@/types'

interface TeamBalancesProps {
  teams: TeamWithBalance[]
  maxBalance: number
  isLoading?: boolean
  highlightTeamId?: string
}

export function TeamBalances({ teams, maxBalance, isLoading, highlightTeamId }: TeamBalancesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const sorted = [...teams].sort((a, b) => b.balance - a.balance)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Coins className="h-4 w-4 text-blue-400" />
          Team Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-slate-500 text-sm text-center py-4">No teams registered</p>
        )}
        {sorted.map((team) => {
          const pct = maxBalance > 0 ? (team.balance / maxBalance) * 100 : 0
          const initials = team.name.slice(0, 2).toUpperCase()
          const isHighlighted = team.id === highlightTeamId

          return (
            <div
              key={team.id}
              className={`p-3 rounded-lg border transition-colors ${
                isHighlighted
                  ? 'bg-blue-950/30 border-blue-700/50'
                  : 'bg-slate-900/50 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs bg-slate-700 text-slate-300">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className={`text-sm font-medium ${isHighlighted ? 'text-blue-300' : 'text-white'}`}>
                      {team.name}
                      {isHighlighted && <span className="text-xs text-blue-400 ml-1">(you)</span>}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Users className="h-3 w-3" />
                      {team.player_count} players
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${team.balance < 500 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {team.balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">pts left</p>
                </div>
              </div>
              <Progress
                value={pct}
                className="h-1.5"
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
