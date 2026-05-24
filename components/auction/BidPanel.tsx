'use client'

import { Gavel, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlaceBid } from '@/hooks/useBid'
import { toast } from '@/hooks/use-toast'
import type { AuctionBid, AuctionSession, Team, Player } from '@/types'

interface BidPanelProps {
  session: AuctionSession | null
  currentBid: AuctionBid | null
  currentPlayer: Player | null
  myTeam: Team | null
  tournamentId: string
  auctionIncrement: number
  isLoading?: boolean
  isCaptain: boolean
}

export function BidPanel({
  session,
  currentBid,
  currentPlayer,
  myTeam,
  tournamentId,
  auctionIncrement,
  isLoading,
  isCaptain,
}: BidPanelProps) {
  const placeBid = usePlaceBid(tournamentId)

  const currentAmount = currentBid?.amount ?? (currentPlayer?.base_price ?? 0)
  const nextBidAmount = currentAmount + auctionIncrement
  const canBid =
    isCaptain &&
    myTeam &&
    session?.status === 'active' &&
    currentPlayer &&
    myTeam.balance >= nextBidAmount &&
    currentBid?.team_id !== myTeam?.id

  const handleBid = async () => {
    if (!session || !currentPlayer || !myTeam) return
    try {
      await placeBid.mutateAsync({
        session_id: session.id,
        player_id: currentPlayer.id,
        team_id: myTeam.id,
        amount: nextBidAmount,
      })
      toast({
        title: 'Bid placed!',
        description: `You bid ${nextBidAmount.toLocaleString()} pts`,
        variant: 'default',
      })
    } catch (err) {
      toast({
        title: 'Bid failed',
        description: err instanceof Error ? err.message : 'Could not place bid',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  const isHighestBidder = myTeam && currentBid?.team_id === myTeam.id

  return (
    <Card className={isHighestBidder ? 'border-emerald-700/50' : 'border-slate-800'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Gavel className="h-4 w-4 text-blue-400" />
            Current Bid
          </CardTitle>
          {session?.status === 'active' && (
            <Badge variant="success" className="text-xs">Live</Badge>
          )}
          {session?.status === 'paused' && (
            <Badge variant="warning" className="text-xs">Paused</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          {currentBid ? (
            <>
              <p className="text-4xl font-bold text-white">
                {currentBid.amount.toLocaleString()}
                <span className="text-xl text-slate-400 ml-1">pts</span>
              </p>
              <p className="text-sm text-slate-400 mt-1">
                by <span className="text-blue-400 font-medium">{currentBid.team?.name ?? 'Unknown'}</span>
              </p>
              {isHighestBidder && (
                <Badge variant="success" className="mt-2">You are highest bidder</Badge>
              )}
            </>
          ) : currentPlayer ? (
            <>
              <p className="text-4xl font-bold text-slate-400">
                {currentPlayer.base_price.toLocaleString()}
                <span className="text-xl text-slate-500 ml-1">pts</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">Starting price</p>
            </>
          ) : (
            <p className="text-slate-500">No active auction</p>
          )}
        </div>

        {isCaptain && myTeam && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your balance:</span>
              <span className={`font-semibold ${myTeam.balance < nextBidAmount ? 'text-red-400' : 'text-emerald-400'}`}>
                {myTeam.balance.toLocaleString()} pts
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Next bid:</span>
              <span className="text-white font-semibold flex items-center gap-1">
                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                {nextBidAmount.toLocaleString()} pts
              </span>
            </div>

            <Button
              className="w-full"
              size="xl"
              onClick={handleBid}
              disabled={!canBid}
              loading={placeBid.isPending}
              variant={canBid ? 'default' : 'secondary'}
            >
              <Gavel className="h-5 w-5 mr-2" />
              {isHighestBidder
                ? 'You are winning!'
                : myTeam.balance < nextBidAmount
                ? 'Insufficient balance'
                : session?.status !== 'active'
                ? 'Auction paused'
                : `BID ${nextBidAmount.toLocaleString()} pts`}
            </Button>
          </div>
        )}

        {!isCaptain && (
          <p className="text-center text-sm text-slate-500">
            Only captains can place bids
          </p>
        )}
      </CardContent>
    </Card>
  )
}
