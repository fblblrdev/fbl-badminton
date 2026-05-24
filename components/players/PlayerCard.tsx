import { User, Crown, Phone, Mail } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { Player } from '@/types'
import { GENDER_OPTIONS } from '@/lib/constants'

interface PlayerCardProps {
  player: Player
  showTeam?: boolean
}

export function PlayerCard({ player, showTeam }: PlayerCardProps) {
  const initials = player.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="hover:border-slate-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarFallback className="text-sm bg-blue-900/40 text-blue-300">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-white truncate">{player.name}</h3>
              {player.is_captain && (
                <Crown className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-1.5">
              <Badge variant="secondary" className="text-xs">
                {GENDER_OPTIONS[player.gender]}
              </Badge>
              {player.skill_category && (
                <Badge variant="outline" className="text-xs">
                  {player.skill_category.name}
                </Badge>
              )}
            </div>

            <div className="mt-2 text-sm">
              <span className="text-slate-400">Base: </span>
              <span className="text-blue-400 font-semibold">
                {player.base_price.toLocaleString()} pts
              </span>
            </div>

            {(player.phone || player.email) && (
              <div className="mt-2 space-y-1">
                {player.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="h-3 w-3" />
                    {player.phone}
                  </div>
                )}
                {player.email && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{player.email}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
