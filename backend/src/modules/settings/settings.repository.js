const supabase = require("../../infrastructure/database/supabaseClient");

const USER_COLUMNS = "id, email, full_name, profile_url, timezone, role, status";
const SETTINGS_COLUMNS = `
  user_id,
  notification_post_success,
  notification_post_failure,
  notification_weekly_report,
  created_at,
  updated_at
`;

exports.findUserById = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select(USER_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load user settings: ${error.message}`);
  }

  return data;
};

exports.getOrCreateNotificationSettings = async (userId) => {
  const { data, error } = await supabase
    .from("user_settings")
    .select(SETTINGS_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load notification settings: ${error.message}`);
  }

  if (data) {
    return data;
  }

  const { data: inserted, error: insertError } = await supabase
    .from("user_settings")
    .insert({ user_id: userId })
    .select(SETTINGS_COLUMNS)
    .single();

  if (insertError) {
    throw new Error(`Failed to create notification settings: ${insertError.message}`);
  }

  return inserted;
};

exports.updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select(USER_COLUMNS)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update profile settings: ${error.message}`);
  }

  return data;
};

exports.updateNotificationSettings = async (userId, updates) => {
  const payload = {
    user_id: userId,
    ...updates,
  };

  const { data, error } = await supabase
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" })
    .select(SETTINGS_COLUMNS)
    .single();

  if (error) {
    throw new Error(`Failed to update notification settings: ${error.message}`);
  }

  return data;
};
