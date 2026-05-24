'use client'

import { Play, Pause, CheckCircle, SkipForward, Gavel } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useStartAuction, useConfirmBid, useNextPlayer } from '@/hooks/useAuction'
import { toast } from '@/hooks/use-toast'
import type { AuctionSession, AuctionBid, Player } from '@/types'


interface AuctionControlsProps {
  session: AuctionSession | null
  currentBid: AuctionBid | null
  currentPlayer: Player | null
  tournamentId: string
  canControl: boolean
}

export function AuctionControls({
  session,
  currentBid,
  currentPlayer,
  tournamentId,
  canControl,
}: AuctionControlsProps) {
  const startAuction = useStartAuction()
  const confirmBid = useConfirmBid()
  const nextPlayer = useNextPlayer()

  const handleStart = async () => {
    try {
      await startAuction.mutateAsync(tournamentId)
      toast({ title: 'Auction started!', variant: 'default' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to start auction',
        variant: 'destructive',
      })
    }
  }

  const handleConfirmBid = async () => {
    if (!session || !currentBid || !currentPlayer) return
    try {
      await confirmBid.mutateAsync({
        session_id: session.id,
        player_id: currentPlayer.id,
        team_id: currentBid.team_id,
        amount: currentBid.amount,
        tournament_id: tournamentId,
      })
      toast({ title: `${currentPlayer.name} sold to ${currentBid.team?.name}!` })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to confirm bid',
        variant: 'destructive',
      })
    }
  }

  const handleNextPlayer = async () => {
    if (!session) return
    try {
      await nextPlayer.mutateAsync({ session_id: session.id, tournament_id: tournamentId, skip: true })
      toast({ title: 'Player skipped — moved to end of queue', variant: 'default' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to move to next player',
        variant: 'destructive',
      })
    }
  }

  const handlePause = async () => {
    if (!session) return
    try {
      const res = await fetch('/api/auction/pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: session.id }),
      })
      if (!res.ok) throw new Error('Failed to pause')
      toast({ title: 'Auction paused', variant: 'default' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to pause auction',
        variant: 'destructive',
      })
    }
  }

  if (!canControl) return null

  return (
    <Card className="border-slate-700 bg-slate-900/80">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Gavel className="h-4 w-4 text-blue-400" />
          Auction Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!session || session.status === 'pending' || session.status === 'completed' ? (
          <Button
            className="w-full"
            onClick={handleStart}
            loading={startAuction.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Auction
          </Button>
        ) : (
          <>
            {session.status === 'active' && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handlePause}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Auction
              </Button>
            )}

            {session.status === 'paused' && (
              <Button
                className="w-full"
                onClick={handleStart}
                loading={startAuction.isPending}
              >
                <Play className="h-4 w-4 mr-2" />
                Resume Auction
              </Button>
            )}

            {currentBid && currentPlayer && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="success"
                    className="w-full"
                    disabled={confirmBid.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirm Winning Bid
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Winning Bid</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sell <strong className="text-white">{currentPlayer.name}</strong> to{' '}
                      <strong className="text-white">{currentBid.team?.name}</strong> for{' '}
                      <strong className="text-blue-400">{currentBid.amount.toLocaleString()} pts</strong>?
                      <br />
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleConfirmBid}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Confirm Sale
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full text-slate-400 hover:text-white"
                  disabled={nextPlayer.isPending}
                >
                  <SkipForward className="h-4 w-4 mr-2" />
                  Skip Player
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Skip Player</AlertDialogTitle>
                  <AlertDialogDescription>
                    Skip <strong className="text-white">{currentPlayer?.name}</strong> and move to the next player?
                    No bid will be recorded.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleNextPlayer}>
                    Skip
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </CardContent>
    </Card>
  )
}
