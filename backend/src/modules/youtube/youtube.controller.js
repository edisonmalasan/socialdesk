const youtubeService = require("./youtube.service");
const dbService = require("../social-connections/social-connections.service");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

exports.redirectToYouTube = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return errorResponse(res, "userId is required", 400);
  }

  const url = youtubeService.getYouTubeAuthUrl(userId);
  res.redirect(url);
};

exports.handleYouTubeCallback = async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code) {
      return errorResponse(res, "Authorization code missing", 400);
    }
    if (!userId) {
      return errorResponse(res, "userId (state) missing", 400);
    }

    const tokens = await youtubeService.handleYouTubeOAuth(code);
    const profile = await youtubeService.getChannelProfile(tokens);
    const platformId = await dbService.getPlatformId("youtube");

    const account = await dbService.upsertSocialAccount({
      userId,
      platformId,
      externalId: profile.channelId,
      username: profile.customUrl || profile.channelId,
      displayName: profile.title,
      profileUrl: `https://www.youtube.com/channel/${profile.channelId}`,
      avatarUrl: profile.thumbnailUrl,
      metadata: profile,
    });

    await dbService.upsertOAuthToken({
      socialAccountId: account.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || null,
      tokenType: tokens.token_type || "Bearer",
      expiresAt: tokens.expiry_date
        ? new Date(tokens.expiry_date).toISOString()
        : null,
      scope: tokens.scope,
    });

    return successResponse(res, {
      message: "YouTube channel linked successfully",
      account,
    });
  } catch (err) {
    return errorResponse(res, err.response?.data || err.message, 500);
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    const file = req.file;
    const { accessToken, refreshToken, title, description, tags, privacyStatus } =
      req.body || {};

    // Validation for text fields is handled by validate(uploadVideoSchema)
    if (!file) {
      return errorResponse(res, "Video file is required", 400);
    }

    const tokens = {
      access_token: accessToken,
      refresh_token: refreshToken || null,
    };

    const parsedTags = tags ? tags.split(",").map((t) => t.trim()) : [];

    const video = await youtubeService.uploadVideo({
      tokens,
      file,
      title,
      description,
      tags: parsedTags,
      privacyStatus,
    });

    return successResponse(res, { video });
  } catch (err) {
    return errorResponse(res, err.response?.data || err.message, 500);
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { socialAccountId } = req.body;

    // socialAccountId validation is handled by validate(refreshTokenSchema)
    const updatedToken = await youtubeService.refreshOAuthToken(socialAccountId);

    return successResponse(res, {
      message: "Token refreshed successfully",
      token: updatedToken,
    });
  } catch (err) {
    return errorResponse(res, err.response?.data || err.message, 500);
  }
};
