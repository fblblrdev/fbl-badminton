'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { tournamentSchema, type TournamentFormValues } from '@/lib/validations/tournament'
import { useCreateTournament } from '@/hooks/useTournament'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SkillCategoryForm } from './SkillCategoryForm'
import { toast } from '@/hooks/use-toast'
import { ROUTES, DEFAULT_TIMER_SECONDS, DEFAULT_AUCTION_INCREMENT, DEFAULT_AUCTION_POINTS } from '@/lib/constants'

interface TournamentFormProps {
  defaultValues?: Partial<TournamentFormValues>
  mode?: 'create' | 'edit'
  tournamentId?: string
}

export function TournamentForm({ defaultValues, mode = 'create', tournamentId }: TournamentFormProps) {
  const router = useRouter()
  const createMutation = useCreateTournament()

  const methods = useForm<TournamentFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tournamentSchema) as any,
    defaultValues: {
      name: '',
      venue: '',
      start_date: '',
      end_date: '',
      auction_points: DEFAULT_AUCTION_POINTS,
      auction_increment: DEFAULT_AUCTION_INCREMENT,
      timer_seconds: DEFAULT_TIMER_SECONDS,
      captain_is_player: true,
      min_team_size: 5,
      max_team_size: 10,
      min_female_players: 0,
      max_female_players: 10,
      skill_categories: [],
      ...defaultValues,
    },
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = methods
  const captainIsPlayer = watch('captain_is_player')

  const onSubmit = async (data: TournamentFormValues) => {
    try {
      await createMutation.mutateAsync({ ...data })
      toast({ title: 'Tournament created successfully!', variant: 'default' })
      router.push(ROUTES.ADMIN_TOURNAMENTS)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create tournament',
        variant: 'destructive',
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="name">Tournament Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="FBL Badminton Championship 2026"
              />
              {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
            </div>

            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                {...register('venue')}
                placeholder="Sports Complex, City"
              />
              {errors.venue && <p className="text-xs text-red-400">{errors.venue.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register('start_date')}
              />
              {errors.start_date && <p className="text-xs text-red-400">{errors.start_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                {...register('end_date')}
              />
              {errors.end_date && <p className="text-xs text-red-400">{errors.end_date.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auction Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auction_points">Starting Points *</Label>
              <Input
                id="auction_points"
                type="number"
                {...register('auction_points', { valueAsNumber: true })}
                placeholder="10000"
              />
              {errors.auction_points && <p className="text-xs text-red-400">{errors.auction_points.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="auction_increment">Bid Increment *</Label>
              <Input
                id="auction_increment"
                type="number"
                {...register('auction_increment', { valueAsNumber: true })}
                placeholder="100"
              />
              {errors.auction_increment && <p className="text-xs text-red-400">{errors.auction_increment.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timer_seconds">Timer (seconds) *</Label>
              <Input
                id="timer_seconds"
                type="number"
                {...register('timer_seconds', { valueAsNumber: true })}
                placeholder="30"
              />
              {errors.timer_seconds && <p className="text-xs text-red-400">{errors.timer_seconds.message}</p>}
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="captain_is_player"
                checked={captainIsPlayer}
                onCheckedChange={(v) => setValue('captain_is_player', v)}
              />
              <Label htmlFor="captain_is_player" className="cursor-pointer">
                Captain is a player
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Composition</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_team_size">Min Team Size *</Label>
              <Input
                id="min_team_size"
                type="number"
                {...register('min_team_size', { valueAsNumber: true })}
                placeholder="5"
              />
              {errors.min_team_size && <p className="text-xs text-red-400">{errors.min_team_size.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_team_size">Max Team Size *</Label>
              <Input
                id="max_team_size"
                type="number"
                {...register('max_team_size', { valueAsNumber: true })}
                placeholder="10"
              />
              {errors.max_team_size && <p className="text-xs text-red-400">{errors.max_team_size.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_female_players">Min Female Players *</Label>
              <Input
                id="min_female_players"
                type="number"
                {...register('min_female_players', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_female_players">Max Female Players *</Label>
              <Input
                id="max_female_players"
                type="number"
                {...register('max_female_players', { valueAsNumber: true })}
                placeholder="10"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <SkillCategoryForm />

        <div className="flex gap-3 justify-end pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting || createMutation.isPending}>
            {mode === 'create' ? 'Create Tournament' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
