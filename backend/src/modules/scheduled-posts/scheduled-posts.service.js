const scheduledPostsRepository = require("./scheduled-posts.repository");
const socialConnectionsService = require("../social-connections/social-connections.service");
const metaService = require("../meta/meta.service");
const pinterestService = require("../pinterest/pinterest.service");
const notificationsService = require("../notifications/notifications.service");

const DEFAULT_BATCH_SIZE = 10;
const TERMINAL_TARGET_STATUSES = [
  scheduledPostsRepository.TARGET_STATUS.PUBLISHED,
  scheduledPostsRepository.TARGET_STATUS.FAILED,
];

const getBatchSize = () => {
  const parsed = Number.parseInt(process.env.SCHEDULED_POSTS_BATCH_SIZE, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_BATCH_SIZE;
};

const getPost = (target) => {
  return Array.isArray(target.posts) ? target.posts[0] : target.posts;
};

const getContentTypeCode = (post) => {
  const contentType = Array.isArray(post?.content_types)
    ? post.content_types[0]
    : post?.content_types;

  return contentType?.code;
};

const getFirstMediaUrl = (post) => {
  return Array.isArray(post?.media_urls) ? post.media_urls[0] : null;
};

const getProviderErrorMessage = (error) => {
  return error.response?.data?.error?.message
    || error.response?.data?.message
    || error.response?.data
    || error.message
    || "Scheduled post publishing failed";
};

const publishFacebookTarget = async ({ post, connection }) => {
  return metaService.publishFacebookScheduledPost({
    pageId: connection.externalId,
    pageAccessToken: connection.accessToken,
    message: post.body_text,
    linkUrl: post.link_url,
    mediaUrl: getFirstMediaUrl(post),
  });
};

const publishInstagramTarget = async ({ post, connection }) => {
  const mediaUrl = getFirstMediaUrl(post);

  if (!mediaUrl) {
    throw new Error("Instagram scheduled posts require a media URL");
  }

  const contentTypeCode = getContentTypeCode(post);

  if (["reel", "video"].includes(contentTypeCode)) {
    return metaService.publishInstagramScheduledReel({
      igUserId: connection.externalId,
      pageAccessToken: connection.accessToken,
      caption: post.body_text,
      videoUrl: mediaUrl,
    });
  }

  return metaService.publishInstagramScheduledImage({
    igUserId: connection.externalId,
    pageAccessToken: connection.accessToken,
    caption: post.body_text,
    imageUrl: mediaUrl,
  });
};

const publishPinterestTarget = async ({ post, connection }) => {
  const mediaUrl = getFirstMediaUrl(post);
  const boardId = post.metadata?.pinterest?.board_id;

  if (!boardId) {
    throw new Error("Missing Pinterest board_id in post metadata");
  }

  if (!mediaUrl) {
    throw new Error("Pinterest scheduled posts require a media URL");
  }

  return pinterestService.publishScheduledPin({
    accessToken: connection.accessToken,
    boardId,
    title: post.title,
    description: post.body_text,
    link: post.link_url,
    imageUrl: mediaUrl,
  });
};

const publishTarget = async ({ post, connection }) => {
  switch (connection.platformCode) {
    case "facebook":
      return publishFacebookTarget({ post, connection });
    case "instagram":
      return publishInstagramTarget({ post, connection });
    case "pinterest":
      return publishPinterestTarget({ post, connection });
    default:
      throw new Error(`Unsupported scheduled post platform: ${connection.platformCode}`);
  }
};

const getPostTargetJobId = (target) => {
  return `scheduled-post-target:${target.id}`;
};

const getScheduledAt = (target) => {
  const post = getPost(target);
  return post?.scheduled_at;
};

const getScheduleDelay = (target) => {
  const scheduledAt = new Date(getScheduledAt(target)).getTime();
  const delay = scheduledAt - Date.now();

  return Number.isFinite(delay) && delay > 0 ? delay : 0;
};

const claimTargetForPublishing = async (target) => {
  if (target.status === scheduledPostsRepository.TARGET_STATUS.PUBLISHING) {
    return target;
  }

  if (target.status !== scheduledPostsRepository.TARGET_STATUS.PENDING) {
    return null;
  }

  return scheduledPostsRepository.claimPostTarget({
    postTargetId: target.id,
  });
};

const updateParentPostStatus = async (target, post) => {
  const postId = target.post_id || post?.id;
  if (postId) {
    await scheduledPostsRepository.updateParentPostStatus({ postId });
  }
};

const isTargetReadyToPublish = (target) => {
  const post = getPost(target);
  return post?.status === "scheduled" && Boolean(post.scheduled_at);
};

const processTarget = async ({ target, markFailedOnError = true }) => {
  const claimedTarget = await claimTargetForPublishing(target);

  if (!claimedTarget) {
    return { skipped: true };
  }

  const post = getPost(target);
  if (!post) {
    await scheduledPostsRepository.markTargetFailed({
      postTargetId: target.id,
      errorMessage: "Scheduled post target is missing post data",
    });
    await updateParentPostStatus(target, post);
    return { failed: true };
  }

  if (!isTargetReadyToPublish(target)) {
    return { skipped: true };
  }

  try {
    const connection = await socialConnectionsService.getPublishingConnection(
      target.social_account_id,
    );

    const result = await publishTarget({ post, target, connection });

    await scheduledPostsRepository.markTargetPublished({
      postTargetId: target.id,
      externalPostId: result.externalPostId,
      platformPostUrl: result.platformPostUrl,
    });

    // Emit publish-success notification (fire-and-forget; errors are swallowed inside)
    await notificationsService.emitPublishSuccess({
      userId: post.user_id,
      postTitle: post.title,
      platform: connection.platformCode,
    });

    return { published: true };
  } catch (error) {
    const errorMessage = getProviderErrorMessage(error);

    if (markFailedOnError) {
      await scheduledPostsRepository.markTargetFailed({
        postTargetId: target.id,
        errorMessage,
      });

      // Emit publish-failure notification (fire-and-forget; errors are swallowed inside)
      const connection = await socialConnectionsService
        .getPublishingConnection(target.social_account_id)
        .catch(() => null);
      await notificationsService.emitPublishFailure({
        userId: post.user_id,
        postTitle: post.title,
        platform: connection?.platformCode,
        reason: errorMessage,
      });
    }

    throw error;
  } finally {
    await updateParentPostStatus(target, post);
  }
};

exports.enqueueDueScheduledPosts = async ({ publishingQueue, jobName }) => {
  const targets = await scheduledPostsRepository.getDueScheduledTargets({
    limit: getBatchSize(),
  });

  for (const target of targets) {
    await publishingQueue.add(
      jobName,
      {
        postTargetId: target.id,
        postId: target.post_id,
      },
      {
        jobId: getPostTargetJobId(target),
      },
    );
  }

  return { enqueued: targets.length };
};

exports.schedulePostTargets = async ({ publishingQueue, jobName, postId }) => {
  const targets = await scheduledPostsRepository.getSchedulableTargetsByPostId({ postId });

  for (const target of targets) {
    const jobId = getPostTargetJobId(target);
    await publishingQueue.remove(jobId);
    await publishingQueue.add(
      jobName,
      {
        postTargetId: target.id,
        postId: target.post_id,
      },
      {
        delay: getScheduleDelay(target),
        jobId,
      },
    );
  }

  return { scheduled: targets.length };
};

exports.cancelPostTargets = async ({ publishingQueue, postId }) => {
  const targets = await scheduledPostsRepository.getPendingTargetsByPostId({ postId });
  let cancelled = 0;

  for (const target of targets) {
    cancelled += await publishingQueue.remove(getPostTargetJobId(target));
  }

  return { cancelled };
};

exports.processQueuedTarget = async ({ postTargetId, markFailedOnError = true }) => {
  const target = await scheduledPostsRepository.getScheduledTargetById({ postTargetId });

  if (!target) {
    return { skipped: true };
  }

  if (TERMINAL_TARGET_STATUSES.includes(target.status)) {
    return { skipped: true };
  }

  return processTarget({ target, markFailedOnError });
};

exports.executeDueScheduledPosts = async () => {
  const targets = await scheduledPostsRepository.getDueScheduledTargets({
    limit: getBatchSize(),
  });

  for (const target of targets) {
    try {
      await processTarget({ target });
    } catch (error) {
      console.error("Scheduled post target failed:", getProviderErrorMessage(error));
    }
  }

  return { processed: targets.length };
};

exports._private = {
  getBatchSize,
  getContentTypeCode,
  getFirstMediaUrl,
  getPostTargetJobId,
  getScheduleDelay,
  publishTarget,
};
