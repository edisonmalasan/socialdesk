import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

export async function GET(request: Request) {
  const userId = await getUserIdFromToken();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const account_id = searchParams.get('account_id');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '5', 10), 50);

  let query = supabase
    .from('posts')
    .select(`
      id,
      title,
      body_text,
      published_at,
      status,
      post_targets (
        id,
        social_account_id,
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
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit);

  if (from) query = query.gte('published_at', from);
  if (to)   query = query.lte('published_at', to);

  const { data: posts, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (posts ?? [])
    .filter((post: any) => {
      if (!account_id) return true;
      return post.post_targets?.some((t: any) => t.social_account_id === account_id);
    })
    .map((post: any) => {
      const target = post.post_targets?.[0];
      const eng = target?.post_engagement_summary;

      return {
        id:         post.id,
        title:      post.title || post.body_text?.substring(0, 60) || 'Untitled',
        caption:    post.body_text ?? '',
        platform:   target?.social_accounts?.platforms?.code ?? '',
        page:       target?.social_accounts?.display_name ?? target?.social_accounts?.username ?? '—',
        date:       post.published_at
          ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : '—',
        views:      formatCount(eng?.views    ?? 0),
        reacts:     formatCount(eng?.likes    ?? 0),
        comments:   String(eng?.comments ?? 0),
        shares:     String(eng?.shares   ?? 0),
        engagement: eng?.engagement_score != null ? `${eng.engagement_score.toFixed(1)}%` : '0%',
        status:     'Completed',
      };
    });

  return NextResponse.json(result);
}
