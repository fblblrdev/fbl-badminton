import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { CreateUserButton } from '@/components/auth/CreateUserButton'
import { UserTable } from '@/components/auth/UserTable'

export default async function UsersPage() {
  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Create and manage captains and tournament managers"
      >
        <CreateUserButton />
      </PageHeader>
      <UserTable users={profiles ?? []} />
    </div>
  )
}
