import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) acc.url = line.split('=')[1];
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) acc.key = line.split('=')[1];
  return acc;
}, {});

const supabase = createClient(env.url, env.key);
const { data, error } = await supabase.from('rooms').select('*').order('created_at', { ascending: false }).limit(3);
console.log(JSON.stringify(data, null, 2));
