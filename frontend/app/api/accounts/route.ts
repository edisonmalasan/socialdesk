import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const DEV_USER_ID = '070f1c3d-ddd5-48d8-8e1c-6af1cce33164';

export async function GET() {
  const { data, error } = await supabase
    .from('social_accounts')
    .select(`
      id,
      username,
      display_name,
      profile_url,
      avatar_url,
      is_active,
      connected_at,
      platforms (
        id,
        code,
        name
      )
    `)
    .eq('user_id', DEV_USER_ID)
    .eq('is_active', true)
    .order('connected_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const { platformCode, username, display_name, external_id } = await request.json();

  if (!platformCode || !external_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const { data: platform, error: platformError } = await supabase
    .from('platforms')
    .select('id')
    .eq('code', platformCode)
    .single();

  if (platformError || !platform) {
    return NextResponse.json({ error: 'Platform not found' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('social_accounts')
    .insert({
      user_id: DEV_USER_ID,
      platform_id: platform.id,
      external_id,
      username,
      display_name,
      is_active: true,
    })
    .select(`
      id,
      username,
      display_name,
      profile_url,
      avatar_url,
      is_active,
      connected_at,
      platforms (
        id,
        code,
        name
      )
    `)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
  const { id } = await request.json();

  if (!id) return NextResponse.json({ error: 'Missing account id' }, { status: 400 });

  const { error } = await supabase
    .from('social_accounts')
    .update({ is_active: false })
    .eq('id', id)
    .eq('user_id', DEV_USER_ID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
