import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import {
  cancelScheduledPostJobs,
  scheduleScheduledPostJobs,
} from '../scheduled-post-jobs';
import { getUserIdFromToken } from '@/lib/auth';

type PostRouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: PostRouteContext) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

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
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: PostRouteContext) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
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
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (data.status === 'scheduled' && data.scheduled_at) {
    await scheduleScheduledPostJobs(data.id);
  } else {
    await cancelScheduledPostJobs(data.id);
  }

  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: PostRouteContext) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await cancelScheduledPostJobs(id);

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
