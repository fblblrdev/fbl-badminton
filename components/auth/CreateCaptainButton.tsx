'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { UserPlus, Eye, EyeOff, Copy, Check } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

type Team = { id: string; name: string }

interface Props {
  team: Team
  tournamentId: string
}

export function CreateCaptainButton({ team, tournamentId }: Props) {
  const [open, setOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: `Captain - ${team.name}`,
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    const res = await fetch('/api/manager/captains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        team_id: team.id,
        tournament_id: tournamentId,
      }),
    })
    const json = await res.json()
    if (!res.ok) {
      setServerError(json.error ?? 'Failed to create captain login')
      return
    }
    setCreated({ email: data.email, password: getValues('password') })
    router.refresh()
  }

  const handleCopy = () => {
    if (!created) return
    navigator.clipboard.writeText(`Email: ${created.email}\nPassword: ${created.password}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClose = () => {
    setOpen(false)
    setCreated(null)
    setServerError(null)
    reset()
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        Set Login
      </Button>

      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Login for {team.name}</DialogTitle>
          </DialogHeader>

          {created ? (
            <div className="space-y-4 py-2">
              <Alert className="border-emerald-700 bg-emerald-950/50">
                <AlertDescription className="text-emerald-400">
                  Captain login created successfully!
                </AlertDescription>
              </Alert>
              <div className="rounded-md border border-slate-700 bg-slate-900 p-4 space-y-2 font-mono text-sm">
                <p className="text-slate-400">Email: <span className="text-white">{created.email}</span></p>
                <p className="text-slate-400">Password: <span className="text-white">{created.password}</span></p>
              </div>
              <p className="text-xs text-slate-500">Save these credentials — the password won&apos;t be shown again.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 mr-2 text-emerald-400" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy credentials'}
                </Button>
                <Button className="flex-1" onClick={handleClose}>Done</Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
              {serverError && (
                <Alert variant="destructive">
                  <AlertDescription>{serverError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Display name</Label>
                <Input
                  id="full_name"
                  {...register('full_name')}
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && <p className="text-xs text-red-400">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (username)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="captain@team.com"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className={cn('pr-10', errors.password ? 'border-red-500' : '')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="submit" loading={isSubmitting}>Create Login</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
