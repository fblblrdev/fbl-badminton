import { z } from 'zod'

export const playerSchema = z.object({
  name: z.string().min(1, 'Player name is required').max(200),
  gender: z.enum(['male', 'female'], {
    error: 'Gender is required',
  }),
  skill_category_id: z.string().min(1, 'Skill category is required'),
  base_price: z
    .number({ error: 'Base price must be a number' })
    .min(0, 'Base price must be non-negative'),
  is_captain: z.boolean().default(false),
  phone: z
    .string()
    .optional()
    .transform((v) => v ?? '')
    .refine((v) => v === '' || /^\+?[\d\s\-()]{7,15}$/.test(v), {
      message: 'Please enter a valid phone number',
    }),
  email: z
    .string()
    .optional()
    .transform((v) => v ?? '')
    .refine((v) => v === '' || z.string().email().safeParse(v).success, {
      message: 'Please enter a valid email address',
    }),
})

export const bulkPlayerSchema = z.array(
  z.object({
    name: z.string().min(1),
    gender: z.enum(['male', 'female']),
    skill_category: z.string().min(1),
    base_price: z.coerce.number().min(0),
    is_captain: z.coerce.boolean().default(false),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
  })
)

export type PlayerFormValues = z.infer<typeof playerSchema>
export type BulkPlayerValues = z.infer<typeof bulkPlayerSchema>
