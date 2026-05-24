const K_FACTOR = 32
const DEFAULT_ELO = 1200

/**
 * Calculate new ELO rating after a match
 * @param currentRating - Player's current ELO
 * @param opponentRating - Opponent's ELO
 * @param result - 1 for win, 0 for loss, 0.5 for draw
 */
export function calculateElo(
  currentRating: number,
  opponentRating: number,
  result: 0 | 0.5 | 1
): number {
  const expectedScore = expectedOutcome(currentRating, opponentRating)
  const newRating = currentRating + K_FACTOR * (result - expectedScore)
  return Math.max(100, Math.round(newRating))
}

/**
 * Expected outcome based on ratings
 */
export function expectedOutcome(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))
}

/**
 * Calculate win probability percentage
 */
export function winProbability(ratingA: number, ratingB: number): number {
  return expectedOutcome(ratingA, ratingB) * 100
}

/**
 * Get ELO tier label
 */
export function getEloTier(rating: number): {
  label: string
  color: string
  minRating: number
} {
  if (rating >= 2000) return { label: 'Master', color: 'text-purple-400', minRating: 2000 }
  if (rating >= 1800) return { label: 'Expert', color: 'text-red-400', minRating: 1800 }
  if (rating >= 1600) return { label: 'Advanced', color: 'text-orange-400', minRating: 1600 }
  if (rating >= 1400) return { label: 'Intermediate', color: 'text-blue-400', minRating: 1400 }
  if (rating >= 1200) return { label: 'Beginner+', color: 'text-green-400', minRating: 1200 }
  return { label: 'Beginner', color: 'text-slate-400', minRating: 0 }
}

export { DEFAULT_ELO }
