const supabase = require("../../infrastructure/database/supabaseClient");

/**
 * Shared select shape used by list and get-by-id queries.
 * Mirrors the join structure the frontend previously used.
 */
const POST_SELECT = `
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
`;

/**
 * Returns all posts belonging to a user, newest first.
 * Optionally filters by status (DB-level) and platform (in-memory,
 * because platform lives on a nested FK through post_targets).
 */
exports.findAllByUser = async (userId, { status, platform } = {}) => {
  let query = supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }

  if (platform && platform !== "all") {
    return data.filter((post) =>
      post.post_targets?.some(
        (t) => t.social_accounts?.platforms?.code === platform,
      ),
    );
  }

  return data;
};

/**
 * Returns a single post by id, scoped to the owning user.
 */
exports.findByIdAndUser = async (id, userId) => {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_SELECT)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch post: ${error.message}`);
  }

  return data;
};

/**
 * Inserts a new post row and returns it.
 */
exports.create = async ({
  userId,
  content_type_id = 1,
  title,
  body_text,
  media_urls,
  thumbnail_url,
  hashtags,
  status = "draft",
  scheduled_at,
}) => {
  const { data, error } = await supabase
    .from("posts")
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

  if (error) {
    throw new Error(`Failed to create post: ${error.message}`);
  }

  return data;
};

/**
 * Updates only the provided fields on an existing post, scoped to user.
 */
exports.updateByIdAndUser = async (id, userId, fields) => {
  const allowedFields = [
    "title",
    "body_text",
    "media_urls",
    "thumbnail_url",
    "hashtags",
    "status",
    "scheduled_at",
    "content_type_id",
  ];

  const updatePayload = {};
  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      updatePayload[key] = fields[key];
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .update(updatePayload)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update post: ${error.message}`);
  }

  return data;
};

/**
 * Deletes a post, scoped to user. Cascading FK constraints handle
 * post_targets cleanup.
 */
exports.deleteByIdAndUser = async (id, userId) => {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

/**
 * Bulk-inserts post_targets linking a post to social accounts.
 */
exports.createTargets = async (postId, accountIds) => {
  if (!accountIds || accountIds.length === 0) return [];

  const targets = accountIds.map((accountId) => ({
    post_id: postId,
    social_account_id: accountId,
    status: "pending",
  }));

  const { data, error } = await supabase
    .from("post_targets")
    .insert(targets)
    .select();

  if (error) {
    throw new Error(`Failed to create post targets: ${error.message}`);
  }

  return data;
};
