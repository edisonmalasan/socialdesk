const analyticsRepository = require("./analytics.repository");

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatCount(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return String(n);
}

exports.getSummary = async (userId, { account_id, from, to, period_type }) => {
  let accountIds = [];

  if (account_id) {
    accountIds = [account_id];
  } else {
    accountIds = await analyticsRepository.findActiveUserAccounts(userId);
  }

  if (accountIds.length === 0) {
    return {
      overview: { engagement_rate: 0, total_likes: 0, total_comments: 0 },
      page_stats: [],
      engagement_trend: [],
    };
  }

  const rows = await analyticsRepository.getAnalyticsSummary({
    accountIds,
    from,
    to,
    periodType: period_type || "monthly",
  });

  const byDate = new Map();

  for (const row of rows) {
    const key = row.snapshot_date;
    const existing = byDate.get(key) ?? {
      followers: 0,
      likes: 0,
      views: 0,
      shares: 0,
      comments: 0,
      engagement_rate: 0,
      count: 0,
    };
    byDate.set(key, {
      followers: existing.followers + (row.followers_count ?? 0),
      likes: existing.likes + (row.total_likes ?? 0),
      views: existing.views + (row.total_views ?? 0),
      shares: existing.shares + (row.total_shares ?? 0),
      comments: existing.comments + (row.total_comments ?? 0),
      engagement_rate: existing.engagement_rate + (row.engagement_rate ?? 0),
      count: existing.count + 1,
    });
  }

  const page_stats = Array.from(byDate.entries()).map(([date, v]) => ({
    period: MONTH_SHORT[new Date(date).getUTCMonth()],
    followers: v.followers,
    likes: v.likes,
    views: v.views,
    shares: v.shares,
    comments: v.comments,
  }));

  const engagement_trend = Array.from(byDate.entries()).map(([date, v]) => ({
    period: MONTH_SHORT[new Date(date).getUTCMonth()],
    rate: v.count > 0 ? Number.parseFloat((v.engagement_rate / v.count).toFixed(2)) : 0,
  }));

  const totalLikes = rows.reduce((sum, r) => sum + (r.total_likes ?? 0), 0);
  const totalComments = rows.reduce((sum, r) => sum + (r.total_comments ?? 0), 0);
  const avgEngagement =
    rows.length > 0 ? rows.reduce((sum, r) => sum + (r.engagement_rate ?? 0), 0) / rows.length : 0;

  return {
    overview: {
      engagement_rate: Number.parseFloat(avgEngagement.toFixed(2)),
      total_likes: totalLikes,
      total_comments: totalComments,
    },
    page_stats,
    engagement_trend,
  };
};

exports.getPosts = async (userId, { account_id, platform, from, to, tab }) => {
  const currentTab = (tab || "all").toLowerCase();

  const statusFilter =
    currentTab === "completed"
      ? ["published"]
      : currentTab === "missing"
        ? ["failed", "scheduled"]
        : ["published", "failed", "scheduled", "draft"];

  const targets = await analyticsRepository.getAnalyticsPosts({
    userId,
    accountId: account_id,
    platform,
  });

  const filtered = (targets || []).filter((t) => {
    const post = t.posts;
    if (!statusFilter.includes(post.status)) return false;

    const postDate = new Date(post.published_at ?? post.scheduled_at ?? post.created_at);
    if (from && postDate < new Date(from)) return false;
    if (to && postDate > new Date(to)) return false;
    return true;
  });

  const posts = filtered.map((t) => {
    const post = t.posts;
    const eng = t.post_engagement_summary;
    const displayStatus = post.status === "published" ? "Completed" : "Missing";
    const date = post.published_at ?? post.scheduled_at ?? post.created_at;

    return {
      id: post.id,
      title: post.title || post.body_text?.substring(0, 60) || "Untitled",
      caption: post.body_text ?? "",
      platform: t.social_accounts?.platforms?.code ?? "",
      date: date
        ? new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
        : "—",
      views: formatCount(eng?.views ?? 0),
      reacts: formatCount(eng?.likes ?? 0),
      comments: String(eng?.comments ?? 0),
      shares: String(eng?.shares ?? 0),
      engagement: eng?.engagement_score != null ? `${eng.engagement_score.toFixed(1)}%` : "0%",
      status: displayStatus,
    };
  });

  const latestSnapshot = await analyticsRepository.getLatestAccountSnapshot(account_id);

  const kpi = {
    total_posts: posts.length,
    total_followers: latestSnapshot?.followers_count ?? 0,
    total_likes: latestSnapshot?.total_likes ?? 0,
    total_comments: latestSnapshot?.total_comments ?? 0,
    total_shares: latestSnapshot?.total_shares ?? 0,
  };

  return { posts, kpi };
};

exports.getTopPosts = async (userId, { account_id, from, to, limit }) => {
  const limitValue = Math.min(Number.parseInt(limit ?? "5", 10), 50);

  const posts = await analyticsRepository.getTopPosts({
    userId,
    from,
    to,
    limit: limitValue,
  });

  const result = (posts || [])
    .filter((post) => {
      if (!account_id) return true;
      return post.post_targets?.some((t) => t.social_account_id === account_id);
    })
    .map((post) => {
      const target = post.post_targets?.[0];
      const eng = target?.post_engagement_summary;

      return {
        id: post.id,
        title: post.title || post.body_text?.substring(0, 60) || "Untitled",
        caption: post.body_text ?? "",
        platform: target?.social_accounts?.platforms?.code ?? "",
        page: target?.social_accounts?.display_name ?? target?.social_accounts?.username ?? "—",
        date: post.published_at
          ? new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : "—",
        views: formatCount(eng?.views ?? 0),
        reacts: formatCount(eng?.likes ?? 0),
        comments: String(eng?.comments ?? 0),
        shares: String(eng?.shares ?? 0),
        engagement: eng?.engagement_score != null ? `${eng.engagement_score.toFixed(1)}%` : "0%",
        status: "Completed",
      };
    });

  return result;
};
