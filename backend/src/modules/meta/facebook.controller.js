const facebookService = require("./meta.service");
const cloudinary = require("../media/cloudinary.client");
const axios = require("axios");

/**
 * Base Facebook Graph API URL
 */
const GRAPH_URL = "https://graph.facebook.com/v25.0";

/**
 * Redirects user to Facebook OAuth login page
 * for account authentication and permissions approval.
 */
exports.redirectToFacebook = (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const url = facebookService.getAuthUrl(userId);

  // Redirect user to Facebook OAuth screen
  res.redirect(url);
};

/**
 * Handles Facebook OAuth callback after login.
 *
 * Flow:
 * 1. Receive authorization code
 * 2. Exchange code for access token
 * 3. Retrieve Facebook pages
 * 4. Check if page has Instagram Business account
 * 5. Redirect back to frontend with account details
 */
exports.handleFacebookCallback = async (req, res) => {
  try {
    // OAuth authorization code from Facebook
    const code = req.query.code;
    const userId = req.query.state;

    // Exchange code for access token and user data
    const data = await facebookService.handleOAuth(code, process.env.FB_REDIRECT_URI);

    console.log("Facebook OAuth data:", code);
    console.log("Facebook OAuth data:", data);
    console.log("Facebook redirect:");

    // User access token
    const shortLivedToken = data.user_access_token;

    console.log("User access token:", shortLivedToken);

    // Exchange for long lived token
    const longLivedToken = await facebookService.getLongLivedToken(shortLivedToken);

    // Fetch Facebook pages connected to the user
    const pagesRes = await axios.get(
      `${GRAPH_URL}/me/accounts`,
      {
        params: {
          access_token: longLivedToken,
        },
      }
    );

    const pages = pagesRes.data.data;

    // Use the first available page
    const page = pages?.[0];

    let instagramId = null;

    // Check if page has Instagram Business account
    if (page) {
      // Save social account and token to the database
      const dbService = require("../social-connections/social-connections.service");
      const platformId = await dbService.getPlatformId("facebook");
      
      const savedAccount = await dbService.upsertSocialAccount({
        userId,
        platformId,
        externalId: page.id,
        username: page.name,
        displayName: page.name,
        profileUrl: `https://facebook.com/${page.id}`,
        avatarUrl: null
      });

      await dbService.upsertOAuthToken({
        socialAccountId: savedAccount.id,
        accessToken: page.access_token, // Never-expiring page token
      });

      const pageDetails = await axios.get(
        `${GRAPH_URL}/${page.id}`,
        {
          params: {
            fields: "instagram_business_account,name",
            access_token: page.access_token,
          },
        }
      );

      // Extract Instagram Business account ID
      instagramId =
        pageDetails.data.instagram_business_account?.id || null;

      console.log("Instagram ID:", instagramId);
    }

    // Fallback page name
    const name = page?.name || "Facebook Page";

    // Redirect frontend with account connection data
    res.redirect(
      `http://localhost:3000/accounts?connected=facebook&name=${encodeURIComponent(
        name
      )}&igId=${instagramId || ""}`
    );

  } catch (error) {

    // Log API/server errors
    console.error(error.response?.data || error.message);

    // Redirect frontend with error state
    res.redirect(
      `http://localhost:3000/accounts?error=facebook`
    );
  }
};

// exports.handleFacebookCallback = async (req, res) => {
//   try {
//     const code = req.query.code;

//     const data = await facebookService.handleOAuth(code);

//     const page = data.pages?.[0];

//      res.redirect(
//       `http://localhost:3000/accounts?connected=facebook&name=${encodeURIComponent(
//         page?.name || "Facebook Page"
//       )}`
//     );

//   } catch (error) {
//     console.error(error.response?.data || error.message);

//     res.redirect(
//       `http://localhost:3000/accounts?error=facebook`
//     );
//   }
// };

/**
 * Creates a text post on a Facebook page.
 *
 * Supports optional scheduled publishing.
 */
exports.postMessage = async (req, res) => {
  try {

    // Extract request body data
    const { pageId, pageAccessToken, message, scheduledTime } = req.body;

    // Validate required parameters
    if (!pageId || !pageAccessToken || !message)
      return res.status(400).json({
        success: false,
        message: "Missing parameters"
      });

    // Create Facebook page post
    const result = await facebookService.postToPage({
      pageId,
      pageAccessToken,
      message,
      scheduledTime
    });

    // Return successful response
    res.json({ success: true, data: result });

  } catch (error) {

    // Log posting errors
    console.error("POST ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};

const FormData = require("form-data");

/**
 * Uploads and posts a photo directly to Facebook page.
 */
exports.postPhoto = async (req, res) => {
  try {

    // Extract request body fields
    const { pageId, pageAccessToken, caption } = req.body;

    // Uploaded file from multer middleware
    const file = req.file;

    console.log("req.body:", req.body);
    console.log("this is the page id:", pageId);

    // Validate required data
    if (!pageId || !pageAccessToken || !file) {
      return res.status(400).json({
        success: false,
        message: "Missing pageId, token, or file"
      });
    }

    // Prepare multipart form data
    const form = new FormData();

    form.append("source", file.buffer, {
      filename: file.originalname
    });

    // Optional image caption
    if (caption) form.append("caption", caption);

    // Upload image to Facebook page photos endpoint
    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${pageId}/photos`,
      form,
      {
        headers: { ...form.getHeaders() },
        params: { access_token: pageAccessToken },
      }
    );

    // Return Facebook response
    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {

    // Log upload errors
    console.error("POST PHOTO ERROR:", error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message
    });
  }
};

/**
 * Schedules a Facebook post with an uploaded image.
 *
 * Flow:
 * 1. Upload image to Cloudinary
 * 2. Use Cloudinary image URL in Facebook scheduled post
 */
exports.schedulePhotoPost = async (req, res) => {
  try {

    // Extract request body data
    const { pageId, pageAccessToken, message, scheduledTime } = req.body;

    // Uploaded image file
    const file = req.file;

    // Validate required fields
    if (!file || !pageId || !pageAccessToken || !scheduledTime) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    console.log("Cloudinary config:", cloudinary.config());

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "fb_posts" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(file.buffer);
    });

    // Secure Cloudinary image URL
    const imageUrl = uploadResult.secure_url;

    // Create scheduled Facebook post
    const fbResponse = await axios.post(
      `https://graph.facebook.com/v25.0/${pageId}/feed`,
      {
        message,
        link: imageUrl,
        published: false,
        scheduled_publish_time: scheduledTime,
      },
      {
        params: {
          access_token: pageAccessToken,
        },
      }
    );

    // Return success response
    res.json({
      success: true,
      imageUrl,
      facebook: fbResponse.data,
    });

  } catch (error) {

    // Log scheduling errors
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Creates a standard Instagram image post.
 *
 * Flow:
 * 1. Validate uploaded image
 * 2. Upload media to Instagram
 * 3. Publish Instagram post
 */
exports.createInstagramPost = async (req, res) => {
  try {

    // Extract request data
    const { igUserId, pageAccessToken, caption } = req.body;

    // Uploaded image file
    const file = req.file;

    // Validate image file
    if (!file) {
      return res.status(400).json({
        error: "Image file is required"
      });
    }

    // Validate Instagram credentials
    if (!igUserId || !pageAccessToken) {
      return res.status(400).json({
        error: "igUserId and pageAccessToken are required",
      });
    }

    // Create Instagram image post
    const result = await facebookService.createInstagramPost({
      igUserId,
      pageAccessToken,
      caption,
      file,
    });

    // Return successful response
    res.json({
      success: true,
      ...result,
    });

  } catch (error) {

    // Handle Instagram posting errors
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Creates an Instagram Reel post using uploaded video.
 *
 * Flow:
 * 1. Validate video upload
 * 2. Upload reel media
 * 3. Publish Instagram Reel
 */
exports.createInstagramReelPost = async (req, res) => {

  // Debug log to confirm controller execution
  console.log("🔥 REEL CONTROLLER HIT");

  try {

    // Extract request body
    const { igUserId, pageAccessToken, caption } = req.body;

    // Uploaded video file
    const file = req.file;

    console.log("MIME TYPE:", req.file.mimetype);
    console.log("FILE:", req.file);

    // Validate uploaded video
    if (!file) {
      return res.status(400).json({
        error: "Video file is required",
      });
    }

    // Validate Instagram account credentials
    if (!igUserId || !pageAccessToken) {
      return res.status(400).json({
        error: "igUserId and pageAccessToken are required",
      });
    }

    // Create Instagram Reel
    const result = await facebookService.createInstagramReelPost({
      igUserId,
      pageAccessToken,
      caption,
      file,
    });

    // Return successful response
    return res.json({
      success: true,
      ...result,
    });

  } catch (error) {

    // Handle reel upload/publish errors
    return res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
};

/**
 * Endpoint to explicitly refresh a Facebook OAuth token
 */
exports.refreshToken = async (req, res) => {
  try {
    const { socialAccountId } = req.body;
    
    if (!socialAccountId) {
      return res.status(400).json({ error: "socialAccountId is required" });
    }

    const updatedToken = await facebookService.refreshOAuthToken(socialAccountId);

    return res.json({
      success: true,
      message: "Token refreshed successfully",
      token: updatedToken
    });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to refresh token",
    });
  }
};
