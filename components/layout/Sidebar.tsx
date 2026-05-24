'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Trophy,
  Users,
  Shield,
  Gavel,
  CalendarDays,
  Swords,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface SidebarProps {
  type: 'admin' | 'manager'
  tournamentId?: string
}

export function Sidebar({ type, tournamentId }: SidebarProps) {
  const pathname = usePathname()
  const { role } = useAuth()

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
  ]

  const managerLinks = tournamentId
    ? [
        { href: `/manager/tournaments/${tournamentId}`, label: 'Overview', icon: LayoutDashboard },
        { href: `/manager/tournaments/${tournamentId}/players`, label: 'Players', icon: Users },
        { href: `/manager/tournaments/${tournamentId}/teams`, label: 'Teams', icon: Shield },
        { href: `/auction/${tournamentId}`, label: 'Auction', icon: Gavel },
        { href: `/fixtures/${tournamentId}`, label: 'Fixtures', icon: CalendarDays },
        { href: `/matches`, label: 'Matches', icon: Swords },
        { href: `/rankings`, label: 'Rankings', icon: BarChart3 },
      ]
    : [
        { href: '/manager', label: 'Dashboard', icon: LayoutDashboard },
      ]

  const links = type === 'admin' ? adminLinks : managerLinks

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-950 border-r border-slate-800 flex flex-col min-h-screen">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-white text-sm">
            {type === 'admin' ? 'Admin Panel' : 'Manager Panel'}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && href !== '/manager' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-blue-400' : 'text-slate-500')} />
              {label}
            </Link>
          )
        })}
      </nav>

      {role && (
        <div className="p-4 border-t border-slate-800">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="text-xs text-slate-300 font-medium mt-0.5">{role.replace('_', ' ')}</p>
        </div>
      )}
    </aside>
  )
}
