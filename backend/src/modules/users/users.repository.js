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
    .single();

  return { user: data, error };
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
    .single();

  return { user: data, error };
};

exports.setStatus = async (id, status) => {
  const { data, error } = await supabase
    .from("users")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(PUBLIC_COLUMNS)
    .single();

  return { user: data, error };
};

exports.deleteById = async (id) => {
  const { error } = await supabase.from("users").delete().eq("id", id);
  return { error };
};
