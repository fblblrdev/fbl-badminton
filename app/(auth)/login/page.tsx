import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In | FBL Badminton',
  description: 'Sign in to your FBL Badminton account',
}

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Welcome back</h2>
        <p className="text-slate-400 text-sm mt-1">Sign in to your account to continue</p>
      </div>
      <LoginForm />
    </div>
  )
}
