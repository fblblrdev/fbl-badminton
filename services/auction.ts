import { AuctionRepository } from '@/repositories/auction'
import { TeamRepository } from '@/repositories/team'
import { PlayerRepository } from '@/repositories/player'
import { TournamentRepository } from '@/repositories/tournament'
import type { AuctionState, AuctionSession, AuctionBid, AuctionResult, TeamWithBalance } from '@/types'
import type { DbClient } from '@/repositories/base'

export class AuctionService {
  private auctionRepo: AuctionRepository
  private teamRepo: TeamRepository
  private playerRepo: PlayerRepository
  private tournamentRepo: TournamentRepository

  constructor(client: DbClient) {
    this.auctionRepo = new AuctionRepository(client)
    this.teamRepo = new TeamRepository(client)
    this.playerRepo = new PlayerRepository(client)
    this.tournamentRepo = new TournamentRepository(client)
  }

  async getAuctionState(tournamentId: string): Promise<AuctionState> {
    const session = await this.auctionRepo.findSessionByTournament(tournamentId)
    const teams = await this.teamRepo.findByTournament(tournamentId)

    const teamsWithBalance: TeamWithBalance[] = await Promise.all(
      teams.map(async (team) => {
        const players = team.players ?? []
        const female_count = players.filter((p) => p.gender === 'female').length
        const players_by_category: Record<string, number> = {}
        players.forEach((p) => {
          if (p.skill_category_id) {
            players_by_category[p.skill_category_id] =
              (players_by_category[p.skill_category_id] ?? 0) + 1
          }
        })
        return {
          ...team,
          player_count: players.length,
          female_count,
          players_by_category,
        }
      })
    )

    if (!session) {
      return {
        session: null,
        currentPlayer: null,
        currentBid: null,
        bids: [],
        teams: teamsWithBalance,
        results: [],
      }
    }

    const currentPlayer = session.current_player_id
      ? await this.playerRepo.findById(session.current_player_id)
      : null

    const bids = session.current_player_id
      ? await this.auctionRepo.findBidsByPlayer(session.id, session.current_player_id)
      : []

    const currentBid = bids.length > 0 ? bids[0] : null
    const results = await this.auctionRepo.findResultsBySession(session.id)

    return {
      session,
      currentPlayer,
      currentBid,
      bids,
      teams: teamsWithBalance,
      results,
    }
  }

  async startAuction(tournamentId: string): Promise<AuctionSession> {
    const existing = await this.auctionRepo.findSessionByTournament(tournamentId)

    if (existing && existing.status === 'active') {
      throw new Error('Auction is already active')
    }

    if (existing && existing.status === 'paused') {
      return this.auctionRepo.updateSession(existing.id, { status: 'active' })
    }

    const unassignedPlayers = await this.playerRepo.findUnassigned(tournamentId)
    const captains = await this.playerRepo.findCaptains(tournamentId)

    const nonCaptainPlayers = unassignedPlayers.filter(
      (p) => !captains.some((c) => c.id === p.id)
    )

    if (nonCaptainPlayers.length === 0) {
      throw new Error('No players available for auction')
    }

    const firstPlayer = nonCaptainPlayers[0]

    const session = await this.auctionRepo.createSession({
      tournament_id: tournamentId,
      status: 'active',
      current_player_id: firstPlayer.id,
    })

    return session
  }

  async pauseAuction(sessionId: string): Promise<AuctionSession> {
    const session = await this.auctionRepo.findSessionById(sessionId)
    if (!session) throw new Error('Session not found')
    if (session.status !== 'active') throw new Error('Auction is not active')

    return this.auctionRepo.updateSession(sessionId, { status: 'paused' })
  }

  async placeBid(
    sessionId: string,
    playerId: string,
    teamId: string,
    amount: number
  ): Promise<AuctionBid> {
    const session = await this.auctionRepo.findSessionById(sessionId)
    if (!session) throw new Error('Session not found')
    if (session.status !== 'active') throw new Error('Auction is not active')
    if (session.current_player_id !== playerId) {
      throw new Error('This player is not currently up for auction')
    }

    const tournament = await this.tournamentRepo.findById(session.tournament_id)
    if (!tournament) throw new Error('Tournament not found')

    const team = await this.teamRepo.findById(teamId)
    if (!team) throw new Error('Team not found')

    if (team.balance < amount) {
      throw new Error('Insufficient balance to place this bid')
    }

    const existingHighest = await this.auctionRepo.getHighestBid(sessionId, playerId)
    if (existingHighest && amount <= existingHighest.amount) {
      throw new Error(`Bid must be higher than current bid of ${existingHighest.amount}`)
    }

    const minBid = existingHighest
      ? existingHighest.amount + tournament.auction_increment
      : tournament.auction_increment

    if (amount < minBid) {
      throw new Error(`Minimum bid is ${minBid}`)
    }

    const alreadySold = await this.auctionRepo.isPlayerAlreadySold(sessionId, playerId)
    if (alreadySold) throw new Error('Player has already been sold')

    const categories = await this.tournamentRepo.findSkillCategories(tournament.id)
    const player = await this.playerRepo.findById(playerId)

    if (player?.skill_category_id) {
      const category = categories.find((c) => c.id === player.skill_category_id)
      if (category) {
        const teamPlayers = team.players ?? []
        const categoryCount = teamPlayers.filter(
          (p) => p.skill_category_id === category.id
        ).length
        if (categoryCount >= category.max_players) {
          throw new Error(
            `Team has reached max players for category "${category.name}"`
          )
        }
      }
    }

    const teamPlayers = team.players ?? []
    if (player?.gender === 'female') {
      const femaleCount = teamPlayers.filter((p) => p.gender === 'female').length
      if (femaleCount >= tournament.max_female_players) {
        throw new Error('Team has reached the maximum number of female players')
      }
    }

    if (teamPlayers.length >= tournament.max_team_size) {
      throw new Error('Team has reached maximum squad size')
    }

    const bid = await this.auctionRepo.createBid({
      session_id: sessionId,
      player_id: playerId,
      team_id: teamId,
      amount,
      is_winning: false,
    })

    return bid
  }

  async confirmBidAndAdvance(
    sessionId: string,
    playerId: string,
    teamId: string,
    amount: number
  ): Promise<{ result: AuctionResult; session: AuctionSession }> {
    const session = await this.auctionRepo.findSessionById(sessionId)
    if (!session) throw new Error('Session not found')
    if (session.current_player_id !== playerId) {
      throw new Error('Player mismatch')
    }

    await this.auctionRepo.markAllBidsAsLosing(sessionId, playerId)

    const highestBid = await this.auctionRepo.getHighestBid(sessionId, playerId)
    if (highestBid) {
      await this.auctionRepo.markBidAsWinning(highestBid.id)
    }

    const result = await this.auctionRepo.createResult({
      session_id: sessionId,
      player_id: playerId,
      team_id: teamId,
      final_amount: amount,
    })

    await this.teamRepo.addPlayer({
      team_id: teamId,
      player_id: playerId,
    })

    await this.teamRepo.deductBalance(teamId, amount)

    // Immediately advance to next player in the same request
    const updatedSession = await this.moveToNextPlayer(sessionId)

    return { result, session: updatedSession }
  }

  async skipPlayer(sessionId: string): Promise<AuctionSession> {
    const session = await this.auctionRepo.findSessionById(sessionId)
    if (!session) throw new Error('Session not found')
    if (!session.current_player_id) throw new Error('No player currently up for auction')

    // Record this player as skipped so it goes to the back of the queue
    const skipped = [...(session.skipped_player_ids ?? []), session.current_player_id]

    return this.moveToNextPlayerInternal(sessionId, session, skipped)
  }

  async moveToNextPlayer(sessionId: string): Promise<AuctionSession> {
    const session = await this.auctionRepo.findSessionById(sessionId)
    if (!session) throw new Error('Session not found')

    return this.moveToNextPlayerInternal(sessionId, session, session.skipped_player_ids ?? [])
  }

  private async moveToNextPlayerInternal(
    sessionId: string,
    session: AuctionSession,
    skippedIds: string[]
  ): Promise<AuctionSession> {
    const unassignedPlayers = await this.playerRepo.findUnassigned(session.tournament_id)
    const captains = await this.playerRepo.findCaptains(session.tournament_id)

    // All eligible players excluding captains and the current player
    const eligible = unassignedPlayers.filter(
      (p) => !captains.some((c) => c.id === p.id) && p.id !== session.current_player_id
    )

    // Non-skipped players first, then skipped players at the end (preserving their relative order)
    const nonSkipped = eligible.filter((p) => !skippedIds.includes(p.id))
    const skippedQueue = skippedIds
      .map((id) => eligible.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => p !== undefined)

    const queue = [...nonSkipped, ...skippedQueue]

    if (queue.length === 0) {
      return this.auctionRepo.updateSession(sessionId, {
        status: 'completed',
        current_player_id: null,
        skipped_player_ids: [],
      })
    }

    const nextPlayer = queue[0]
    // Remove from skipped list once they become current
    const updatedSkipped = skippedIds.filter((id) => id !== nextPlayer.id)

    return this.auctionRepo.updateSession(sessionId, {
      current_player_id: nextPlayer.id,
      skipped_player_ids: updatedSkipped,
    })
  }
}
