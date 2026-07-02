const youtubeService = require("./youtube.service");
const dbService = require("../social-connections/social-connections.service");

exports.redirectToYouTube = (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: "userId is required" });
  }

  const url = youtubeService.getYouTubeAuthUrl(userId);
  res.redirect(url);
};

exports.handleYouTubeCallback = async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code) {
      return res.status(400).json({ error: "Authorization code missing" });
    }
    if (!userId) {
      return res.status(400).json({ error: "userId (state) missing" });
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

    res.json({
      success: true,
      message: "YouTube channel linked successfully",
      account,
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

exports.uploadVideo = async (req, res) => {
  try {
    const file = req.file;
    const { accessToken, refreshToken, title, description, tags, privacyStatus } =
      req.body || {};

    if (!accessToken || !title) {
      return res.status(400).json({ error: "accessToken and title are required" });
    }
    if (!file) {
      return res.status(400).json({ error: "Video file is required" });
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

    res.json({ success: true, video });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { socialAccountId } = req.body;

    if (!socialAccountId) {
      return res.status(400).json({ error: "socialAccountId is required" });
    }

    const updatedToken = await youtubeService.refreshOAuthToken(socialAccountId);

    res.json({
      success: true,
      message: "Token refreshed successfully",
      token: updatedToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
};
