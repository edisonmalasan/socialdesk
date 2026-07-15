const supabase = require("../../infrastructure/database/supabaseClient");
const analyticsRepository = require("./analytics.repository");

const metaService = require("../meta/meta.service");
const youtubeService = require("../youtube/youtube.service");
const pinterestService = require("../pinterest/pinterest.service");

/**
 * Fetches all active social connections with their OAuth tokens.
 */
const getAllActiveConnections = async () => {
  const { data, error } = await supabase
    .from("social_accounts")
    .select(`
      id,
      external_id,
      platforms ( code ),
      oauth_tokens ( access_token, refresh_token )
    `)
    .eq("is_active", true);

  if (error) {
    throw new Error(`Failed to fetch active connections: ${error.message}`);
  }

  return data;
};

/**
 * Fetches recent post targets that have been published (have external_post_id).
 */
const getRecentPostTargets = async (socialAccountId) => {
  const { data, error } = await supabase
    .from("post_targets")
    .select("id, external_post_id")
    .eq("social_account_id", socialAccountId)
    .not("external_post_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(20); // Sync the 20 most recent posts

  if (error) {
    throw new Error(`Failed to fetch recent posts: ${error.message}`);
  }

  return data;
};

/**
 * Extracts the single access token object from Supabase's result.
 */
const extractAccessToken = (oauthTokens) => {
  const tokenRecord = Array.isArray(oauthTokens) ? oauthTokens[0] : oauthTokens;
  return tokenRecord?.access_token;
};

/**
 * Main ingestion flow:
 * Iterates through all active social accounts, fetches analytics from the
 * respective provider APIs (simulated), and upserts them to the database.
 */
exports.syncAllAccounts = async () => {
  console.log("[Analytics Ingestion] Starting full sync cycle...");
  const accounts = await getAllActiveConnections();
  const snapshotDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const periodType = "daily";

  let successCount = 0;
  let errorCount = 0;

  for (const account of accounts) {
    const platformCode = account.platforms?.code;
    const accessToken = extractAccessToken(account.oauth_tokens);

    if (!platformCode || !accessToken) {
      console.warn(`[Analytics Ingestion] Skipping account ${account.id} due to missing platform or token`);
      errorCount++;
      continue;
    }

    try {
      let accountMetrics = null;

      // 1. Fetch Account-level Analytics
      if (platformCode === "facebook" || platformCode === "instagram") {
        accountMetrics = await metaService.getAccountAnalytics(account.external_id, accessToken);
      } else if (platformCode === "youtube") {
        accountMetrics = await youtubeService.getChannelAnalytics(account.external_id, accessToken);
      } else if (platformCode === "pinterest") {
        accountMetrics = await pinterestService.getAccountAnalytics(accessToken);
      }

      if (accountMetrics) {
        await analyticsRepository.upsertAccountSnapshot({
          accountId: account.id,
          snapshotDate,
          periodType,
          metrics: accountMetrics,
        });
      }

      // 2. Fetch Post-level Analytics
      const postTargets = await getRecentPostTargets(account.id);
      for (const target of postTargets) {
        let postMetrics = null;

        if (platformCode === "facebook" || platformCode === "instagram") {
          postMetrics = await metaService.getPostAnalytics(target.external_post_id, accessToken);
        } else if (platformCode === "youtube") {
          postMetrics = await youtubeService.getVideoAnalytics(target.external_post_id, accessToken);
        } else if (platformCode === "pinterest") {
          postMetrics = await pinterestService.getPinAnalytics(target.external_post_id, accessToken);
        }

        if (postMetrics) {
          await analyticsRepository.upsertPostEngagement({
            postTargetId: target.id,
            metrics: postMetrics,
          });
        }
      }

      console.log(`[Analytics Ingestion] Synced account ${account.id} (${platformCode})`);
      successCount++;
    } catch (err) {
      console.error(`[Analytics Ingestion] Failed syncing account ${account.id} (${platformCode}):`, err.message);
      errorCount++;
    }
  }

  console.log(`[Analytics Ingestion] Completed sync. Success: ${successCount}, Errors: ${errorCount}`);
};
