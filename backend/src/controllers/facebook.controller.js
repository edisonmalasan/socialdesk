const facebookService = require("../services/facebook.service");

exports.redirectToFacebook = (req, res) => {
  const url = facebookService.getAuthUrl();
  res.redirect(url);
};

exports.handleFacebookCallback = async (req, res) => {
  try {
    const code = req.query.code;

    const data = await facebookService.handleOAuth(code);

    res.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);

    res.status(500).json({
      success: false,
      error: error.response?.data || error.message,
    });
  }
};


exports.postMessage = async (req, res) => {
  try {
    const { pageId, pageAccessToken, message, scheduledTime } = req.body;

    if (!pageId || !pageAccessToken || !message)
      return res.status(400).json({ success: false, message: "Missing parameters" });

    const result = await facebookService.postToPage({ pageId, pageAccessToken, message, scheduledTime });

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("POST ERROR:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
};

const axios = require("axios");
const FormData = require("form-data");

exports.postPhoto = async (req, res) => {
  try {
    const { pageId, pageAccessToken, caption } = req.body;
    const file = req.file; // multer parses the file

    console.log("req.body:", req.body);
    console.log("this is the page id:", pageId);

    if (!pageId || !pageAccessToken || !file) {
      return res.status(400).json({ success: false, message: "Missing pageId, token, or file" });
    }

    // prepare form-data
    const form = new FormData();
    form.append("source", file.buffer, { filename: file.originalname });
    if (caption) form.append("caption", caption);

    const response = await axios.post(
      `https://graph.facebook.com/v25.0/${pageId}/photos`,
      form,
      {
        headers: { ...form.getHeaders() },
        params: { access_token: pageAccessToken },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("POST PHOTO ERROR:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
};