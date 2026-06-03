import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Find the code and check if it's expired
    const { data: pairingRecord, error: findError } = await supabase
      .from('extension_pairing_codes')
      .select('*')
      .eq('code', code)
      .single();

    if (findError || !pairingRecord) {
      return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 });
    }

    if (new Date(pairingRecord.expires_at) < new Date()) {
      // Code is expired, delete it
      await supabase.from('extension_pairing_codes').delete().eq('id', pairingRecord.id);
      return NextResponse.json({ error: 'Code has expired' }, { status: 400 });
    }

    // Code is valid. Generate a long-lived extension token.
    const token = `linko_ext_${crypto.randomBytes(32).toString('hex')}`;
    const userId = pairingRecord.user_id;

    const { error: insertError } = await supabase
      .from('extension_tokens')
      .insert([{ token, user_id: userId }]);

    if (insertError) {
      return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
    }

    // Delete the used code
    await supabase.from('extension_pairing_codes').delete().eq('id', pairingRecord.id);

    // Fetch user profile info to return immediately
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();

    return NextResponse.json({
      token,
      user: {
        id: userId,
        email: profile?.email,
        name: profile?.full_name,
        avatar: profile?.avatar_url
      }
    });

  } catch (error) {
    console.error('Code verification error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
