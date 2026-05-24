'use client'

import { useState } from 'react'
import { Shuffle, Grid3x3, Swords } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
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
import { toast } from '@/hooks/use-toast'
import type { FixtureType } from '@/types'
import { useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/constants'

interface FixtureGeneratorProps {
  tournamentId: string
}

export function FixtureGenerator({ tournamentId }: FixtureGeneratorProps) {
  const [type, setType] = useState<FixtureType>('round_robin')
  const [isGenerating, setIsGenerating] = useState(false)
  const queryClient = useQueryClient()

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch('/api/fixtures/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tournament_id: tournamentId, type }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to generate fixtures')
      }
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.FIXTURES, tournamentId] })
      toast({ title: 'Fixtures generated successfully!', variant: 'default' })
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to generate fixtures',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const typeIcons = {
    round_robin: Grid3x3,
    knockout: Swords,
    manual: Shuffle,
  }
  const Icon = typeIcons[type]

  return (
    <div className="flex items-end gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Fixture Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as FixtureType)}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="round_robin">Round Robin</SelectItem>
            <SelectItem value="knockout">Knockout</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button disabled={isGenerating}>
            <Icon className="h-4 w-4 mr-2" />
            Generate Fixtures
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Generate Fixtures</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all existing fixtures for this tournament with a new{' '}
              <strong className="text-white">{type.replace('_', ' ')}</strong> schedule.
              Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleGenerate} disabled={isGenerating}>
              Generate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
