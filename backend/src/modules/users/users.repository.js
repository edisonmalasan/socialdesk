const supabase = require("../../infrastructure/database/supabaseClient");

/**
 * Explicit column allow-list used by every read/return below, so password_hash
 * is never selected back out of the DB and cannot leak in an API response.
 */
const PUBLIC_COLUMNS = "id, email, full_name, role, status, created_at, updated_at";

exports.findAll = async () => {
  const { data, error } = await supabase
    .from("users")
    .select(PUBLIC_COLUMNS)
    .order("created_at", { ascending: false });

  return { users: data, error };
};

exports.findById = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select(PUBLIC_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  return { user: data, error };
};

exports.findByIdWithPassword = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, profile_url, password_hash")
    .eq("id", id)
    .maybeSingle();

  return { user: data, error };
};

exports.findCurrentUser = async (id) => {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, full_name, profile_url")
    .eq("id", id)
    .maybeSingle();

  return { user: data, error };
};

exports.updateCurrentUser = async (id, full_name) => {
  const { data, error } = await supabase
    .from("users")
    .update({
      full_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id, email, full_name, profile_url")
    .maybeSingle();

  return { user: data, error };
};

exports.updatePassword = async (id, password_hash) => {
  const { error } = await supabase
    .from("users")
    .update({
      password_hash,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return { error };
};

exports.create = async ({ email, password_hash, full_name, role, created_by }) => {
  const { data, error } = await supabase
    .from("users")
    .insert({ email, password_hash, full_name, role, created_by })
    .select(PUBLIC_COLUMNS)
    .single();

  return { user: data, error };
};

exports.updateById = async (id, { email, full_name, role }) => {
  const { data, error } = await supabase
    .from("users")
    .update({ email, full_name, role, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PUBLIC_COLUMNS)
    .maybeSingle();

  return { user: data, error };
};

exports.setStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("users")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PUBLIC_COLUMNS)
    .maybeSingle();

  return { user: data, error };
};

exports.deleteById = async (id) => {
  const { error } = await supabase.from("users").delete().eq("id", id);
  return { error };
};

/**
 * Sets (or clears, when profileUrl is null) the caller's own avatar URL. Scoped
 * to a single id and returns only id + profile_url; used by the self-service
 * avatar endpoints, not the admin directory routes.
 */
exports.updateProfileUrl = async (id, profileUrl) => {
  const { data, error } = await supabase
    .from("users")
    .update({ profile_url: profileUrl, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, profile_url")
    .maybeSingle();

  return { user: data, error };
};
