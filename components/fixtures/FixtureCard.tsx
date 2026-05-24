import { format } from 'date-fns'
import { Calendar, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Fixture } from '@/types'

interface FixtureCardProps {
  fixture: Fixture
}

const statusVariant = {
  scheduled: 'secondary' as const,
  completed: 'success' as const,
  cancelled: 'destructive' as const,
}

export function FixtureCard({ fixture }: FixtureCardProps) {
  return (
    <Card className="hover:border-slate-700 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Round {fixture.round}
            </Badge>
            <Badge variant={statusVariant[fixture.status]} className="text-xs capitalize">
              {fixture.status}
            </Badge>
          </div>
          {fixture.scheduled_at && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="h-3 w-3" />
              {format(new Date(fixture.scheduled_at), 'MMM d, h:mm a')}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="font-semibold text-white text-sm">
                {fixture.home_team?.name ?? 'TBD'}
              </span>
            </div>
            <p className="text-xs text-slate-500">Home</p>
          </div>

          <div className="flex-shrink-0 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <span className="text-lg font-bold text-slate-400">VS</span>
            </div>
          </div>

          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="font-semibold text-white text-sm">
                {fixture.away_team?.name ?? 'TBD'}
              </span>
              <Shield className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500">Away</p>
          </div>
        </div>

        {fixture.matches && fixture.matches.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              {fixture.matches.length} match{fixture.matches.length !== 1 ? 'es' : ''}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
