const supabase = require("../../infrastructure/database/supabaseClient");

exports.findUserByEmail = async (email) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  return { user, error };
};
