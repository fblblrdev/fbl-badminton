'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { signupSchema, type SignupFormValues } from '@/lib/validations/auth'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: 'CAPTAIN' },
  })

  const onSubmit = async (data: SignupFormValues) => {
    setServerError(null)
    console.log('Signup submitted', data)
    try {
      const supabase = createClient()

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
          },
        },
      })

      if (error) {
        setServerError(error.message)
        return
      }

      if (authData.user && !authData.session) {
        // Email confirmation required
        setSuccess(true)
        return
      }

      // Auto-confirmed — redirect to captain dashboard
      router.push('/captain')
      router.refresh()
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-500/20 mx-auto">
          <UserPlus className="h-6 w-6 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">Check your email</h3>
        <p className="text-slate-400 text-sm">
          We&apos;ve sent a confirmation link to your email address. Click it to activate your account.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="text-blue-400 hover:text-blue-300 text-sm underline-offset-4 hover:underline"
        >
          Back to sign in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit, (errs) => console.log('Validation errors', errs))} className="space-y-4">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input
          id="full_name"
          type="text"
          autoComplete="name"
          placeholder="John Doe"
          {...register('full_name')}
          className={errors.full_name ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.full_name && (
          <p className="text-xs text-red-400">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          {...register('email')}
          className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {errors.email && (
          <p className="text-xs text-red-400">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('password')}
            className={cn('pr-10', errors.password ? 'border-red-500 focus-visible:ring-red-500' : '')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirm password</Label>
        <div className="relative">
          <Input
            id="confirm_password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            {...register('confirm_password')}
            className={cn('pr-10', errors.confirm_password ? 'border-red-500 focus-visible:ring-red-500' : '')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="text-xs text-red-400">{errors.confirm_password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
        <UserPlus className="mr-2 h-4 w-4" />
        Create account
      </Button>
    </form>
  )
}
