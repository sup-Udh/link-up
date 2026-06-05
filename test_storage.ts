import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data, "Error:", error);
  if (!data || data.length === 0) {
    console.log("Attempting to create bucket 'profiles'...");
    const res = await supabase.storage.createBucket('profiles', { public: true });
    console.log("Create Bucket Result:", res);
  } else {
    // Check if 'profiles' exists
    const hasProfiles = data.some(b => b.name === 'profiles');
    if (!hasProfiles) {
      console.log("Attempting to create bucket 'profiles'...");
      const res = await supabase.storage.createBucket('profiles', { public: true });
      console.log("Create Bucket Result:", res);
    }
  }
}
run();
