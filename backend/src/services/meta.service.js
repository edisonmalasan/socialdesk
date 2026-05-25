const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

/**
 * Base Facebook Graph API URL
 */
const FB_BASE = "https://graph.facebook.com/v25.0";

const cloudinary = require("../config/cloudinary");

/**
 * Generates Facebook OAuth URL
 * for Facebook page authentication.
 */
exports.getAuthUrl = () => {
  return `https://www.facebook.com/v25.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${process.env.FB_REDIRECT_URI}&scope=pages_show_list,pages_manage_posts,pages_read_engagement,business_management,instagram_basic,instagram_content_publish`;
};

/**
 * Generates Instagram OAuth URL
 * for Instagram Business account authentication.
 */
exports.getInstagramAuthUrl = () => {
  return `https://www.facebook.com/v25.0/dialog/oauth?client_id=${
    process.env.FB_APP_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.INSTAGRAM_REDIRECT_URI
  )}&response_type=code&scope=pages_show_list,instagram_basic,instagram_content_publish`;
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

  // User access token from Facebook
  const userAccessToken = tokenRes.data.access_token;

  // Fetch Facebook pages linked to the user
  const pagesRes = await axios.get(`${FB_BASE}/me/accounts`, {
    params: {
      access_token: userAccessToken,
    },
  });

  // Return token and page data
  return {
    user_access_token: userAccessToken,
    pages: pagesRes.data.data,
  };
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