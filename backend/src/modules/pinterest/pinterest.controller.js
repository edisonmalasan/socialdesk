const pinterestService = require("./pinterest.service");
const dbService = require("../social-connections/social-connections.service");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

/**
 * Redirects the user to Pinterest OAuth login page
 * for authentication and permission approval.
 */
exports.redirectToPinterest = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return errorResponse(res, "userId is required", 400);
  }

  // Generate Pinterest OAuth authorization URL
  const url = pinterestService.getPinterestAuthUrl(userId);

  // Redirect user to Pinterest login page
  res.redirect(url);
};

/**
 * Handles Pinterest OAuth callback.
 *
 * Flow:
 * 1. Receive authorization code from Pinterest
 * 2. Exchange code for access token
 * 3. Return token data to client
 */
exports.handlePinterestCallback = async (req, res) => {
  try {
    // Extract authorization code and userId from query params
    const { code, state: userId } = req.query;

    // Validate authorization code and userId
    if (!code) {
      return errorResponse(res, "Authorization code missing", 400);
    }
    if (!userId) {
      return errorResponse(res, "userId (state) missing", 400);
    }

    // Exchange code for Pinterest access token
    const tokenData = await pinterestService.handlePinterestOAuth(code);

    // Fetch the user's Pinterest profile
    const profile = await pinterestService.getUserProfile(
      tokenData.access_token,
    );

    // Get the internal platform ID for Pinterest
    const platformId = await dbService.getPlatformId("pinterest");

    // Persist the Pinterest account
    const account = await dbService.upsertSocialAccount({
      userId,
      platformId,
      externalId: profile.username || "unknown", // Pinterest typically returns username
      username: profile.username,
      displayName: profile.username, // Using username as display name
      profileUrl:
        profile.website_url || `https://www.pinterest.com/${profile.username}/`,
      avatarUrl: profile.profile_image,
      metadata: profile,
    });

    // Persist the OAuth token (permanent token, no expiry as per requirements)
    await dbService.upsertOAuthToken({
      socialAccountId: account.id,
      accessToken: tokenData.access_token,
      refreshToken: null, // Skipping refresh logic
      tokenType: tokenData.token_type || "Bearer",
      expiresAt: null, // Pinterest tokens don't expire
      scope: tokenData.scope,
    });

    // Return successful OAuth response
    return successResponse(res, {
      message: "Pinterest account linked successfully",
      account,
    });
  } catch (err) {
    // Handle OAuth/token exchange errors
    return errorResponse(res, err.response?.data || err.message, 500);
  }
};

/**
 * Creates a new Pinterest board.
 *
 * Required:
 * - accessToken
 * - name
 *
 * Optional:
 * - description
 */
exports.createPinterestBoard = async (req, res) => {
  try {
    // Extract request body data
    const { accessToken, name, description } = req.body;

    // Validate required fields
    if (!accessToken || !name) {
      return errorResponse(res, "accessToken and name are required", 400);
    }

    // Create Pinterest board
    const board = await pinterestService.createPinterestBoard({
      accessToken,
      name,
      description,
    });

    // Return successful response
    return successResponse(res, { board });
  } catch (err) {
    // Handle board creation errors
    return errorResponse(res, err.response?.data || err.message, 500);
  }
};

/**
 * Creates a Pinterest pin with optional image upload.
 *
 * Flow:
 * 1. Validate required credentials
 * 2. Upload image if provided
 * 3. Create pin on selected board
 */
exports.createPin = async (req, res) => {
  try {
    // Uploaded image/file from multer middleware
    const file = req.file;

    // Extract request body fields
    const { accessToken, boardId, title, description, link } = req.body || {};

    // Validate required fields
    // (Handled partially by schema, but kept here for fallback since board route isn't strictly validated yet)
    if (!accessToken || !boardId) {
      return errorResponse(res, "accessToken and boardId are required", 400);
    }

    // Create Pinterest pin
    const result = await pinterestService.createPinterestPin({
      accessToken,
      boardId,
      title,
      description,
      link,
      file,
    });

    // Return successful response
    return successResponse(res, result);
  } catch (err) {
    // Handle pin creation errors
    return errorResponse(res, err.response?.data || err.message, 500);
  }
};
