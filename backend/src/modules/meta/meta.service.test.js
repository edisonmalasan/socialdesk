const { test } = require("node:test");
const assert = require("node:assert/strict");

require("../../test-utils/env");

const metaService = require("./meta.service");

test("getAuthUrl builds the Facebook OAuth URL with client id, redirect uri, and state", () => {
  const url = metaService.getAuthUrl("user-42");

  assert.match(url, /^https:\/\/www\.facebook\.com\/v25\.0\/dialog\/oauth\?/);
  assert.match(url, new RegExp(`client_id=${process.env.FB_APP_ID}`));
  assert.match(url, new RegExp(`redirect_uri=${process.env.FB_REDIRECT_URI}`));
  assert.match(url, /state=user-42/);
  assert.match(url, /scope=pages_show_list,pages_manage_posts/);
});

test("getInstagramAuthUrl builds the Instagram OAuth URL with an encoded redirect uri", () => {
  const url = metaService.getInstagramAuthUrl("user-7");

  assert.match(url, new RegExp(`client_id=${process.env.FB_APP_ID}`));
  assert.match(
    url,
    new RegExp(`redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_REDIRECT_URI)}`),
  );
  assert.match(url, /state=user-7/);
  assert.match(url, /scope=pages_show_list,instagram_basic,instagram_content_publish/);
});
