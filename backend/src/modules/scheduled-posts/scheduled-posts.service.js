const scheduledPostsRepository = require("./scheduled-posts.repository");
const socialConnectionsService = require("../social-connections/social-connections.service");
const metaService = require("../meta/meta.service");
const pinterestService = require("../pinterest/pinterest.service");

const DEFAULT_BATCH_SIZE = 10;

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

const processTarget = async (target) => {
  const claimedTarget = await scheduledPostsRepository.claimPostTarget({
    postTargetId: target.id,
  });

  if (!claimedTarget) {
    return;
  }

  const post = getPost(target);
  if (!post) {
    await scheduledPostsRepository.markTargetFailed({
      postTargetId: target.id,
      errorMessage: "Scheduled post target is missing post data",
    });
    return;
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
  } catch (error) {
    await scheduledPostsRepository.markTargetFailed({
      postTargetId: target.id,
      errorMessage: getProviderErrorMessage(error),
    });
  } finally {
    const postId = target.post_id || post.id;
    if (postId) {
      await scheduledPostsRepository.updateParentPostStatus({ postId });
    }
  }
};

exports.executeDueScheduledPosts = async () => {
  const targets = await scheduledPostsRepository.getDueScheduledTargets({
    limit: getBatchSize(),
  });

  for (const target of targets) {
    try {
      await processTarget(target);
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
  publishTarget,
};
