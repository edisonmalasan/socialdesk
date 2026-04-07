const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const FB_BASE = "https://graph.facebook.com/v25.0";

exports.getAuthUrl = () => {
  return `https://www.facebook.com/v25.0/dialog/oauth?client_id=${process.env.FB_APP_ID}&redirect_uri=${process.env.FB_REDIRECT_URI}&scope=pages_show_list,pages_manage_posts,pages_read_engagement`;
};



exports.handleOAuth = async (code) => {
  // Exchange code → user access token
  const tokenRes = await axios.get(`${FB_BASE}/oauth/access_token`, {
    params: {
      client_id: process.env.FB_APP_ID,
      client_secret: process.env.FB_APP_SECRET,
      redirect_uri: process.env.FB_REDIRECT_URI,
      code,
    },
  });

  const userAccessToken = tokenRes.data.access_token;

  // Get pages
  const pagesRes = await axios.get(`${FB_BASE}/me/accounts`, {
    params: {
      access_token: userAccessToken,
      
    },
  });
  console.log(userAccessToken)

  return {
    user_access_token: userAccessToken,
    pages: pagesRes.data.data,
  };
};



exports.postToPage = async ({ pageId, pageAccessToken, message, scheduledTime }) => {
  const url = `${FB_BASE}/${pageId}/feed`;

  const data = {
    message,
    published: scheduledTime ? false : true,           // false if scheduling
    scheduled_publish_time: scheduledTime || undefined, // unix timestamp
  };

  const res = await axios.post(url, data, {
    params: {
      access_token: pageAccessToken,
    },
  });

  return res.data;
};

async function postPhotoToPage({ pageId, pageAccessToken, caption, filePath }) {
  const url = `https://graph.facebook.com/v25.0/${pageId}/photos`;

  const form = new FormData();
  form.append("source", fs.createReadStream(filePath)); // local file
  if (caption) form.append("caption", caption);

  const response = await axios.post(url, form, {
    headers: {
      ...form.getHeaders(), // important for multipart
    },
    params: {
      access_token: pageAccessToken,
    },
  });

  return response.data;
}

