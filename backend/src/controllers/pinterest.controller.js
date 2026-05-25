const pinterestService = require("../services/pinterest.service");

/**
 * Redirects the user to Pinterest OAuth login page
 * for authentication and permission approval.
 */
exports.redirectToPinterest = (req, res) => {

  // Generate Pinterest OAuth authorization URL
  const url = pinterestService.getPinterestAuthUrl();

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

    // Extract authorization code from query params
    const { code } = req.query;

    // Validate authorization code
    if (!code) {
      return res.status(400).json({
        error: "Authorization code missing",
      });
    }

    // Exchange code for Pinterest access token
    const tokenData = await pinterestService.handlePinterestOAuth(code);

    // Return successful OAuth response
    res.json({
      success: true,
      token: tokenData,
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

  // Debug log to confirm controller execution
  console.log("HIT");

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
    const {
      accessToken,
      boardId,
      title,
      description,
      link,
    } = req.body || {};

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