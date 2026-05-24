import Link from 'next/link'
import { Swords } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Match } from '@/types'
import { MATCH_TYPES } from '@/lib/constants'

interface MatchCardProps {
  match: Match
  canScore?: boolean
}

const statusVariant = {
  pending: 'secondary' as const,
  in_progress: 'warning' as const,
  completed: 'success' as const,
}

export function MatchCard({ match, canScore }: MatchCardProps) {
  const homeScore = match.scores?.[0]
  const homePlayers = match.players?.filter((p) => p.side === 'home') ?? []
  const awayPlayers = match.players?.filter((p) => p.side === 'away') ?? []

  return (
    <Card className="hover:border-slate-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className="h-3.5 w-3.5 text-blue-400" />
            <span className="text-xs text-slate-400">{MATCH_TYPES[match.type]}</span>
          </div>
          <Badge variant={statusVariant[match.status]} className="text-xs capitalize">
            {match.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            {homePlayers.length > 0 ? (
              <div className="space-y-0.5">
                {homePlayers.map((mp) => (
                  <p key={mp.id} className="text-sm font-medium text-white">{mp.player?.name}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Home Team</p>
            )}
          </div>

          <div className="flex-shrink-0 text-center">
            {homeScore ? (
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${homeScore.winner_team_id === homePlayers[0]?.team_id ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {homeScore.home_score}
                </span>
                <span className="text-slate-500">–</span>
                <span className={`text-xl font-bold ${homeScore.winner_team_id === awayPlayers[0]?.team_id ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {homeScore.away_score}
                </span>
              </div>
            ) : (
              <span className="text-slate-500 text-sm">VS</span>
            )}
          </div>

          <div className="flex-1 text-right">
            {awayPlayers.length > 0 ? (
              <div className="space-y-0.5">
                {awayPlayers.map((mp) => (
                  <p key={mp.id} className="text-sm font-medium text-white">{mp.player?.name}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Away Team</p>
            )}
          </div>
        </div>

        {canScore && match.status !== 'completed' && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <Button asChild size="sm" className="w-full">
              <Link href={`/matches/${match.id}`}>
                {match.status === 'pending' ? 'Start Match' : 'Update Score'}
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
