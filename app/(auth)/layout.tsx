import { Trophy } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-blue-600 shadow-lg shadow-blue-900/50 mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">FBL Badminton</h1>
          <p className="text-slate-400 text-sm mt-1">Tournament Auction Platform</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl">
          {children}
        </div>
        <p className="text-center text-xs text-slate-600 mt-6">
          &copy; {new Date().getFullYear()} FBL Badminton. All rights reserved.
        </p>
      </div>
    </div>
  )
}
