import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const DEV_USER_ID = '070f1c3d-ddd5-48d8-8e1c-6af1cce33164';

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const account_id = searchParams.get('account_id');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const period_type = searchParams.get('period_type') || 'monthly';

  // Get all active social accounts for this user
  const { data: accounts, error: accountsError } = await supabase
    .from('social_accounts')
    .select('id')
    .eq('user_id', DEV_USER_ID)
    .eq('is_active', true);

  if (accountsError) return NextResponse.json({ error: accountsError.message }, { status: 500 });

  const accountIds = (accounts ?? []).map((a: any) => a.id);
  if (accountIds.length === 0) {
    return NextResponse.json({ overview: { engagement_rate: 0, total_likes: 0, total_comments: 0 }, page_stats: [], engagement_trend: [] });
  }

  let query = supabase
    .from('account_analytics')
    .select('snapshot_date, period_type, followers_count, total_likes, total_views, total_shares, total_comments, engagement_rate')
    .eq('period_type', period_type)
    .order('snapshot_date', { ascending: true });

  if (account_id) {
    query = query.eq('social_account_id', account_id);
  } else {
    query = query.in('social_account_id', accountIds);
  }

  if (from) query = query.gte('snapshot_date', from);
  if (to)   query = query.lte('snapshot_date', to);

  const { data: analytics, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = analytics ?? [];

  // Aggregate rows by snapshot_date (multiple accounts → sum per date)
  const byDate = new Map<string, {
    followers: number; likes: number; views: number;
    shares: number; comments: number; engagement_rate: number; count: number;
  }>();

  for (const row of rows) {
    const key = row.snapshot_date;
    const existing = byDate.get(key) ?? { followers: 0, likes: 0, views: 0, shares: 0, comments: 0, engagement_rate: 0, count: 0 };
    byDate.set(key, {
      followers:       existing.followers + (row.followers_count ?? 0),
      likes:           existing.likes     + (row.total_likes    ?? 0),
      views:           existing.views     + (row.total_views    ?? 0),
      shares:          existing.shares    + (row.total_shares   ?? 0),
      comments:        existing.comments  + (row.total_comments ?? 0),
      engagement_rate: existing.engagement_rate + (row.engagement_rate ?? 0),
      count:           existing.count + 1,
    });
  }

  const page_stats = Array.from(byDate.entries()).map(([date, v]) => ({
    period: MONTH_SHORT[new Date(date).getUTCMonth()],
    followers: v.followers,
    likes:     v.likes,
    views:     v.views,
    shares:    v.shares,
    comments:  v.comments,
  }));

  const engagement_trend = Array.from(byDate.entries()).map(([date, v]) => ({
    period: MONTH_SHORT[new Date(date).getUTCMonth()],
    rate: v.count > 0 ? parseFloat((v.engagement_rate / v.count).toFixed(2)) : 0,
  }));

  const totalLikes    = rows.reduce((sum, r) => sum + (r.total_likes    ?? 0), 0);
  const totalComments = rows.reduce((sum, r) => sum + (r.total_comments ?? 0), 0);
  const avgEngagement = rows.length > 0
    ? rows.reduce((sum, r) => sum + (r.engagement_rate ?? 0), 0) / rows.length
    : 0;

  return NextResponse.json({
    overview: {
      engagement_rate: parseFloat(avgEngagement.toFixed(2)),
      total_likes:    totalLikes,
      total_comments: totalComments,
    },
    page_stats,
    engagement_trend,
  });
}
