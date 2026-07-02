import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const DEV_USER_ID = '070f1c3d-ddd5-48d8-8e1c-6af1cce33164';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      body_text,
      media_urls,
      thumbnail_url,
      hashtags,
      status,
      scheduled_at,
      published_at,
      created_at,
      updated_at,
      content_types (
        code,
        name
      ),
      post_targets (
        id,
        status,
        published_at,
        platform_post_url,
        social_accounts (
          id,
          username,
          display_name,
          platforms (
            code,
            name
          )
        )
      )
    `)
    .eq('id', params.id)
    .eq('user_id', DEV_USER_ID)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const {
    title,
    body_text,
    media_urls,
    thumbnail_url,
    hashtags,
    status,
    scheduled_at,
    content_type_id,
  } = body;

  if (status === 'scheduled' && !scheduled_at) {
    return NextResponse.json(
      { error: 'scheduled_at is required when status is scheduled' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('posts')
    .update({
      ...(title !== undefined && { title }),
      ...(body_text !== undefined && { body_text }),
      ...(media_urls !== undefined && { media_urls }),
      ...(thumbnail_url !== undefined && { thumbnail_url }),
      ...(hashtags !== undefined && { hashtags }),
      ...(status !== undefined && { status }),
      ...(scheduled_at !== undefined && { scheduled_at }),
      ...(content_type_id !== undefined && { content_type_id }),
    })
    .eq('id', params.id)
    .eq('user_id', DEV_USER_ID)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', params.id)
    .eq('user_id', DEV_USER_ID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
