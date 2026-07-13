const supabase = require("../../infrastructure/database/supabaseClient");

/**
 * Returns all active social accounts for a user.
 */
exports.findAllByUser = async (userId) => {
  const { data, error } = await supabase
    .from("social_accounts")
    .select(`
      id,
      username,
      display_name,
      profile_url,
      avatar_url,
      is_active,
      connected_at,
      platforms (
        id,
        code,
        name
      )
    `)
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("connected_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch accounts: ${error.message}`);
  }

  return data;
};

/**
 * Finds a platform by its code.
 */
exports.findPlatformByCode = async (platformCode) => {
  const { data, error } = await supabase
    .from("platforms")
    .select("id")
    .eq("code", platformCode)
    .single();

  if (error) {
    throw new Error(`Platform not found: ${platformCode}`);
  }

  return data;
};

/**
 * Inserts a new social account and returns it.
 */
exports.createAccount = async ({
  userId,
  platformId,
  externalId,
  username,
  displayName,
}) => {
  const { data, error } = await supabase
    .from("social_accounts")
    .insert({
      user_id: userId,
      platform_id: platformId,
      external_id: externalId,
      username,
      display_name: displayName,
      is_active: true,
    })
    .select(`
      id,
      username,
      display_name,
      profile_url,
      avatar_url,
      is_active,
      connected_at,
      platforms (
        id,
        code,
        name
      )
    `)
    .single();

  if (error) {
    throw new Error(`Failed to create account: ${error.message}`);
  }

  return data;
};

/**
 * Soft deletes an account by setting is_active to false.
 */
exports.deactivateAccount = async (accountId, userId) => {
  const { error } = await supabase
    .from("social_accounts")
    .update({ is_active: false })
    .eq("id", accountId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to deactivate account: ${error.message}`);
  }
};
