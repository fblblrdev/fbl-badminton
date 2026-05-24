'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PlayerTable } from '@/components/players/PlayerTable'
import { PlayerForm } from '@/components/players/PlayerForm'
import { CSVUpload } from '@/components/players/CSVUpload'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast'
import type { Player, SkillCategory, CSVPlayer } from '@/types'
import type { PlayerFormValues } from '@/lib/validations/player'
import { QUERY_KEYS } from '@/lib/constants'

export default function PlayersPage() {
  const { id: tournamentId } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [showDialog, setShowDialog] = useState(false)
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null)

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: [QUERY_KEYS.PLAYERS, tournamentId],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/players`)
      if (!res.ok) throw new Error('Failed to fetch players')
      const json = await res.json()
      return json.data
    },
  })

  const { data: categories = [] } = useQuery<SkillCategory[]>({
    queryKey: [QUERY_KEYS.TOURNAMENTS, tournamentId, 'categories'],
    queryFn: async () => {
      const res = await fetch(`/api/tournaments/${tournamentId}/categories`)
      if (!res.ok) return []
      const json = await res.json()
      return json.data ?? []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: PlayerFormValues) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to create player')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLAYERS, tournamentId] })
      setShowDialog(false)
      toast({ title: 'Player added successfully!' })
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ playerId, data }: { playerId: string; data: PlayerFormValues }) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to update player')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLAYERS, tournamentId] })
      setShowDialog(false)
      setEditingPlayer(null)
      toast({ title: 'Player updated successfully!' })
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/players/${playerId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to delete player')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLAYERS, tournamentId] })
      toast({ title: 'Player deleted' })
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
  })

  const csvMutation = useMutation({
    mutationFn: async (csvPlayers: CSVPlayer[]) => {
      const res = await fetch(`/api/tournaments/${tournamentId}/players/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: csvPlayers }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to upload players')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PLAYERS, tournamentId] })
      toast({ title: 'Players uploaded successfully!' })
    },
    onError: (err) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    },
  })

  const handleEdit = (player: Player) => {
    setEditingPlayer(player)
    setShowDialog(true)
  }

  const handleSubmit = async (data: PlayerFormValues) => {
    if (editingPlayer) {
      await updateMutation.mutateAsync({ playerId: editingPlayer.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  return (
    <div>
      <PageHeader
        title="Players"
        description="Manage tournament players"
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditingPlayer(null)
            setShowDialog(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </PageHeader>

      <Tabs defaultValue="list">
        <TabsList className="mb-4">
          <TabsTrigger value="list">Player List ({players.length})</TabsTrigger>
          <TabsTrigger value="csv">
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            CSV Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          {isLoading ? (
            <div className="text-center py-10 text-slate-500">Loading players...</div>
          ) : (
            <PlayerTable
              players={players}
              onEdit={handleEdit}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
            />
          )}
        </TabsContent>

        <TabsContent value="csv">
          <div className="max-w-2xl">
            <CSVUpload
              onUpload={async (csvPlayers) => csvMutation.mutateAsync(csvPlayers)}
              isLoading={csvMutation.isPending}
            />
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={(open) => {
        setShowDialog(open)
        if (!open) setEditingPlayer(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingPlayer ? 'Edit Player' : 'Add New Player'}</DialogTitle>
          </DialogHeader>
          <PlayerForm
            onSubmit={handleSubmit}
            categories={categories}
            defaultValues={editingPlayer ? {
              name: editingPlayer.name,
              gender: editingPlayer.gender,
              skill_category_id: editingPlayer.skill_category_id ?? '',
              base_price: editingPlayer.base_price,
              is_captain: editingPlayer.is_captain,
              phone: editingPlayer.phone ?? '',
              email: editingPlayer.email ?? '',
            } : undefined}
            mode={editingPlayer ? 'edit' : 'create'}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
