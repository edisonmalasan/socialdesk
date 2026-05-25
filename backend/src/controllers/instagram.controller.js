const facebookService = require("../services/meta.service");
const cloudinary = require("../config/cloudinary");
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
  const url = `https://www.facebook.com/v25.0/dialog/oauth?client_id=${
    process.env.FB_APP_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.INSTAGRAM_REDIRECT_URI
  )}&response_type=code&scope=pages_show_list,instagram_basic,instagram_content_publish`;

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

    // Exchange code for access token
    const data = await facebookService.handleOAuth(
      code,
      process.env.INSTAGRAM_REDIRECT_URI
    );

    // User access token from OAuth response
    const accessToken = data.user_access_token;

    // Get all Facebook pages connected to the user
    const pagesRes = await axios.get(`${GRAPH_URL}/me/accounts`, {
      params: { access_token: accessToken },
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
              access_token: accessToken,
            },
          }
        );

        // Use Instagram username if available
        instagramName = igRes.data.username || page.name;

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