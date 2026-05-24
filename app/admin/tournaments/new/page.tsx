import { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { TournamentForm } from '@/components/tournament/TournamentForm'

export const metadata: Metadata = {
  title: 'New Tournament | FBL Badminton',
}

export default function NewTournamentPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Create Tournament"
        description="Set up a new badminton tournament with auction settings"
      />
      <TournamentForm mode="create" />
    </div>
  )
}
