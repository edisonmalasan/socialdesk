const supabase = require("../../infrastructure/database/supabaseClient");

/**
 * Retrieves the platform ID by its code (e.g., 'facebook', 'instagram').
 */
exports.getPlatformId = async (platformCode) => {
  const { data, error } = await supabase
    .from("platforms")
    .select("id")
    .eq("code", platformCode)
    .single();

  if (error || !data) {
    throw new Error(`Platform not found for code: ${platformCode}`);
  }
  return data.id;
};

/**
 * Upserts a social account (inserts if new, updates if exists based on platform_id & external_id).
 */
exports.upsertSocialAccount = async ({
  userId,
  platformId,
  externalId,
  username,
  displayName,
  profileUrl,
  avatarUrl,
  metadata = {},
}) => {
  // handle upsert by checking account existence 
  const { data: existingAccount } = await supabase
    .from("social_accounts")
    .select("id")
    .eq("platform_id", platformId)
    .eq("external_id", externalId)
    .single();

  const accountData = {
    user_id: userId,
    platform_id: platformId,
    external_id: externalId,
    username,
    display_name: displayName,
    profile_url: profileUrl,
    avatar_url: avatarUrl,
    metadata,
    last_synced_at: new Date().toISOString(),
  };

  let response;
  if (existingAccount) {
    response = await supabase
      .from("social_accounts")
      .update(accountData)
      .eq("id", existingAccount.id)
      .select()
      .single();
  } else {
    response = await supabase
      .from("social_accounts")
      .insert(accountData)
      .select()
      .single();
  }

  if (response.error) {
    throw new Error(`Failed to upsert social account: ${response.error.message}`);
  }

  return response.data;
};

/**
 * Upserts an OAuth token linked to a social account.
 */
exports.upsertOAuthToken = async ({
  socialAccountId,
  accessToken,
  refreshToken = null,
  tokenType = "Bearer",
  expiresAt = null,
  scope = null,
  metadata = {},
}) => {
  const { data: existingToken } = await supabase
    .from("oauth_tokens")
    .select("id")
    .eq("social_account_id", socialAccountId)
    .single();

  const tokenData = {
    social_account_id: socialAccountId,
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: tokenType,
    expires_at: expiresAt,
    scope,
    metadata,
  };

  let response;
  if (existingToken) {
    response = await supabase
      .from("oauth_tokens")
      .update(tokenData)
      .eq("id", existingToken.id)
      .select()
      .single();
  } else {
    response = await supabase
      .from("oauth_tokens")
      .insert(tokenData)
      .select()
      .single();
  }

  if (response.error) {
    throw new Error(`Failed to upsert OAuth token: ${response.error.message}`);
  }

  return response.data;
};

/**
 * Retrieves a social account with its oauth token
 */
exports.getSocialAccountWithToken = async (socialAccountId) => {
  const { data, error } = await supabase
    .from("social_accounts")
    .select(`
      *,
      oauth_tokens (
        access_token,
        refresh_token,
        expires_at
      )
    `)
    .eq("id", socialAccountId)
    .single();

  if (error || !data) {
    throw new Error(`Social account not found: ${socialAccountId}`);
  }
  return data;
};

/**
 * Retrieves the platform and OAuth token data needed for publishing.
 */
exports.getPublishingConnection = async (socialAccountId) => {
  const { data, error } = await supabase
    .from("social_accounts")
    .select(`
      id,
      external_id,
      username,
      display_name,
      platforms (
        code
      ),
      oauth_tokens (
        access_token,
        refresh_token,
        token_type,
        expires_at
      )
    `)
    .eq("id", socialAccountId)
    .single();

  if (error || !data) {
    throw new Error(`Social account not found: ${socialAccountId}`);
  }

  const token = Array.isArray(data.oauth_tokens)
    ? data.oauth_tokens[0]
    : data.oauth_tokens;

  if (!token?.access_token) {
    throw new Error(`OAuth token not found for social account: ${socialAccountId}`);
  }

  return {
    socialAccountId: data.id,
    platformCode: data.platforms?.code,
    externalId: data.external_id,
    username: data.username,
    displayName: data.display_name,
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    tokenType: token.token_type,
    expiresAt: token.expires_at,
  };
};
