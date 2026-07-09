const postsRepository = require("./posts.repository");
const scheduledPostsQueue = require("../scheduled-posts/scheduled-posts.queue");

/**
 * Returns all posts for a user, optionally filtered by status and platform.
 */
exports.listPosts = async (userId, { status, platform } = {}) => {
  return postsRepository.findAllByUser(userId, { status, platform });
};

/**
 * Returns a single post by id, scoped to the requesting user.
 * Returns null when the post does not exist or belongs to another user.
 */
exports.getPost = async (id, userId) => {
  return postsRepository.findByIdAndUser(id, userId);
};

/**
 * Creates a post, optionally creates post_targets for the selected social
 * accounts, and enqueues BullMQ delayed-publish jobs when status is "scheduled".
 */
exports.createPost = async (userId, {
  title,
  body_text,
  media_urls,
  thumbnail_url,
  hashtags,
  status = "draft",
  scheduled_at,
  content_type_id,
  target_account_ids = [],
}) => {
  const post = await postsRepository.create({
    userId,
    content_type_id,
    title,
    body_text,
    media_urls,
    thumbnail_url,
    hashtags,
    status,
    scheduled_at,
  });

  if (target_account_ids.length > 0) {
    await postsRepository.createTargets(post.id, target_account_ids);
  }

  if (status === "scheduled") {
    await scheduledPostsQueue.schedulePostTargets({ postId: post.id });
  }

  return post;
};

/**
 * Updates a post. When the resulting status is "scheduled" with a scheduled_at,
 * new delayed-publish jobs are (re)created. Otherwise any existing jobs are
 * cancelled — matching the frontend behavior exactly.
 */
exports.updatePost = async (id, userId, fields) => {
  const post = await postsRepository.updateByIdAndUser(id, userId, fields);

  if (!post) return null;

  if (post.status === "scheduled" && post.scheduled_at) {
    await scheduledPostsQueue.schedulePostTargets({ postId: post.id });
  } else {
    await scheduledPostsQueue.cancelPostTargets({ postId: post.id });
  }

  return post;
};

/**
 * Deletes a post after cancelling any pending scheduled-publish jobs.
 */
exports.deletePost = async (id, userId) => {
  await scheduledPostsQueue.cancelPostTargets({ postId: id });
  await postsRepository.deleteByIdAndUser(id, userId);
};
