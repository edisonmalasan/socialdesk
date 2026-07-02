import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const DEV_USER_ID = '070f1c3d-ddd5-48d8-8e1c-6af1cce33164';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const account_id = searchParams.get('account_id');
  const platform   = searchParams.get('platform');
  const from       = searchParams.get('from');
  const to         = searchParams.get('to');
  // tab: 'all' | 'completed' | 'missing'
  const tab        = (searchParams.get('tab') ?? 'all').toLowerCase();

  if (!account_id) {
    return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
  }

  // Map tab → post status
  const statusFilter: string[] = tab === 'completed'
    ? ['published']
    : tab === 'missing'
    ? ['failed', 'scheduled']
    : ['published', 'failed', 'scheduled', 'draft'];

  // Fetch posts via post_targets for this account
  let targetsQuery = supabase
    .from('post_targets')
    .select(`
      id,
      social_account_id,
      posts!inner (
        id,
        title,
        body_text,
        published_at,
        scheduled_at,
        created_at,
        status
      ),
      social_accounts (
        display_name,
        username,
        platforms ( code, name )
      ),
      post_engagement_summary (
        likes,
        comments,
        shares,
        views,
        engagement_score
      )
    `)
    .eq('social_account_id', account_id)
    .eq('posts.user_id', DEV_USER_ID);

  if (platform && platform !== 'all') {
    targetsQuery = targetsQuery.eq('social_accounts.platforms.code', platform);
  }

  const { data: targets, error: targetsError } = await targetsQuery;
  if (targetsError) return NextResponse.json({ error: targetsError.message }, { status: 500 });

  // Filter by status and date range in JS (simpler than chained PostgREST filters on nested tables)
  const filtered = (targets ?? []).filter((t: any) => {
    const post = t.posts;
    if (!statusFilter.includes(post.status)) return false;

    const postDate = new Date(post.published_at ?? post.scheduled_at ?? post.created_at);
    if (from && postDate < new Date(from)) return false;
    if (to   && postDate > new Date(to))   return false;
    return true;
  });

  const posts = filtered.map((t: any) => {
    const post = t.posts;
    const eng  = t.post_engagement_summary;
    const displayStatus = post.status === 'published' ? 'Completed' : 'Missing';
    const date = post.published_at ?? post.scheduled_at ?? post.created_at;

    return {
      id:         post.id,
      title:      post.title || post.body_text?.substring(0, 60) || 'Untitled',
      caption:    post.body_text ?? '',
      platform:   t.social_accounts?.platforms?.code ?? '',
      date:       date
        ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '—',
      views:      formatCount(eng?.views    ?? 0),
      reacts:     formatCount(eng?.likes    ?? 0),
      comments:   String(eng?.comments ?? 0),
      shares:     String(eng?.shares   ?? 0),
      engagement: eng?.engagement_score != null ? `${eng.engagement_score.toFixed(1)}%` : '0%',
      status:     displayStatus,
    };
  });

  // KPI: use latest account_analytics snapshot for follower/engagement totals
  const { data: latestSnapshot } = await supabase
    .from('account_analytics')
    .select('followers_count, total_likes, total_comments, total_shares')
    .eq('social_account_id', account_id)
    .eq('period_type', 'monthly')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const kpi = {
    total_posts:     posts.length,
    total_followers: latestSnapshot?.followers_count ?? 0,
    total_likes:     latestSnapshot?.total_likes     ?? 0,
    total_comments:  latestSnapshot?.total_comments  ?? 0,
    total_shares:    latestSnapshot?.total_shares    ?? 0,
  };

  return NextResponse.json({ posts, kpi });
}
