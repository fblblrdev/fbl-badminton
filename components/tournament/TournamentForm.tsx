'use client'

import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { tournamentSchema, type TournamentFormValues } from '@/lib/validations/tournament'
import { useCreateTournament } from '@/hooks/useTournament'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SkillCategoryForm } from './SkillCategoryForm'
import { toast } from '@/hooks/use-toast'
import { ROUTES, DEFAULT_TIMER_SECONDS, DEFAULT_AUCTION_INCREMENT, DEFAULT_AUCTION_POINTS } from '@/lib/constants'

interface TournamentFormProps {
  defaultValues?: Partial<TournamentFormValues>
  mode?: 'create' | 'edit'
  tournamentId?: string
}

interface ManagerCredentials {
  email: string
  password: string
  full_name: string
}

export function TournamentForm({ defaultValues, mode = 'create', tournamentId }: TournamentFormProps) {
  const router = useRouter()
  const createMutation = useCreateTournament()
  const [credentials, setCredentials] = useState<ManagerCredentials | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors, isSubmitting } } = methods
  const captainIsPlayer = watch('captain_is_player')

  // Manager fields are outside the Zod schema — read via getValues with unknown cast
  const getManagerField = (field: string): string =>
    ((getValues as unknown as (f: string) => unknown)(field) as string) ?? ''

  const onSubmit = async (data: TournamentFormValues) => {
    try {
      // If manager credentials provided, create the manager account first
      const managerName = getManagerField('manager_name')
      const managerEmail = getManagerField('manager_email')
      const managerPassword = getManagerField('manager_password')
      const hasManager = !!(managerName && managerEmail && managerPassword)

      let managerId: string | undefined
      if (hasManager) {
        const userRes = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: managerName,
            email: managerEmail,
            password: managerPassword,
            role: 'TOURNAMENT_MANAGER',
          }),
        })
        if (!userRes.ok) {
          const err = await userRes.json()
          const errMsg = typeof err.error === 'string'
            ? err.error
            : err.error?.formErrors?.[0]
              ?? Object.values(err.error?.fieldErrors ?? {}).flat()[0]
              ?? 'Failed to create manager account'
          throw new Error(errMsg)
        }
        const userJson = await userRes.json()
        managerId = userJson.user?.id as string | undefined
      }

      await createMutation.mutateAsync({ ...data, manager_id: managerId })

      if (hasManager) {
        setCredentials({ email: managerEmail, password: managerPassword, full_name: managerName })
      } else {
        toast({ title: 'Tournament created successfully!', variant: 'default' })
        router.push(ROUTES.ADMIN_TOURNAMENTS)
      }
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

        {mode === 'create' && (
          <Card>
            <CardHeader>
              <CardTitle>Tournament Manager Login</CardTitle>
              <p className="text-sm text-muted-foreground">
                Optionally create a manager account to assign to this tournament.
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="manager_name">Full Name</Label>
                <Input
                  id="manager_name"
                  {...register('manager_name' as never)}
                  placeholder="Jane Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager_email">Email</Label>
                <Input
                  id="manager_email"
                  type="email"
                  {...register('manager_email' as never)}
                  placeholder="manager@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager_password">Password</Label>
                <div className="relative">
                  <Input
                    id="manager_password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('manager_password' as never)}
                    placeholder="Min 6 characters"
                    className="pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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

      <Dialog open={!!credentials} onOpenChange={(open) => { if (!open) router.push(ROUTES.ADMIN_TOURNAMENTS) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tournament Created</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tournament and manager account created. Share these credentials — the password won&apos;t be shown again.
          </p>
          <div className="rounded-md bg-muted p-4 font-mono text-sm space-y-1">
            <p><span className="text-muted-foreground">Name:</span> {credentials?.full_name}</p>
            <p><span className="text-muted-foreground">Email:</span> {credentials?.email}</p>
            <p><span className="text-muted-foreground">Password:</span> {credentials?.password}</p>
          </div>
          <Button
            onClick={() => {
              if (credentials) {
                navigator.clipboard.writeText(
                  `Name: ${credentials.full_name}\nEmail: ${credentials.email}\nPassword: ${credentials.password}`
                )
                toast({ title: 'Copied to clipboard' })
              }
            }}
            variant="outline"
            className="w-full"
          >
            Copy Credentials
          </Button>
          <Button className="w-full" onClick={() => router.push(ROUTES.ADMIN_TOURNAMENTS)}>
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </FormProvider>
  )
}
