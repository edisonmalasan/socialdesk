const supabase = require("../../infrastructure/database/supabaseClient");

const TARGET_STATUS = {
  PENDING: "pending",
  PUBLISHING: "publishing",
  PUBLISHED: "published",
  FAILED: "failed",
};

/**
 * Retrieves due scheduled post targets that are still pending.
 */
exports.getDueScheduledTargets = async ({ limit }) => {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("post_targets")
    .select(`
      id,
      post_id,
      social_account_id,
      status,
      posts!inner (
        id,
        title,
        body_text,
        media_urls,
        link_url,
        metadata,
        scheduled_at,
        status,
        content_types (
          code
        )
      )
    `)
    .eq("status", TARGET_STATUS.PENDING)
    .eq("posts.status", "scheduled")
    .lte("posts.scheduled_at", now)
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to load due scheduled posts: ${error.message}`);
  }

  return data || [];
};

/**
 * Claims a target before publishing so a later loop does not process it again.
 */
exports.claimPostTarget = async ({ postTargetId }) => {
  const { data, error } = await supabase
    .from("post_targets")
    .update({ status: TARGET_STATUS.PUBLISHING })
    .eq("id", postTargetId)
    .eq("status", TARGET_STATUS.PENDING)
    .select()
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to claim post target ${postTargetId}: ${error.message}`);
  }

  return data;
};

/**
 * Marks a target as published after provider publishing succeeds.
 */
exports.markTargetPublished = async ({
  postTargetId,
  externalPostId,
  platformPostUrl,
}) => {
  const { data, error } = await supabase
    .from("post_targets")
    .update({
      status: TARGET_STATUS.PUBLISHED,
      external_post_id: externalPostId || null,
      platform_post_url: platformPostUrl || null,
      published_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", postTargetId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark post target ${postTargetId} as published: ${error.message}`);
  }

  return data;
};

/**
 * Marks a target as failed and stores the provider or validation error.
 */
exports.markTargetFailed = async ({ postTargetId, errorMessage }) => {
  const { data, error } = await supabase
    .from("post_targets")
    .update({
      status: TARGET_STATUS.FAILED,
      error_message: errorMessage || "Scheduled post publishing failed",
    })
    .eq("id", postTargetId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark post target ${postTargetId} as failed: ${error.message}`);
  }

  return data;
};

/**
 * Updates the parent post after a target reaches a terminal status.
 */
exports.updateParentPostStatus = async ({ postId }) => {
  const { data: targets, error } = await supabase
    .from("post_targets")
    .select("status")
    .eq("post_id", postId);

  if (error) {
    throw new Error(`Failed to load targets for post ${postId}: ${error.message}`);
  }

  if (!targets?.length) {
    return null;
  }

  const allPublished = targets.every((target) => target.status === TARGET_STATUS.PUBLISHED);
  const allTerminal = targets.every((target) =>
    [TARGET_STATUS.PUBLISHED, TARGET_STATUS.FAILED].includes(target.status),
  );
  const hasFailed = targets.some((target) => target.status === TARGET_STATUS.FAILED);

  if (allPublished) {
    const { data, error: updateError } = await supabase
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to mark post ${postId} as published: ${updateError.message}`);
    }

    return data;
  }

  if (allTerminal && hasFailed) {
    const { data, error: updateError } = await supabase
      .from("posts")
      .update({ status: "failed" })
      .eq("id", postId)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to mark post ${postId} as failed: ${updateError.message}`);
    }

    return data;
  }

  return null;
};

exports.TARGET_STATUS = TARGET_STATUS;
