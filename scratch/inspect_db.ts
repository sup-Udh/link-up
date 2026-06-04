import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const envContent = fs.readFileSync(path.join(__dirname, '../.env.local'), 'utf8')
const env: { [key: string]: string } = {}
envContent.split('\n').forEach(line => {
  const parts = line.split('=')
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim()
  }
})

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
)

async function run() {
  const { data, error } = await supabase.from('rooms').select('*').limit(1)
  if (error) {
    console.error('Error fetching rooms:', error)
  } else {
    console.log('Fetched room record:', data)
  }
}

run()
