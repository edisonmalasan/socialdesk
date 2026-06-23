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
