import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    const token = authHeader.split(' ')[1];
    const supabase = await createClient();

    // Delete token from database
    const { error } = await supabase
      .from('extension_tokens')
      .delete()
      .eq('token', token);

    if (error) {
      return NextResponse.json({ error: 'Failed to revoke token' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Revoke error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
