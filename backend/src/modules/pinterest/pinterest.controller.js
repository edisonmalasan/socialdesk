const pinterestService = require("./pinterest.service");
const dbService = require("../social-connections/social-connections.service");

/**
 * Redirects the user to Pinterest OAuth login page
 * for authentication and permission approval.
 */
exports.redirectToPinterest = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
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
      return res.status(400).json({
        error: "Authorization code missing",
      });
    }
    if (!userId) {
      return res.status(400).json({
        error: "userId (state) missing",
      });
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
    res.json({
      success: true,
      message: "Pinterest account linked successfully",
      account,
    });
  } catch (err) {
    // Handle OAuth/token exchange errors
    res.status(500).json({
      error: err.response?.data || err.message,
    });
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
      return res.status(400).json({
        error: "accessToken and name are required",
      });
    }

    // Create Pinterest board
    const board = await pinterestService.createPinterestBoard({
      accessToken,
      name,
      description,
    });

    // Return successful response
    res.json({
      success: true,
      board,
    });
  } catch (err) {
    // Handle board creation errors
    res.status(500).json({
      error: err.response?.data || err.message,
    });
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
    if (!accessToken || !boardId) {
      return res.status(400).json({
        error: "accessToken and boardId are required",
      });
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
    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    // Handle pin creation errors
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
};
