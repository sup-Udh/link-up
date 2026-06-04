import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

function generateRandomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars like I, O, 1, 0
  let code = '';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const code = generateRandomCode();
    // Expires in 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('extension_pairing_codes')
      .insert([
        { code, user_id: user.id, expires_at: expiresAt }
      ]);

    if (error) {
      console.error('Error inserting code:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ code, expiresAt });
  } catch (error) {
    console.error('Code gen error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
