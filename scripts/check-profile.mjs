import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wgehzrplrpkakqozgibs.supabase.co'
const SERVICE_ROLE_KEY = 'REDACTED_SERVICE_ROLE_KEY'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  // Check auth users
  const { data: list } = await supabase.auth.admin.listUsers()
  console.log('Auth users:')
  list.users.forEach(u => console.log(' ', u.id, u.email, u.email_confirmed_at ? 'confirmed' : 'NOT confirmed'))

  // Check profiles
  const { data: profiles, error } = await supabase.from('profiles').select('*')
  console.log('\nProfiles:', error ? 'ERROR: ' + error.message : JSON.stringify(profiles, null, 2))

  // Try to upsert profile for our user
  const user = list.users.find(u => u.email === 'prahaasm@gmail.com')
  if (user) {
    console.log('\nUpserting profile for', user.id)
    const { data, error: upsertErr } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: 'prahaasm@gmail.com', full_name: 'Super Admin', role: 'SUPER_ADMIN' }, { onConflict: 'id' })
      .select()
    console.log('Upsert result:', upsertErr ? 'ERROR: ' + upsertErr.message : JSON.stringify(data))
  }
}

main()
