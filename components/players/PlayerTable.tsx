'use client'

import { useState } from 'react'
import { Crown, Pencil, Trash2, Search } from 'lucide-react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { Player } from '@/types'
import { GENDER_OPTIONS } from '@/lib/constants'

interface PlayerTableProps {
  players: Player[]
  onEdit?: (player: Player) => void
  onDelete?: (playerId: string) => void
  isDeleting?: boolean
}

export function PlayerTable({ players, onEdit, onDelete, isDeleting }: PlayerTableProps) {
  const [search, setSearch] = useState('')

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.skill_category?.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input
          placeholder="Search players..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Status</TableHead>
              {(onEdit || onDelete) && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                  {search ? 'No players match your search.' : 'No players added yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((player) => {
                const initials = player.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)

                return (
                  <TableRow key={player.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-blue-900/40 text-blue-300">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{player.name}</span>
                          {player.is_captain && (
                            <Crown className="h-3.5 w-3.5 text-amber-400" />
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {GENDER_OPTIONS[player.gender]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {player.skill_category ? (
                        <Badge variant="outline" className="text-xs">
                          {player.skill_category.name}
                        </Badge>
                      ) : (
                        <span className="text-slate-500 text-sm">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-blue-400 font-semibold">
                        {player.base_price.toLocaleString()} pts
                      </span>
                    </TableCell>
                    <TableCell>
                      {player.is_captain ? (
                        <Badge variant="warning" className="text-xs">Captain</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Player</Badge>
                      )}
                    </TableCell>
                    {(onEdit || onDelete) && (
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onEdit(player)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {onDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-500 hover:text-red-400"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Player</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete{' '}
                                    <strong className="text-white">{player.name}</strong>? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => onDelete(player.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-xs text-slate-500">
        Showing {filtered.length} of {players.length} players
      </p>
    </div>
  )
}
