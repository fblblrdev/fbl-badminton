'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuctionState } from '@/hooks/useAuction'
import { useAuctionRealtime } from '@/hooks/useRealtime'
import { AuctionPlayer } from '@/components/auction/AuctionPlayer'
import { TeamBalances } from '@/components/auction/TeamBalances'
import { BidHistory } from '@/components/auction/BidHistory'
import { CountdownTimer } from '@/components/auction/CountdownTimer'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Gavel, Eye, Users, Trophy } from 'lucide-react'
import type { Tournament, Player } from '@/types'
import { QUERY_KEYS } from '@/lib/constants'

export default function WatchPage() {
  const { id: tournamentId } = useParams<{ id: string }>()

  const { data: tournament } = useQuery<Tournament>({
    queryKey: [QUERY_KEYS.TOURNAMENT, tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}`)
      if (!res.ok) throw new Error('Failed to fetch tournament')
      const json = await res.json()
      return json.data
    },
    enabled: !!tournamentId,
  })

  const { data: players = [] } = useQuery<Player[]>({
    queryKey: [QUERY_KEYS.PLAYERS, tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/players`)
      if (!res.ok) return []
      const json = await res.json()
      return json.data ?? []
    },
    enabled: !!tournamentId,
  })

  const { data: auctionState, isLoading } = useAuctionState(tournamentId)
  useAuctionRealtime(tournamentId, auctionState?.session?.id)

  const maxBalance = Math.max(...(auctionState?.teams.map((t) => t.balance) ?? [1]))
  const sessionStatus = auctionState?.session?.status
  const isActive = sessionStatus === 'active'
  const timerSeconds = tournament?.timer_seconds ?? 30
  const resetKey = auctionState?.session?.current_player_id ?? 'no-player'
  const soldPlayerIds = new Set(auctionState?.results.map((r) => r.player_id) ?? [])

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-[1400px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
              <Gavel className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">{tournament?.name ?? 'Live Auction'}</h1>
              <p className="text-xs text-slate-400">{tournament?.venue}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
              <Eye className="h-3 w-3" />
              Guest View
            </div>
            {sessionStatus && (
              <Badge
                variant={
                  sessionStatus === 'active' ? 'success' :
                  sessionStatus === 'paused' ? 'warning' :
                  sessionStatus === 'completed' ? 'outline' : 'secondary'
                }
                className="capitalize"
              >
                {sessionStatus}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {auctionState?.results.length ?? 0} sold
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 max-w-[1400px]">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">

          {/* Left: Team Balances */}
          <div className="xl:col-span-3 order-2 xl:order-1">
            <TeamBalances
              teams={auctionState?.teams ?? []}
              maxBalance={maxBalance}
              isLoading={isLoading}
            />
          </div>

          {/* Center: Current Player + Timer + Tabs */}
          <div className="xl:col-span-6 order-1 xl:order-2 space-y-4">
            <AuctionPlayer
              player={auctionState?.currentPlayer ?? null}
              isLoading={isLoading}
            />

            <div className="flex justify-center">
              <CountdownTimer
                seconds={timerSeconds}
                isActive={isActive}
                resetKey={resetKey}
              />
            </div>

            {/* Results + Players tabs */}
            <Tabs defaultValue="results">
              <TabsList className="w-full">
                <TabsTrigger value="results" className="flex-1">
                  <Trophy className="h-3.5 w-3.5 mr-1.5" />
                  Results ({auctionState?.results.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="players" className="flex-1">
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  Players ({players.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="results">
                {(auctionState?.results.length ?? 0) === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-sm">
                    No players sold yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {[...( auctionState?.results ?? [])].reverse().map((result) => (
                      <Card key={result.id}>
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{result.player?.name ?? '—'}</p>
                            <p className="text-xs text-slate-400">
                              {result.player?.gender} · {result.player?.skill_category?.name ?? '—'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400">
                              {result.final_amount.toLocaleString()} pts
                            </p>
                            <p className="text-xs text-slate-400">{result.team?.name ?? '—'}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="players">
                <div className="space-y-1.5 max-h-72 overflow-y-auto">
                  {players.map((player) => {
                    const isSold = soldPlayerIds.has(player.id)
                    const isCurrent = player.id === auctionState?.session?.current_player_id
                    return (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between px-3 py-2 rounded-md text-sm ${
                          isCurrent ? 'bg-blue-600/20 border border-blue-600/30' :
                          isSold ? 'opacity-40' : 'bg-slate-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-white">{player.name}</span>
                          {isCurrent && <Badge variant="success" className="text-xs">Up now</Badge>}
                          {isSold && <Badge variant="outline" className="text-xs">Sold</Badge>}
                        </div>
                        <span className="text-slate-400 text-xs">
                          {player.skill_category?.name} · {player.base_price.toLocaleString()} pts
                        </span>
                      </div>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Bid History */}
          <div className="xl:col-span-3 order-3">
            <BidHistory
              bids={auctionState?.bids ?? []}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
