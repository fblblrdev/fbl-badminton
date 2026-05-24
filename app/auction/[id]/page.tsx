'use client'

import { useParams } from 'next/navigation'
import { useAuctionState } from '@/hooks/useAuction'
import { useAuth } from '@/hooks/useAuth'
import { useAuctionRealtime } from '@/hooks/useRealtime'
import { AuctionPlayer } from '@/components/auction/AuctionPlayer'
import { BidPanel } from '@/components/auction/BidPanel'
import { TeamBalances } from '@/components/auction/TeamBalances'
import { BidHistory } from '@/components/auction/BidHistory'
import { CountdownTimer } from '@/components/auction/CountdownTimer'
import { AuctionControls } from '@/components/auction/AuctionControls'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/layout/Navbar'
import { Gavel } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { Tournament, Team } from '@/types'
import { QUERY_KEYS } from '@/lib/constants'

export default function AuctionPage() {
  const { id: tournamentId } = useParams<{ id: string }>()
  const { user, isSuperAdmin, isCaptain } = useAuth()

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

  const { data: auctionState, isLoading } = useAuctionState(tournamentId)

  useAuctionRealtime(tournamentId, auctionState?.session?.id)

  const myTeam = isCaptain && user
    ? auctionState?.teams.find((t) => t.captain?.email === user.email) ?? null
    : null

  const canControl = isSuperAdmin
  const maxBalance = Math.max(...(auctionState?.teams.map((t) => t.balance) ?? [1]))

  const sessionStatus = auctionState?.session?.status
  const isActive = sessionStatus === 'active'
  const timerSeconds = tournament?.timer_seconds ?? 30
  const resetKey = auctionState?.session?.current_player_id ?? 'no-player'

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <div className="container mx-auto px-4 py-4 max-w-[1600px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
              <Gavel className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                {tournament?.name ?? 'Auction'}
              </h1>
              <p className="text-xs text-slate-400">{tournament?.venue}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-3 order-2 xl:order-1">
            <div className="space-y-4">
              <TeamBalances
                teams={auctionState?.teams ?? []}
                maxBalance={maxBalance}
                isLoading={isLoading}
                highlightTeamId={myTeam?.id}
              />
              {canControl && (
                <AuctionControls
                  session={auctionState?.session ?? null}
                  currentBid={auctionState?.currentBid ?? null}
                  currentPlayer={auctionState?.currentPlayer ?? null}
                  tournamentId={tournamentId}
                  canControl={canControl}
                />
              )}
            </div>
          </div>

          <div className="xl:col-span-6 order-1 xl:order-2">
            <div className="space-y-4">
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

              <BidPanel
                session={auctionState?.session ?? null}
                currentBid={auctionState?.currentBid ?? null}
                currentPlayer={auctionState?.currentPlayer ?? null}
                myTeam={myTeam}
                tournamentId={tournamentId}
                auctionIncrement={tournament?.auction_increment ?? 100}
                isLoading={isLoading}
                isCaptain={isCaptain}
              />
            </div>
          </div>

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
