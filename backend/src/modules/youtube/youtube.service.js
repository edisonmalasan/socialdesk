const { google } = require("googleapis");
const { Readable } = require("stream");
const dbService = require("../social-connections/social-connections.service");

const getOAuth2Client = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.YOUTUBE_REDIRECT_URI,
  );

const SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

exports.getYouTubeAuthUrl = (userId) => {
  const oauth2Client = getOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    state: userId,
    prompt: "consent",
  });
};

exports.handleYouTubeOAuth = async (code) => {
  const oauth2Client = getOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

exports.getChannelProfile = async (tokens) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const res = await youtube.channels.list({
    part: ["snippet", "contentDetails"],
    mine: true,
  });

  const channel = res.data.items?.[0];
  if (!channel) throw new Error("No YouTube channel found for this account");

  return {
    channelId: channel.id,
    title: channel.snippet.title,
    description: channel.snippet.description,
    thumbnailUrl: channel.snippet.thumbnails?.default?.url,
    customUrl: channel.snippet.customUrl,
  };
};

exports.uploadVideo = async ({ tokens, file, title, description, tags, privacyStatus }) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  const videoStream = Readable.from(file.buffer);

  const res = await youtube.videos.insert({
    part: ["snippet", "status"],
    requestBody: {
      snippet: {
        title,
        description: description || "",
        tags: tags || [],
        categoryId: "22",
      },
      status: {
        privacyStatus: privacyStatus || "public",
      },
    },
    media: {
      mimeType: file.mimetype,
      body: videoStream,
    },
  });

  return res.data;
};

/**
 * Exchanges a refresh token for a new access token.
 */
exports.mintNewAccessToken = async (refreshToken) => {
  const oauth2Client = getOAuth2Client();
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();
  return credentials;
};

/**
 * Refreshes and persists the OAuth token for a given social account.
 */
exports.refreshOAuthToken = async (socialAccountId) => {
  const account = await dbService.getSocialAccountWithToken(socialAccountId);
  const refreshToken = account.oauth_tokens?.refresh_token;

  if (!refreshToken) {
    throw new Error("No refresh token available for this account");
  }

  const credentials = await exports.mintNewAccessToken(refreshToken);

  const updatedToken = await dbService.upsertOAuthToken({
    socialAccountId,
    accessToken: credentials.access_token,
    refreshToken: credentials.refresh_token || refreshToken,
    tokenType: credentials.token_type || "Bearer",
    expiresAt: credentials.expiry_date
      ? new Date(credentials.expiry_date).toISOString()
      : null,
    scope: credentials.scope,
  });

  return updatedToken;
};

/**
 * MOCK: Fetches YouTube channel analytics.
 * In a real scenario, this queries the YouTube Analytics API.
 */
exports.getChannelAnalytics = async (channelId, tokens) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        followers_count: Math.floor(Math.random() * 5000) + 500,
        following_count: 0,
        total_posts: Math.floor(Math.random() * 100) + 10,
        total_likes: Math.floor(Math.random() * 20000) + 2000,
        total_comments: Math.floor(Math.random() * 5000) + 500,
        total_shares: Math.floor(Math.random() * 2000) + 200,
        total_views: Math.floor(Math.random() * 500000) + 50000,
        total_reach: Math.floor(Math.random() * 300000) + 30000,
        impressions: Math.floor(Math.random() * 1000000) + 100000,
        engagement_rate: (Math.random() * 8 + 2).toFixed(2),
      });
    }, 100);
  });
};

/**
 * MOCK: Fetches YouTube video analytics.
 */
exports.getVideoAnalytics = async (videoId, tokens) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const likes = Math.floor(Math.random() * 1000) + 50;
      const comments = Math.floor(Math.random() * 200) + 10;
      const shares = Math.floor(Math.random() * 100) + 5;
      const views = Math.floor(Math.random() * 10000) + 1000;
      
      resolve({
        likes,
        comments,
        shares,
        views,
        saves: Math.floor(Math.random() * 50),
        reach: views,
        engagement_score: likes + comments * 3 + shares * 5,
      });
    }, 50);
  });
};

