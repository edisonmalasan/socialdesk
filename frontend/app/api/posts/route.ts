import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { scheduleScheduledPostJobs } from './scheduled-post-jobs';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(request: Request) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');

  let query = supabase
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
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status && status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter by platform after fetching since platform lives in post_targets
  if (platform && platform !== 'all') {
    const filtered = data.filter((post: any) =>
      post.post_targets?.some(
        (t: any) => t.social_accounts?.platforms?.code === platform
      )
    );
    return NextResponse.json(filtered);
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const {
    title,
    body_text,
    media_urls,
    thumbnail_url,
    hashtags,
    status = 'draft',
    scheduled_at,
    content_type_id = 1,
    target_account_ids = [],
  } = body;

  if (!body_text && !media_urls?.length) {
    return NextResponse.json(
      { error: 'Post must have body text or media' },
      { status: 400 }
    );
  }

  if (status === 'scheduled' && !scheduled_at) {
    return NextResponse.json(
      { error: 'scheduled_at is required when status is scheduled' },
      { status: 400 }
    );
  }

  const { data: post, error: postError } = await supabase
    .from('posts')
    .insert({
      user_id: userId,
      content_type_id,
      title,
      body_text,
      media_urls,
      thumbnail_url,
      hashtags,
      status,
      scheduled_at: scheduled_at ?? null,
    })
    .select()
    .single();

  if (postError) return NextResponse.json({ error: postError.message }, { status: 500 });

  // Create post_targets for each selected social account
  if (target_account_ids.length > 0) {
    const targets = target_account_ids.map((account_id: string) => ({
      post_id: post.id,
      social_account_id: account_id,
      status: 'pending',
    }));

    const { error: targetError } = await supabase.from('post_targets').insert(targets);
    if (targetError) return NextResponse.json({ error: targetError.message }, { status: 500 });
  }

  if (status === 'scheduled') {
    await scheduleScheduledPostJobs(post.id);
  }

  return NextResponse.json(post, { status: 201 });
}
