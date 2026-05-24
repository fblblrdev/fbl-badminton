import { z } from 'zod'

export const startAuctionSchema = z.object({
  tournament_id: z.string().uuid('Invalid tournament ID'),
})

export const placeBidSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  player_id: z.string().uuid('Invalid player ID'),
  team_id: z.string().uuid('Invalid team ID'),
  amount: z
    .number({ error: 'Amount must be a number' })
    .int()
    .min(1, 'Bid amount must be at least 1'),
})

export const confirmBidSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
  player_id: z.string().uuid('Invalid player ID'),
  team_id: z.string().uuid('Invalid team ID'),
  amount: z
    .number({ error: 'Amount must be a number' })
    .int()
    .min(1, 'Amount must be at least 1'),
})

export const nextPlayerSchema = z.object({
  session_id: z.string().uuid('Invalid session ID'),
})

export const auctionStateSchema = z.object({
  tournament_id: z.string().uuid('Invalid tournament ID'),
})

export type StartAuctionValues = z.infer<typeof startAuctionSchema>
export type PlaceBidValues = z.infer<typeof placeBidSchema>
export type ConfirmBidValues = z.infer<typeof confirmBidSchema>
export type NextPlayerValues = z.infer<typeof nextPlayerSchema>
