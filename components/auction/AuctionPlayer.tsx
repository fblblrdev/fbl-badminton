'use client'

import { User, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Player } from '@/types'
import { GENDER_OPTIONS } from '@/lib/constants'

interface AuctionPlayerProps {
  player: Player | null
  isLoading?: boolean
}

export function AuctionPlayer({ player, isLoading }: AuctionPlayerProps) {
  if (isLoading) {
    return (
      <Card className="border-blue-900/50 bg-gradient-to-br from-slate-900 to-slate-950">
        <CardContent className="p-8 text-center">
          <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
          <Skeleton className="h-8 w-48 mx-auto mb-2" />
          <Skeleton className="h-5 w-32 mx-auto mb-4" />
          <Skeleton className="h-10 w-40 mx-auto" />
        </CardContent>
      </Card>
    )
  }

  if (!player) {
    return (
      <Card className="border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
        <CardContent className="p-8 text-center">
          <div className="h-32 w-32 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <User className="h-16 w-16 text-slate-600" />
          </div>
          <p className="text-slate-400 text-lg">No player up for auction</p>
          <p className="text-slate-600 text-sm mt-2">Waiting for auction to start...</p>
        </CardContent>
      </Card>
    )
  }

  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="border-blue-600/30 bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900 shadow-xl shadow-blue-950/20">
      <CardContent className="p-8 text-center">
        <div className="relative inline-block mb-5">
          <div className="h-32 w-32 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mx-auto shadow-lg shadow-blue-900/50 ring-4 ring-blue-600/20">
            <span className="text-4xl font-bold text-white">{initials}</span>
          </div>
          {player.is_captain && (
            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1.5 shadow-md">
              <Crown className="h-4 w-4 text-white" />
            </div>
          )}
        </div>

        <h2 className="text-3xl font-bold text-white mb-2">{player.name}</h2>

        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {GENDER_OPTIONS[player.gender]}
          </Badge>
          {player.skill_category && (
            <Badge variant="default" className="text-sm px-3 py-1">
              {player.skill_category.name}
            </Badge>
          )}
          {player.is_captain && (
            <Badge variant="warning" className="text-sm px-3 py-1">
              Captain
            </Badge>
          )}
        </div>

        <div className="inline-flex items-center justify-center bg-blue-950/50 border border-blue-800/50 rounded-lg px-6 py-3">
          <div className="text-center">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Base Price</p>
            <p className="text-2xl font-bold text-blue-400">
              {player.base_price.toLocaleString()} pts
            </p>
          </div>
        </div>

        {(player.phone || player.email) && (
          <div className="mt-4 text-xs text-slate-500 space-y-0.5">
            {player.phone && <p>{player.phone}</p>}
            {player.email && <p>{player.email}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
