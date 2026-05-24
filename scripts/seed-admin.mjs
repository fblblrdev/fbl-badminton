import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wgehzrplrpkakqozgibs.supabase.co'
const SERVICE_ROLE_KEY = 'REDACTED_SERVICE_ROLE_KEY'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const email = 'prahaasm@gmail.com'
const password = 'admin123'

async function main() {
  console.log('=== FBL Badminton — Seed Super Admin ===\n')

  // 1. List existing users to check if admin already exists
  console.log('Step 1: Checking for existing user...')
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) {
    console.error('ERROR listing users:', listErr.message)
    console.error('Make sure SUPABASE_SERVICE_ROLE_KEY is correct and table grants are applied (run supabase/fix.sql first).')
    process.exit(1)
  }

  const existing = list.users.find((u) => u.email === email)
  let userId

  if (existing) {
    console.log('  Found existing user:', existing.id)
    userId = existing.id

    // Update password and ensure email is confirmed
    const { error: pwErr } = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    })
    if (pwErr) {
      console.error('ERROR updating password:', pwErr.message)
      process.exit(1)
    }
    console.log('  Password reset to:', password)
  } else {
    // Create a new user
    console.log('Step 2: Creating new user...')
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (createErr) {
      console.error('ERROR creating user:', createErr.message)
      process.exit(1)
    }
    userId = newUser.user.id
    console.log('  User created:', userId)
  }

  // 2. Upsert profile as SUPER_ADMIN (service_role bypasses RLS)
  console.log('\nStep 3: Upserting SUPER_ADMIN profile...')
  const { error: profErr } = await supabase
    .from('profiles')
    .upsert(
      { id: userId, email, full_name: 'Super Admin', role: 'SUPER_ADMIN' },
      { onConflict: 'id' }
    )

  if (profErr) {
    console.error('ERROR upserting profile:', profErr.message)
    console.error('\nThis usually means table grants are missing.')
    console.error('Fix: Run supabase/fix.sql in the Supabase SQL Editor, then re-run this script.')
    console.error('\nOr run this manually in Supabase SQL Editor:')
    console.error(`INSERT INTO profiles (id, email, full_name, role)`)
    console.error(`VALUES ('${userId}', '${email}', 'Super Admin', 'SUPER_ADMIN')`)
    console.error(`ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN', full_name = 'Super Admin';`)
    process.exit(1)
  }

  console.log('  Profile set to SUPER_ADMIN.')

  // 3. Verify profile exists
  const { data: verifyProfile, error: verifyErr } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', userId)
    .maybeSingle()

  if (verifyErr) {
    console.error('ERROR verifying profile:', verifyErr.message)
    process.exit(1)
  }

  if (!verifyProfile) {
    console.error('ERROR: Profile row was not found after upsert. Run supabase/fix.sql and try again.')
    process.exit(1)
  }

  console.log('\n=== Super Admin ready! ===')
  console.log('  Auth UUID: ', userId)
  console.log('  Email:    ', email)
  console.log('  Password: ', password)
  console.log('  Role:     ', verifyProfile.role)
  console.log('\nLogin at: http://localhost:3000/login')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
