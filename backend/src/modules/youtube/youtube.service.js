const { google } = require("googleapis");
const { Readable } = require("stream");

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
