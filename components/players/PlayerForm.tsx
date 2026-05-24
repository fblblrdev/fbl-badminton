'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { playerSchema, type PlayerFormValues } from '@/lib/validations/player'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SkillCategory } from '@/types'

// Input type (before transforms)
type PlayerFormInput = z.input<typeof playerSchema>

interface PlayerFormProps {
  onSubmit: (data: PlayerFormValues) => Promise<void>
  categories: SkillCategory[]
  defaultValues?: Partial<PlayerFormInput>
  mode?: 'create' | 'edit'
  isLoading?: boolean
}

export function PlayerForm({ onSubmit, categories, defaultValues, mode = 'create', isLoading }: PlayerFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PlayerFormInput, unknown, PlayerFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(playerSchema) as any,
    defaultValues: {
      name: '',
      gender: 'male',
      skill_category_id: '',
      base_price: 100,
      is_captain: false,
      phone: '',
      email: '',
      ...defaultValues,
    },
  })

  const isCaptain = watch('is_captain')
  const gender = watch('gender')
  const categoryId = watch('skill_category_id')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Player Name *</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="John Doe"
        />
        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Gender *</Label>
          <Select
            value={gender}
            onValueChange={(v) => setValue('gender', v as 'male' | 'female')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          {errors.gender && <p className="text-xs text-red-400">{errors.gender.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Skill Category *</Label>
          <Select
            value={categoryId}
            onValueChange={(v) => setValue('skill_category_id', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.skill_category_id && <p className="text-xs text-red-400">{errors.skill_category_id.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="base_price">Base Price (pts) *</Label>
        <Input
          id="base_price"
          type="number"
          {...register('base_price', { valueAsNumber: true })}
          placeholder="100"
        />
        {errors.base_price && <p className="text-xs text-red-400">{errors.base_price.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+1 234 567 8900"
          />
          {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="player@example.com"
          />
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <Switch
          id="is_captain"
          checked={isCaptain}
          onCheckedChange={(v) => setValue('is_captain', v)}
        />
        <Label htmlFor="is_captain" className="cursor-pointer">
          Mark as Captain
        </Label>
      </div>

      <Button type="submit" className="w-full" loading={isSubmitting || isLoading}>
        {mode === 'create' ? 'Add Player' : 'Save Changes'}
      </Button>
    </form>
  )
}
