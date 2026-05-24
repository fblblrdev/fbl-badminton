'use client'

import { useFieldArray, useFormContext } from 'react-hook-form'
import { Plus, Trash2, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DEFAULT_SKILL_CATEGORIES } from '@/lib/constants'
import type { TournamentFormValues } from '@/lib/validations/tournament'

export function SkillCategoryForm() {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<TournamentFormValues>()

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skill_categories',
  })

  const skillCategories = watch('skill_categories')

  const addDefaultCategories = () => {
    DEFAULT_SKILL_CATEGORIES.forEach((name) => {
      if (!fields.some((f) => f.name === name)) {
        append({ name, base_price: 100, min_players: 1, max_players: 5, is_captain_category: false })
      }
    })
  }

  const handleCaptainCategoryToggle = (index: number) => {
    // Only one category can be the captain category at a time
    skillCategories.forEach((_, i) => {
      setValue(`skill_categories.${i}.is_captain_category`, i === index ? !skillCategories[i].is_captain_category : false)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Skill Categories</h3>
          <p className="text-xs text-slate-400 mt-0.5">Click the <Crown className="inline h-3 w-3 text-amber-400" /> icon to mark which category captains belong to — their base price will be that category&apos;s base price.</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDefaultCategories}
          >
            Add Defaults
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() =>
              append({ name: '', base_price: 100, min_players: 1, max_players: 5, is_captain_category: false })
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </div>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 text-slate-400 border border-dashed border-slate-700 rounded-lg">
          <p className="text-sm">No skill categories yet.</p>
          <p className="text-xs mt-1">Add categories or use the defaults.</p>
        </div>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <Card key={field.id} className="border-slate-700">
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm text-slate-300">Category {index + 1}</CardTitle>
                  {skillCategories[index]?.is_captain_category && (
                    <span className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                      <Crown className="h-3 w-3" /> Captain Category
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleCaptainCategoryToggle(index)}
                    title="Mark as captain category"
                    className={`p-1.5 rounded transition-colors ${
                      skillCategories[index]?.is_captain_category
                        ? 'text-amber-400 bg-amber-400/10'
                        : 'text-slate-500 hover:text-amber-400'
                    }`}
                  >
                    <Crown className="h-3.5 w-3.5" />
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-500 hover:text-red-400"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="col-span-2 sm:col-span-1 space-y-1.5">
                <Label className="text-xs">Name</Label>
                <Input
                  {...register(`skill_categories.${index}.name`)}
                  placeholder="e.g. Advanced"
                  className="h-8 text-sm"
                />
                {errors.skill_categories?.[index]?.name && (
                  <p className="text-xs text-red-400">
                    {errors.skill_categories[index]?.name?.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Base Price</Label>
                <Input
                  type="number"
                  {...register(`skill_categories.${index}.base_price`, {
                    valueAsNumber: true,
                  })}
                  placeholder="100"
                  className="h-8 text-sm"
                />
                {errors.skill_categories?.[index]?.base_price && (
                  <p className="text-xs text-red-400">
                    {errors.skill_categories[index]?.base_price?.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Min Players</Label>
                <Input
                  type="number"
                  {...register(`skill_categories.${index}.min_players`, {
                    valueAsNumber: true,
                  })}
                  placeholder="1"
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Max Players</Label>
                <Input
                  type="number"
                  {...register(`skill_categories.${index}.max_players`, {
                    valueAsNumber: true,
                  })}
                  placeholder="5"
                  className="h-8 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {errors.skill_categories?.root && (
        <p className="text-xs text-red-400">{errors.skill_categories.root.message}</p>
      )}
      {typeof errors.skill_categories?.message === 'string' && (
        <p className="text-xs text-red-400">{errors.skill_categories.message}</p>
      )}
    </div>
  )
}
