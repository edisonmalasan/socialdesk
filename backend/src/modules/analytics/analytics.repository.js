const supabase = require("../../infrastructure/database/supabaseClient");

/**
 * Returns all active social accounts for the user (just IDs).
 */
exports.findActiveUserAccounts = async (userId) => {
  const { data, error } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch user accounts: ${error.message}`);
  }

  return data.map((a) => a.id);
};

/**
 * Fetches analytics summary rows.
 */
exports.getAnalyticsSummary = async ({ accountIds, from, to, periodType }) => {
  let query = supabase
    .from("account_analytics")
    .select(
      "snapshot_date, period_type, followers_count, total_likes, total_views, total_shares, total_comments, engagement_rate",
    )
    .eq("period_type", periodType)
    .order("snapshot_date", { ascending: true })
    .in("social_account_id", accountIds);

  if (from) query = query.gte("snapshot_date", from);
  if (to) query = query.lte("snapshot_date", to);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch analytics summary: ${error.message}`);
  }

  return data;
};

/**
 * Fetches all post targets matching the criteria.
 */
exports.getAnalyticsPosts = async ({ userId, accountId, platform }) => {
  let query = supabase
    .from("post_targets")
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
        status,
        user_id
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
    .eq("social_account_id", accountId)
    .eq("posts.user_id", userId);

  if (platform && platform !== "all") {
    query = query.eq("social_accounts.platforms.code", platform);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch analytics posts: ${error.message}`);
  }

  return data;
};

/**
 * Fetches the latest account analytics snapshot for KPIs.
 */
exports.getLatestAccountSnapshot = async (accountId) => {
  const { data, error } = await supabase
    .from("account_analytics")
    .select("followers_count, total_likes, total_comments, total_shares")
    .eq("social_account_id", accountId)
    .eq("period_type", "monthly")
    .order("snapshot_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch latest account snapshot: ${error.message}`);
  }

  return data;
};

/**
 * Fetches top performing posts.
 */
exports.getTopPosts = async ({ userId, from, to, limit }) => {
  let query = supabase
    .from("posts")
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
    .eq("user_id", userId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (from) query = query.gte("published_at", from);
  if (to) query = query.lte("published_at", to);

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch top posts: ${error.message}`);
  }

  return data;
};

/**
 * Upserts a daily/weekly/monthly account analytics snapshot.
 */
exports.upsertAccountSnapshot = async ({ accountId, snapshotDate, periodType, metrics }) => {
  const { error } = await supabase
    .from("account_analytics")
    .upsert({
      social_account_id: accountId,
      snapshot_date: snapshotDate,
      period_type: periodType,
      followers_count: metrics.followers_count || 0,
      following_count: metrics.following_count || 0,
      total_posts: metrics.total_posts || 0,
      total_likes: metrics.total_likes || 0,
      total_comments: metrics.total_comments || 0,
      total_shares: metrics.total_shares || 0,
      total_views: metrics.total_views || 0,
      total_reach: metrics.total_reach || 0,
      impressions: metrics.impressions || 0,
      engagement_rate: metrics.engagement_rate || 0,
    }, {
      onConflict: 'social_account_id, snapshot_date, period_type'
    });

  if (error) {
    throw new Error(`Failed to upsert account snapshot: ${error.message}`);
  }
};

/**
 * Upserts engagement summary for a specific post target.
 */
exports.upsertPostEngagement = async ({ postTargetId, metrics }) => {
  const { error } = await supabase
    .from("post_engagement_summary")
    .upsert({
      post_target_id: postTargetId,
      likes: metrics.likes || 0,
      comments: metrics.comments || 0,
      shares: metrics.shares || 0,
      views: metrics.views || 0,
      saves: metrics.saves || 0,
      reach: metrics.reach || 0,
      engagement_score: metrics.engagement_score || 0,
      last_updated_at: new Date().toISOString(),
    }, {
      onConflict: 'post_target_id'
    });

  if (error) {
    throw new Error(`Failed to upsert post engagement: ${error.message}`);
  }
};
