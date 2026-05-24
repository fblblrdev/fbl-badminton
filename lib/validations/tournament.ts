import { z } from 'zod'

export const skillCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  base_price: z
    .number({ error: 'Base price must be a number' })
    .min(0, 'Base price must be non-negative'),
  min_players: z
    .number({ error: 'Min players must be a number' })
    .int()
    .min(0, 'Min players must be non-negative'),
  max_players: z
    .number({ error: 'Max players must be a number' })
    .int()
    .min(1, 'Max players must be at least 1'),
  is_captain_category: z.boolean().default(false),
})

export const tournamentSchema = z
  .object({
    name: z.string().min(1, 'Tournament name is required').max(200),
    venue: z.string().min(1, 'Venue is required').max(300),
    start_date: z.string().min(1, 'Start date is required'),
    end_date: z.string().min(1, 'End date is required'),
    auction_points: z
      .number({ error: 'Auction points must be a number' })
      .int()
      .min(1, 'Auction points must be at least 1'),
    auction_increment: z
      .number({ error: 'Auction increment must be a number' })
      .int()
      .min(1, 'Auction increment must be at least 1'),
    timer_seconds: z
      .number({ error: 'Timer seconds must be a number' })
      .int()
      .min(5, 'Timer must be at least 5 seconds')
      .max(300, 'Timer cannot exceed 300 seconds'),
    captain_is_player: z.boolean().default(true),
    min_team_size: z
      .number({ error: 'Min team size must be a number' })
      .int()
      .min(1, 'Min team size must be at least 1'),
    max_team_size: z
      .number({ error: 'Max team size must be a number' })
      .int()
      .min(1, 'Max team size must be at least 1'),
    min_female_players: z
      .number({ error: 'Min female players must be a number' })
      .int()
      .min(0, 'Min female players must be non-negative'),
    max_female_players: z
      .number({ error: 'Max female players must be a number' })
      .int()
      .min(0, 'Max female players must be non-negative'),
    skill_categories: z
      .array(skillCategorySchema)
      .min(1, 'At least one skill category is required'),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  })
  .refine((data) => data.max_team_size >= data.min_team_size, {
    message: 'Max team size must be >= min team size',
    path: ['max_team_size'],
  })
  .refine((data) => data.max_female_players >= data.min_female_players, {
    message: 'Max female players must be >= min female players',
    path: ['max_female_players'],
  })

export type TournamentFormValues = z.infer<typeof tournamentSchema>
export type SkillCategoryFormValues = z.infer<typeof skillCategorySchema>
