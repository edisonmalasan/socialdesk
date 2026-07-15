const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

/**
 * Base Facebook Graph API URL
 */
const FB_BASE = "https://graph.facebook.com/v25.0";

const cloudinary = require("../media/cloudinary.client");
const dbService = require("../social-connections/social-connections.service");

/**
 * Generates Facebook OAuth URL
 * for Facebook page authentication.
 */
exports.getAuthUrl = (userId) => {
  return `https://www.facebook.com/v25.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${process.env.FB_REDIRECT_URI}&state=${userId}&scope=pages_show_list,pages_manage_posts,pages_read_engagement,business_management,instagram_basic,instagram_content_publish`;
};

/**
 * Generates Instagram OAuth URL
 * for Instagram Business account authentication.
 */
exports.getInstagramAuthUrl = (userId) => {
  return `https://www.facebook.com/v25.0/dialog/oauth?client_id=${
    process.env.FB_APP_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.INSTAGRAM_REDIRECT_URI
  )}&state=${userId}&response_type=code&scope=pages_show_list,instagram_basic,instagram_content_publish`;
};

/**
 * Handles OAuth token exchange process.
 *
 * Flow:
 * 1. Exchange authorization code for user access token
 * 2. Fetch connected Facebook pages
 * 3. Return token and pages list
 */
exports.handleOAuth = async (code, redirectUri) => {

  // Exchange authorization code for access token
  const tokenRes = await axios.get(`${FB_BASE}/oauth/access_token`, {
    params: {
      client_id: process.env.FB_APP_ID,
      client_secret: process.env.FB_APP_SECRET,
      redirect_uri: redirectUri,
      code,
    },
  });

  const userAccessToken = tokenRes.data.access_token;

  const pagesRes = await axios.get(`${FB_BASE}/me/accounts`, {
    params: {
      access_token: userAccessToken,
    },
  });

  // return token and page data
  return {
    user_access_token: userAccessToken,
    pages: pagesRes.data.data,
  };
};

/**
 * exchanges a short-lived user token for a long-lived one (60 days).
 */
exports.getLongLivedToken = async (shortLivedToken) => {
  const res = await axios.get(`${FB_BASE}/oauth/access_token`, {
    params: {
      grant_type: "fb_exchange_token",
      client_id: process.env.FB_APP_ID,
      client_secret: process.env.FB_APP_SECRET,
      fb_exchange_token: shortLivedToken,
    },
  });

  return res.data.access_token;
};

/**
 * Refreshes an OAuth token for a given social account.
 */
exports.refreshOAuthToken = async (socialAccountId) => {
  // 1. Get the account and current token from DB
  const account = await dbService.getSocialAccountWithToken(socialAccountId);
  const currentToken = account.oauth_tokens?.access_token;

  if (!currentToken) {
    throw new Error("No token found to refresh");
  }

  // 2. Exchange current token for a new long-lived token
  const newAccessToken = await exports.getLongLivedToken(currentToken);

  // 3. Update the token in the database
  const updatedToken = await dbService.upsertOAuthToken({
    socialAccountId,
    accessToken: newAccessToken,
  });

  return updatedToken;
};

/**
 * Creates a Facebook page text post.
 *
 * Supports optional scheduling.
 */
exports.postToPage = async ({
  pageId,
  pageAccessToken,
  message,
  scheduledTime
}) => {

  // Facebook page feed endpoint
  const url = `${FB_BASE}/${pageId}/feed`;

  // Request payload
  const data = {
    message,

    // Publish immediately if no schedule is provided
    published: scheduledTime ? false : true,

    // Scheduled publish timestamp
    scheduled_publish_time: scheduledTime || undefined,
  };

  // Send post request to Facebook API
  const res = await axios.post(url, data, {
    params: {
      access_token: pageAccessToken,
    },
  });

  // Return Facebook response
  return res.data;
};

/**
 * Publishes a stored scheduled post to a Facebook page.
 *
 * Used by the scheduled-posts cron worker.
 */
exports.publishFacebookScheduledPost = async ({
  pageId,
  pageAccessToken,
  message,
  linkUrl,
  mediaUrl,
}) => {
  if (!pageId || !pageAccessToken) {
    throw new Error("pageId and pageAccessToken are required");
  }

  const data = {
    message: message || "",
    published: true,
  };

  const link = mediaUrl || linkUrl;
  if (link) data.link = link;

  const res = await axios.post(`${FB_BASE}/${pageId}/feed`, data, {
    params: {
      access_token: pageAccessToken,
    },
  });

  return {
    externalPostId: res.data.id,
    platformPostUrl: res.data.id ? `https://facebook.com/${res.data.id}` : null,
  };
};

/**
 * Uploads a photo directly to Facebook page.
 *
 * Uses multipart/form-data upload.
 */
async function postPhotoToPage({
  pageId,
  pageAccessToken,
  caption,
  filePath
}) {

  // Facebook photos endpoint
  const url = `${FB_BASE}/${pageId}/photos`;

  // Prepare form data
  const form = new FormData();

  // Attach image file
  form.append("source", fs.createReadStream(filePath));

  // Optional caption
  if (caption) form.append("caption", caption);

  // Upload photo to Facebook
  const response = await axios.post(url, form, {
    headers: {
      ...form.getHeaders(),
    },
    params: {
      access_token: pageAccessToken,
    },
  });

  return response.data;
}

/**
 * Uploads image or video to Cloudinary.
 *
 * Automatically detects media type.
 */
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {

    // Detect whether uploaded file is video
    const isVideo = file.mimetype.startsWith("video/");

    // Create Cloudinary upload stream
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "social_posts",

        // Set Cloudinary resource type
        resource_type: isVideo ? "video" : "image",
      },
      (error, result) => {
        if (error) return reject(error);

        resolve(result);
      }
    );

    // Upload file buffer
    stream.end(file.buffer);
  });
};

/**
 * Utility function for delaying execution.
 */
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Creates and publishes an Instagram image post.
 *
 * Flow:
 * 1. Upload image to Cloudinary
 * 2. Create Instagram media container
 * 3. Publish media to Instagram
 */
exports.createInstagramPost = async ({
  igUserId,
  pageAccessToken,
  caption,
  file,
}) => {

  // Validate uploaded image
  if (!file) throw new Error("Image file is required");

  // Upload image to Cloudinary
  const uploadResult = await uploadToCloudinary(file);

  const imageUrl = uploadResult.secure_url;

  // Create Instagram media container
  const createRes = await axios.post(
    `${FB_BASE}/${igUserId}/media`,
    null,
    {
      params: {
        image_url: imageUrl,
        caption: caption || "",
        access_token: pageAccessToken,
      },
    }
  );

  // Media container ID
  const creationId = createRes.data.id;

  // Wait before publishing
  await sleep(3000);

  // Publish Instagram post
  const publishRes = await axios.post(
    `${FB_BASE}/${igUserId}/media_publish`,
    null,
    {
      params: {
        creation_id: creationId,
        access_token: pageAccessToken,
      },
    }
  );

  // Return published media info
  return {
    mediaId: publishRes.data.id,
    imageUrl,
  };
};

/**
 * Publishes a scheduled Instagram image post from a public image URL.
 */
exports.publishInstagramScheduledImage = async ({
  igUserId,
  pageAccessToken,
  caption,
  imageUrl,
}) => {
  if (!igUserId || !pageAccessToken) {
    throw new Error("igUserId and pageAccessToken are required");
  }

  if (!imageUrl) {
    throw new Error("imageUrl is required");
  }

  const createRes = await axios.post(
    `${FB_BASE}/${igUserId}/media`,
    null,
    {
      params: {
        image_url: imageUrl,
        caption: caption || "",
        access_token: pageAccessToken,
      },
    }
  );

  const creationId = createRes.data.id;

  await sleep(3000);

  const publishRes = await axios.post(
    `${FB_BASE}/${igUserId}/media_publish`,
    null,
    {
      params: {
        creation_id: creationId,
        access_token: pageAccessToken,
      },
    }
  );

  return {
    externalPostId: publishRes.data.id,
    platformPostUrl: publishRes.data.id
      ? `https://www.instagram.com/p/${publishRes.data.id}`
      : null,
  };
};

/**
 * Creates and publishes an Instagram Reel.
 *
 * Flow:
 * 1. Upload video to Cloudinary
 * 2. Create Reel media container
 * 3. Poll processing status
 * 4. Publish Reel after processing completes
 */
exports.createInstagramReelPost = async ({
  igUserId,
  pageAccessToken,
  caption,
  file,
}) => {

  // Upload video to Cloudinary
  const uploadResult = await uploadToCloudinary(file);

  const videoUrl = uploadResult.secure_url;

  // Create Instagram Reel media container
  const createRes = await axios.post(
    `${FB_BASE}/${igUserId}/media`,
    null,
    {
      params: {
        video_url: videoUrl,
        caption: caption || "",
        media_type: "REELS",
        access_token: pageAccessToken,
      },
    }
  );

  // Media creation container ID
  const creationId = createRes.data.id;

  // Default processing status
  let status = "IN_PROGRESS";

  // Poll Reel processing status
  for (let i = 0; i < 10; i++) {

    const statusRes = await axios.get(
      `${FB_BASE}/${creationId}`,
      {
        params: {
          fields: "status_code",
          access_token: pageAccessToken,
        },
      }
    );

    // Current Reel processing status
    status = statusRes.data.status_code;

    // Stop polling once Reel is processed
    if (status === "FINISHED") break;

    // Wait before next poll request
    await sleep(3000);
  }

  // Throw error if Reel processing failed/timed out
  if (status !== "FINISHED") {
    throw new Error("Reel not ready for publishing after waiting");
  }

  // Publish Instagram Reel
  const publishRes = await axios.post(
    `${FB_BASE}/${igUserId}/media_publish`,
    null,
    {
      params: {
        creation_id: creationId,
        access_token: pageAccessToken,
      },
    }
  );

  // Return published Reel info
  return {
    mediaId: publishRes.data.id,
    videoUrl,
  };
};

/**
 * Publishes a scheduled Instagram Reel from a public video URL.
 */
exports.publishInstagramScheduledReel = async ({
  igUserId,
  pageAccessToken,
  caption,
  videoUrl,
}) => {
  if (!igUserId || !pageAccessToken) {
    throw new Error("igUserId and pageAccessToken are required");
  }

  if (!videoUrl) {
    throw new Error("videoUrl is required");
  }

  const createRes = await axios.post(
    `${FB_BASE}/${igUserId}/media`,
    null,
    {
      params: {
        video_url: videoUrl,
        caption: caption || "",
        media_type: "REELS",
        access_token: pageAccessToken,
      },
    }
  );

  const creationId = createRes.data.id;
  let status = "IN_PROGRESS";

  for (let i = 0; i < 10; i++) {
    const statusRes = await axios.get(
      `${FB_BASE}/${creationId}`,
      {
        params: {
          fields: "status_code",
          access_token: pageAccessToken,
        },
      }
    );

    status = statusRes.data.status_code;
    if (status === "FINISHED") break;
    await sleep(3000);
  }

  if (status !== "FINISHED") {
    throw new Error("Reel not ready for publishing after waiting");
  }

  const publishRes = await axios.post(
    `${FB_BASE}/${igUserId}/media_publish`,
    null,
    {
      params: {
        creation_id: creationId,
        access_token: pageAccessToken,
      },
    }
  );

  return {
    externalPostId: publishRes.data.id,
    platformPostUrl: publishRes.data.id
      ? `https://www.instagram.com/reel/${publishRes.data.id}`
      : null,
  };
};

/**
 * MOCK: Fetches account analytics from Meta (Facebook/Instagram).
 * In a real scenario, this would query the Graph API for Insights.
 */
exports.getAccountAnalytics = async (externalId, accessToken) => {
  // Simulate API delay
  await sleep(100);

  return {
    followers_count: Math.floor(Math.random() * 10000) + 1000,
    following_count: Math.floor(Math.random() * 500) + 50,
    total_posts: Math.floor(Math.random() * 200) + 20,
    total_likes: Math.floor(Math.random() * 50000) + 5000,
    total_comments: Math.floor(Math.random() * 10000) + 1000,
    total_shares: Math.floor(Math.random() * 5000) + 500,
    total_views: Math.floor(Math.random() * 100000) + 10000,
    total_reach: Math.floor(Math.random() * 80000) + 8000,
    impressions: Math.floor(Math.random() * 150000) + 15000,
    engagement_rate: (Math.random() * 5 + 1).toFixed(2),
  };
};

/**
 * MOCK: Fetches post-level analytics from Meta.
 */
exports.getPostAnalytics = async (externalPostId, accessToken) => {
  await sleep(50);

  const likes = Math.floor(Math.random() * 500) + 10;
  const comments = Math.floor(Math.random() * 100) + 2;
  const shares = Math.floor(Math.random() * 50) + 1;
  const views = Math.floor(Math.random() * 2000) + 100;
  
  return {
    likes,
    comments,
    shares,
    views,
    saves: Math.floor(Math.random() * 20),
    reach: views,
    engagement_score: likes + comments * 2 + shares * 3,
  };
};

