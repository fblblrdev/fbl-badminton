'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Trophy, Users, Gavel, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { toast } from '@/hooks/use-toast'
import type { Tournament } from '@/types'
import { TOURNAMENT_STATUS } from '@/lib/constants'

interface TournamentCardProps {
  tournament: Tournament
  role?: string | null
}

const statusVariant = {
  draft: 'secondary' as const,
  active: 'success' as const,
  completed: 'outline' as const,
}

export function TournamentCard({ tournament, role }: TournamentCardProps) {
  const isAdmin = role === 'SUPER_ADMIN'
  const isManager = role === 'TOURNAMENT_MANAGER'
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/tournaments/${tournament.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        toast({ title: 'Error', description: err.error ?? 'Failed to delete tournament', variant: 'destructive' })
      } else {
        toast({ title: 'Tournament deleted' })
        router.refresh()
      }
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="hover:border-slate-700 transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg group-hover:text-blue-400 transition-colors line-clamp-2">
            {tournament.name}
          </CardTitle>
          <Badge variant={statusVariant[tournament.status]} className="flex-shrink-0">
            {TOURNAMENT_STATUS[tournament.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
          <span className="truncate">{tournament.venue}</span>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
          <span>
            {format(new Date(tournament.start_date), 'MMM d')} –{' '}
            {format(new Date(tournament.end_date), 'MMM d, yyyy')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="flex items-center gap-2">
            <Gavel className="h-3.5 w-3.5 text-blue-400" />
            <div>
              <p className="text-xs text-slate-500">Auction Points</p>
              <p className="text-sm font-semibold text-white">{tournament.auction_points.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <div>
              <p className="text-xs text-slate-500">Team Size</p>
              <p className="text-sm font-semibold text-white">
                {tournament.min_team_size}–{tournament.max_team_size}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-0">
        {(isAdmin || isManager) && (
          <>
            <Button asChild size="sm" variant="outline" className="flex-1">
              <Link href={isAdmin ? `/admin/tournaments/${tournament.id}` : `/manager/tournaments/${tournament.id}`}>
                <Trophy className="h-3.5 w-3.5 mr-1.5" />
                Manage
              </Link>
            </Button>
            <Button asChild size="sm" className="flex-1">
              <Link href={`/auction/${tournament.id}`}>
                <Gavel className="h-3.5 w-3.5 mr-1.5" />
                Auction
              </Link>
            </Button>
            {isAdmin && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={deleting}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete &quot;{tournament.name}&quot;?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the tournament and all its players, teams, and auction data. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        )}
        {role === 'CAPTAIN' && (
          <Button asChild size="sm" className="w-full">
            <Link href={`/auction/${tournament.id}`}>
              <Gavel className="h-3.5 w-3.5 mr-1.5" />
              View Auction
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
