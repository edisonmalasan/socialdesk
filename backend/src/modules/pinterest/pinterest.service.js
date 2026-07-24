const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

/**
 * Base Pinterest API URL
 * Currently using Pinterest sandbox environment.
 */
const PINTEREST_BASE = "https://api-sandbox.pinterest.com/v5";

const cloudinary = require("../media/cloudinary.client");

/**
 * Uploads image to Cloudinary.
 *
 * Used before creating Pinterest pins
 * so Pinterest can access a public image URL.
 */
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    // Create Cloudinary upload stream
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "pinterest_posts",
        resource_type: "image",
      },
      (error, result) => {
        // Handle upload errors
        if (error) return reject(error);

        // Resolve uploaded image result
        resolve(result);
      },
    );

    // Upload file buffer
    stream.end(file.buffer);
  });
};

/**
 * Generates Pinterest OAuth authorization URL.
 *
 * Permissions requested:
 * - boards:read
 * - boards:write
 * - pins:read
 * - pins:write
 */
exports.getPinterestAuthUrl = (userId) => {
  // Pinterest app credentials
  const clientId = process.env.PINTEREST_APP_ID;
  const redirectUri = process.env.PINTEREST_REDIRECT_URI;

  // Requested Pinterest scopes
  const scopes = [
    "boards:read",
    "boards:write",
    "pins:read",
    "pins:write",
    "user_accounts:read", // Added to fetch user profile
  ].join(",");

  // Return OAuth authorization URL
  return `https://www.pinterest.com/oauth/?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&scope=${scopes}&state=${userId}`;
};

/**
 * Exchanges Pinterest authorization code
 * for an access token.
 *
 * Flow:
 * 1. Receive authorization code
 * 2. Send token exchange request
 * 3. Return OAuth token data
 */
exports.handlePinterestOAuth = async (code) => {
  // Pinterest app credentials
  const clientId = process.env.PINTEREST_APP_ID;
  const clientSecret = process.env.PINTEREST_APP_SECRET;
  const redirectUri = process.env.PINTEREST_REDIRECT_URI;

  // Build URL encoded request body
  const params = new URLSearchParams();

  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", redirectUri);

  // Encode client credentials for Basic Auth
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  // Exchange authorization code for access token
  const res = await axios.post(`${PINTEREST_BASE}/oauth/token`, params, {
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  // Return Pinterest token response
  return res.data;
};

/**
 * Fetches the authenticated user's Pinterest profile.
 */
exports.getUserProfile = async (accessToken) => {
  const res = await axios.get(`${PINTEREST_BASE}/user_account`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return res.data;
};

/**
 * Creates a Pinterest board.
 *
 * Required:
 * - accessToken
 * - name
 *
 * Optional:
 * - description
 */
exports.createPinterestBoard = async ({ accessToken, name, description }) => {
  // Validate required parameters
  if (!accessToken || !name) {
    throw new Error("accessToken and name are required");
  }

  // Pinterest board payload
  const payload = {
    name,

    // Optional board description
    description: description || "",
  };

  // Create Pinterest board
  const res = await axios.post(`${PINTEREST_BASE}/boards`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  // Return board data
  return res.data;
};

/**
 * Creates a Pinterest pin.
 *
 * Flow:
 * 1. Upload image to Cloudinary
 * 2. Create Pinterest pin using image URL
 */
exports.createPinterestPin = async ({
  accessToken,
  boardId,
  title,
  description,
  link,
  file,
}) => {
  // Validate uploaded image
  if (!file) throw new Error("Image file is required");

  // Upload image to Cloudinary
  const uploadResult = await uploadToCloudinary(file);

  // Public image URL from Cloudinary
  const imageUrl = uploadResult.secure_url;

  // Pinterest pin payload
  const payload = {
    board_id: boardId,

    // Optional pin title
    title: title || "",

    // Optional pin description
    description: description || "",

    // Optional destination link
    link: link || "",

    // Pinterest media source configuration
    media_source: {
      source_type: "image_url",
      url: imageUrl,
    },
  };

  // Create Pinterest pin
  const res = await axios.post(`${PINTEREST_BASE}/pins`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  // Return created pin and uploaded image URL
  return {
    pin: res.data,
    imageUrl,
  };
};

/**
 * Publishes a scheduled Pinterest pin from a public image URL.
 */
exports.publishScheduledPin = async ({
  accessToken,
  boardId,
  title,
  description,
  link,
  imageUrl,
}) => {
  if (!accessToken || !boardId) {
    throw new Error("accessToken and boardId are required");
  }

  if (!imageUrl) {
    throw new Error("imageUrl is required");
  }

  const payload = {
    board_id: boardId,
    title: title || "",
    description: description || "",
    link: link || "",
    media_source: {
      source_type: "image_url",
      url: imageUrl,
    },
  };

  const res = await axios.post(`${PINTEREST_BASE}/pins`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  return {
    externalPostId: res.data.id,
    platformPostUrl: res.data.link || res.data.url || null,
  };
};

/**
 * MOCK: Fetches Pinterest account analytics.
 */
exports.getAccountAnalytics = async (accessToken) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        followers_count: Math.floor(Math.random() * 20000) + 1000,
        following_count: Math.floor(Math.random() * 500) + 10,
        total_posts: Math.floor(Math.random() * 500) + 50,
        total_likes: Math.floor(Math.random() * 50000) + 5000, // Pinterest calls them saves/pins, mapped to likes for simplicity
        total_comments: Math.floor(Math.random() * 1000) + 100,
        total_shares: Math.floor(Math.random() * 10000) + 1000,
        total_views: Math.floor(Math.random() * 200000) + 20000,
        total_reach: Math.floor(Math.random() * 150000) + 15000,
        impressions: Math.floor(Math.random() * 500000) + 50000,
        engagement_rate: (Math.random() * 5 + 1).toFixed(2),
      });
    }, 100);
  });
};

/**
 * MOCK: Fetches Pinterest Pin analytics.
 */
exports.getPinAnalytics = async (pinId, accessToken) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const saves = Math.floor(Math.random() * 200) + 10;
      const comments = Math.floor(Math.random() * 20) + 1;
      const views = Math.floor(Math.random() * 5000) + 500;
      
      resolve({
        likes: saves,
        comments,
        shares: Math.floor(Math.random() * 50),
        views,
        saves,
        reach: views,
        engagement_score: saves * 3 + comments * 2,
      });
    }, 50);
  });
};

