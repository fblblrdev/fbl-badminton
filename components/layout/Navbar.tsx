'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Trophy, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROUTES, ROLES } from '@/lib/constants'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: ROUTES.AUCTION, label: 'Auction', roles: ['SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'CAPTAIN'] },
  { href: ROUTES.FIXTURES, label: 'Fixtures', roles: ['SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'CAPTAIN'] },
  { href: ROUTES.MATCHES, label: 'Matches', roles: ['SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'CAPTAIN'] },
  { href: ROUTES.RANKINGS, label: 'Rankings', roles: ['SUPER_ADMIN', 'TOURNAMENT_MANAGER', 'CAPTAIN'] },
  { href: ROUTES.ADMIN, label: 'Admin', roles: ['SUPER_ADMIN'] },
  { href: ROUTES.MANAGER, label: 'Manager', roles: ['TOURNAMENT_MANAGER'] },
  { href: ROUTES.CAPTAIN, label: 'My Team', roles: ['CAPTAIN'] },
]

export function Navbar() {
  const { user, role, logout, isLoggingOut } = useAuth()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const visibleLinks = navLinks.filter(
    (link) => !role || link.roles.includes(role)
  )

  const initials = user?.profile?.full_name
    ? user.profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href={ROUTES.HOME} className="flex items-center gap-2 font-bold text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600">
            <Trophy className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline text-lg">FBL Badminton</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                pathname.startsWith(link.href)
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-800 transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-white leading-none">
                      {user.profile?.full_name ?? user.email}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {role ? ROLES[role] : ''}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user.profile?.full_name ?? 'User'}</p>
                    <p className="text-xs text-slate-400 font-normal">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  disabled={isLoggingOut}
                  className="text-red-400 focus:text-red-300 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? 'Signing out...' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <button
            className="md:hidden p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950">
          <nav className="flex flex-col px-4 py-2 gap-1">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  pathname.startsWith(link.href)
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
