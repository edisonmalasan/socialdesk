const facebookService = require("./meta.service");
const cloudinary = require("../media/cloudinary.client");
const axios = require("axios");

/**
 * Base URL for Facebook Graph API
 */
const GRAPH_URL = "https://graph.facebook.com/v25.0";

/**
 * Redirects the user to Facebook OAuth login
 * so they can connect their Instagram Business account.
 *
 * Requested permissions:
 * - pages_show_list
 * - instagram_basic
 * - instagram_content_publish
 */
exports.redirectToInstagram = (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const url = facebookService.getInstagramAuthUrl(userId);

  // Redirect user to Facebook login/consent screen
  res.redirect(url);
};

/**
 * Handles the OAuth callback from Facebook after login.
 *
 * Flow:
 * 1. Receive authorization code from Facebook
 * 2. Exchange code for user access token
 * 3. Fetch Facebook pages connected to the account
 * 4. Find a page linked to an Instagram Business account
 * 5. Retrieve Instagram username/details
 * 6. Redirect back to frontend with connection details
 */
exports.handleInstagramCallback = async (req, res) => {
  try {
    // Authorization code returned by Facebook
    const code = req.query.code;
    const userId = req.query.state;

    // Exchange code for access token
    const data = await facebookService.handleOAuth(
      code,
      process.env.INSTAGRAM_REDIRECT_URI
    );

    // User access token from OAuth response
    const shortLivedToken = data.user_access_token;

    // Exchange for long lived token
    const longLivedToken = await facebookService.getLongLivedToken(shortLivedToken);

    // Get all Facebook pages connected to the user
    const pagesRes = await axios.get(`${GRAPH_URL}/me/accounts`, {
      params: { access_token: longLivedToken },
    });

    const pages = pagesRes.data.data;

    let instagramId = null;
    let instagramName = null;

    // Loop through pages to find one linked to Instagram
    for (const page of pages) {

      // Fetch page details including Instagram Business account
      const pageDetails = await axios.get(
        `${GRAPH_URL}/${page.id}`,
        {
          params: {
            fields: "instagram_business_account,name",
            access_token: page.access_token,
          },
        }
      );

      const ig = pageDetails.data.instagram_business_account;

      // If page has an Instagram Business account attached
      if (ig) {
        instagramId = ig.id;

        // Fetch Instagram account details
        const igRes = await axios.get(
          `${GRAPH_URL}/${instagramId}`,
          {
            params: {
              fields: "username,name",
              access_token: longLivedToken,
            },
          }
        );

        // Use Instagram username if available
        instagramName = igRes.data.username || page.name;

        // Save to database
        const dbService = require("../social-connections/social-connections.service");
        const platformId = await dbService.getPlatformId("instagram");

        const savedAccount = await dbService.upsertSocialAccount({
          userId,
          platformId,
          externalId: instagramId,
          username: igRes.data.username,
          displayName: instagramName,
          profileUrl: igRes.data.username ? `https://instagram.com/${igRes.data.username}` : null,
          avatarUrl: null
        });

        await dbService.upsertOAuthToken({
          socialAccountId: savedAccount.id,
          accessToken: page.access_token, // Page access token is used to post to IG
        });

        // Stop after finding the first connected IG account
        break;
      }
    }

    // Redirect back to frontend with success data
    res.redirect(
      `http://localhost:3000/accounts?connected=instagram&name=${encodeURIComponent(
        instagramName || "Instagram"
      )}&igId=${instagramId || ""}`
    );

  } catch (err) {

    // Log API or server errors for debugging
    console.error(err.response?.data || err.message);

    // Redirect frontend with error state
    res.redirect("http://localhost:3000/accounts?error=instagram");
  }
};

/**
 * Endpoint to explicitly refresh an Instagram (Facebook) OAuth token
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
