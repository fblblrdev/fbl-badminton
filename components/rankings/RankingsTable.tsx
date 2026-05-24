import { Medal, TrendingUp } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import type { PlayerRanking } from '@/types'

interface RankingsTableProps {
  rankings: PlayerRanking[]
}

const medalColors = ['text-amber-400', 'text-slate-300', 'text-amber-600']

export function RankingsTable({ rankings }: RankingsTableProps) {
  return (
    <Card className="border-slate-800">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-center">ELO</TableHead>
            <TableHead className="text-center">W</TableHead>
            <TableHead className="text-center">L</TableHead>
            <TableHead className="text-center">Win %</TableHead>
            <TableHead className="text-center">Matches</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rankings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                No rankings available yet
              </TableCell>
            </TableRow>
          ) : (
            rankings.map((ranking, index) => {
              const name = ranking.player?.name ?? 'Unknown'
              const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
              const rank = index + 1
              const isMedal = rank <= 3

              return (
                <TableRow key={ranking.id} className={rank === 1 ? 'bg-amber-950/10' : ''}>
                  <TableCell>
                    {isMedal ? (
                      <Medal className={`h-4 w-4 ${medalColors[index]}`} />
                    ) : (
                      <span className="text-slate-500 text-sm">{rank}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-blue-900/40 text-blue-300">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-white">{name}</p>
                        {ranking.player?.skill_category && (
                          <Badge variant="outline" className="text-xs mt-0.5">
                            {ranking.player.skill_category.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-400" />
                      <span className="font-bold text-white">{Math.round(ranking.elo_rating)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-emerald-400 font-medium">{ranking.wins}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-red-400 font-medium">{ranking.losses}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-white font-medium">
                      {ranking.win_percentage.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-slate-400">{ranking.total_matches}</span>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
