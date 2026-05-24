'use client'

import { useState } from 'react'
import { Minus, Plus, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import type { Match } from '@/types'

interface MatchScorerProps {
  match: Match
  onScoreUpdate?: () => void
  canScore: boolean
}

export function MatchScorer({ match, onScoreUpdate, canScore }: MatchScorerProps) {
  const existingScore = match.scores?.[0]
  const [homeScore, setHomeScore] = useState(existingScore?.home_score ?? 0)
  const [awayScore, setAwayScore] = useState(existingScore?.away_score ?? 0)
  const [winnerId, setWinnerId] = useState<string>(existingScore?.winner_team_id ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const homePlayers = match.players?.filter((p) => p.side === 'home') ?? []
  const awayPlayers = match.players?.filter((p) => p.side === 'away') ?? []
  const homeTeamId = homePlayers[0]?.team_id
  const awayTeamId = awayPlayers[0]?.team_id

  const handleSubmit = async () => {
    if (!winnerId) {
      toast({ title: 'Please select a winner', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/matches/${match.id}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          home_score: homeScore,
          away_score: awayScore,
          winner_team_id: winnerId || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to update score')
      }
      toast({ title: 'Score updated!', variant: 'default' })
      onScoreUpdate?.()
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update score',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canScore) {
    return (
      <div className="text-center py-8 text-slate-400">
        <p>Only admins and managers can update scores.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Update Score</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4 items-center">
          <div className="text-center">
            <p className="text-sm font-semibold text-white mb-1">
              {homePlayers.map((p) => p.player?.name).join(' & ') || 'Home'}
            </p>
            <p className="text-xs text-slate-500 mb-3">Home</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-4xl font-bold text-white w-12 text-center">
                {homeScore}
              </span>
              <button
                onClick={() => setHomeScore(homeScore + 1)}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-slate-500">VS</div>
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-white mb-1">
              {awayPlayers.map((p) => p.player?.name).join(' & ') || 'Away'}
            </p>
            <p className="text-xs text-slate-500 mb-3">Away</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-4xl font-bold text-white w-12 text-center">
                {awayScore}
              </span>
              <button
                onClick={() => setAwayScore(awayScore + 1)}
                className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Winner</Label>
          <Select value={winnerId} onValueChange={setWinnerId}>
            <SelectTrigger>
              <SelectValue placeholder="Select winner..." />
            </SelectTrigger>
            <SelectContent>
              {homeTeamId && (
                <SelectItem value={homeTeamId}>
                  {homePlayers.map((p) => p.player?.name).join(' & ') || 'Home Team'} (Home)
                </SelectItem>
              )}
              {awayTeamId && (
                <SelectItem value={awayTeamId}>
                  {awayPlayers.map((p) => p.player?.name).join(' & ') || 'Away Team'} (Away)
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          onClick={handleSubmit}
          loading={isSubmitting}
          disabled={!winnerId}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirm Score
        </Button>
      </CardContent>
    </Card>
  )
}
