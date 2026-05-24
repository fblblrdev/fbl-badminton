'use client'

import { History, Crown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import type { AuctionBid } from '@/types'

interface BidHistoryProps {
  bids: AuctionBid[]
  isLoading?: boolean
}

function ScrollArea({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`overflow-y-auto ${className ?? ''}`}>{children}</div>
}

export function BidHistory({ bids, isLoading }: BidHistoryProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="h-4 w-4 text-blue-400" />
          Bid History
          {bids.length > 0 && (
            <Badge variant="secondary" className="text-xs ml-auto">
              {bids.length} bids
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="max-h-64 px-4 pb-4">
          {bids.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No bids yet</p>
          ) : (
            <div className="space-y-2">
              {bids.map((bid, index) => {
                const teamName = bid.team?.name ?? 'Unknown Team'
                const initials = teamName.slice(0, 2).toUpperCase()
                const isLatest = index === 0

                return (
                  <div
                    key={bid.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                      isLatest
                        ? 'bg-blue-950/30 border border-blue-700/30'
                        : 'bg-slate-900/30 border border-slate-800/50'
                    }`}
                  >
                    <Avatar className="h-7 w-7 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-slate-700 text-slate-300">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white truncate">{teamName}</p>
                        {isLatest && <Badge variant="success" className="text-xs flex-shrink-0">Highest</Badge>}
                        {bid.is_winning && !isLatest && <Crown className="h-3 w-3 text-amber-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500">
                        {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${isLatest ? 'text-blue-400' : 'text-slate-400'}`}>
                        {bid.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-600">pts</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
