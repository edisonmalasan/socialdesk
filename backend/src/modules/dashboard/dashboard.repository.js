const supabase = require("../../infrastructure/database/supabaseClient");

exports.getConnectedAccounts = async (userId) => {
  const { data, error } = await supabase
    .from("social_accounts")
    .select(`
      id, display_name, username, is_active,
      platforms ( code, name )
    `)
    .eq("user_id", userId)
    .eq("is_active", true);
  if (error) throw new Error(error.message);
  return data;
};

exports.getScheduledPosts = async (userId) => {
  const { data, error } = await supabase
    .from("posts")
    .select(`
      id, title, scheduled_at,
      post_targets (
        social_accounts (
          id, display_name, username,
          platforms ( code, name )
        )
      )
    `)
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(10);
  if (error) throw new Error(error.message);
  return data;
};

exports.getAccountAnalytics = async (accountIds) => {
  if (!accountIds || accountIds.length === 0) return [];
  // Get latest snapshot per account
  const { data, error } = await supabase
    .from("account_analytics")
    .select("*")
    .in("social_account_id", accountIds)
    .eq("period_type", "monthly")
    .order("snapshot_date", { ascending: false });
  
  if (error) throw new Error(error.message);
  
  // Deduplicate to only keep the latest per account
  const latest = {};
  for (const row of data) {
    if (!latest[row.social_account_id]) {
      latest[row.social_account_id] = row;
    }
  }
  return Object.values(latest);
};

exports.getRecentEngagement = async (accountIds) => {
  if (!accountIds || accountIds.length === 0) return [];
  const { data, error } = await supabase
    .from("post_engagement_summary")
    .select(`
      likes, comments, shares, views,
      post_targets!inner (
        social_account_id,
        posts ( title )
      )
    `)
    .in("post_targets.social_account_id", accountIds)
    .order("last_updated_at", { ascending: false })
    .limit(5);
  if (error) throw new Error(error.message);
  return data;
};
