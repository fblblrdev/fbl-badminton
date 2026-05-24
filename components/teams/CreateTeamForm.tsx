'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from '@/hooks/use-toast'
import type { Player } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  captain_player_id: z.string().uuid('Select a captain'),
  captain_email: z.string().email('Valid email required'),
  captain_password: z.string().min(6, 'Min 6 characters'),
})
type FormValues = z.infer<typeof schema>

interface Credentials {
  full_name: string
  email: string
  password: string
  team_name: string
}

interface Props {
  tournamentId: string
  captainPlayers: Player[]
}

export function CreateTeamForm({ tournamentId, captainPlayers }: Props) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Credentials | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    const res = await fetch(`/api/manager/tournaments/${tournamentId}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      setServerError(json.error ?? 'Failed to create team')
      return
    }
    setCredentials({
      full_name: json.captain.full_name,
      email: json.captain.email,
      password: json.captain.password,
      team_name: json.team.name,
    })
    reset()
  }

  const handleCredentialsDone = () => {
    setCredentials(null)
    router.refresh()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Add Team</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input id="name" {...register('name')} placeholder="Red Eagles" />
                {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Captain Player *</Label>
                <Select onValueChange={(v) => setValue('captain_player_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select captain" />
                  </SelectTrigger>
                  <SelectContent>
                    {captainPlayers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.gender})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.captain_player_id && (
                  <p className="text-xs text-red-400">{errors.captain_player_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="captain_email">Captain Login Email *</Label>
                <Input
                  id="captain_email"
                  type="email"
                  {...register('captain_email')}
                  placeholder="captain@example.com"
                />
                {errors.captain_email && (
                  <p className="text-xs text-red-400">{errors.captain_email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="captain_password">Captain Password *</Label>
                <div className="relative">
                  <Input
                    id="captain_password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('captain_password')}
                    placeholder="Min 6 characters"
                    className="pr-16"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.captain_password && (
                  <p className="text-xs text-red-400">{errors.captain_password.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={isSubmitting}>
                Create Team &amp; Generate Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={!!credentials} onOpenChange={(open) => { if (!open) handleCredentialsDone() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Team Created — {credentials?.team_name}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Share these credentials with the captain. The password won&apos;t be shown again.
          </p>
          <div className="rounded-md bg-muted p-4 font-mono text-sm space-y-1">
            <p><span className="text-muted-foreground">Name: </span>{credentials?.full_name}</p>
            <p><span className="text-muted-foreground">Email: </span>{credentials?.email}</p>
            <p><span className="text-muted-foreground">Password: </span>{credentials?.password}</p>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (credentials) {
                navigator.clipboard.writeText(
                  `Team: ${credentials.team_name}\nEmail: ${credentials.email}\nPassword: ${credentials.password}`
                )
                toast({ title: 'Copied to clipboard' })
              }
            }}
          >
            Copy Credentials
          </Button>
          <Button className="w-full" onClick={handleCredentialsDone}>
            Done — Add Another Team
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
