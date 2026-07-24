const supabase = require("../../infrastructure/database/supabaseClient");

/**
 * Columns returned to the client. Mirrors the shape the frontend expects —
 * a nested `platforms` object — so GET/POST responses stay compatible with the
 * accounts and analytics pages.
 */
const ACCOUNT_SELECT = `
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
`;

/** Lists a user's active (connected) accounts, newest first. */
exports.findActiveByUser = async (userId) => {
  const { data, error } = await supabase
    .from("social_accounts")
    .select(ACCOUNT_SELECT)
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("connected_at", { ascending: false });

  return { accounts: data, error };
};

/** Inserts a manually-created account (active by default). */
exports.insertAccount = async ({
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
    .select(ACCOUNT_SELECT)
    .single();

  return { account: data, error };
};

/**
 * Updates mutable fields on an account, scoped to its owner. The user_id filter
 * is the ownership guard: a mismatched id/owner matches no row and returns
 * account === null, which the controller maps to 404.
 */
exports.updateForUser = async (id, userId, fields) => {
  const { data, error } = await supabase
    .from("social_accounts")
    .update(fields)
    .eq("id", id)
    .eq("user_id", userId)
    .select(ACCOUNT_SELECT)
    .maybeSingle();

  return { account: data, error };
};
