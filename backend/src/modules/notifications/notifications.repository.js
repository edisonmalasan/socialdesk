const supabase = require("../../infrastructure/database/supabaseClient");

/**
 * Inserts a new notification row and returns the created record.
 */
exports.create = async ({ userId, type, title, message }) => {
  const { data, error } = await supabase
    .from("notifications")
    .insert({ user_id: userId, type, title, message })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`);
  }

  return data;
};

exports.findAllByUser = async (userId, { type, page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;

  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type && type !== "All") {
    // If the frontend sends tab names like 'Alerts', map them to DB types
    // Or we just expect frontend to send the db enum value (alert, social).
    // Let's handle both just in case, but frontend usually maps it or we handle it here.
    const typeValue = type === "Alerts" ? "alert" : type === "Social" ? "social" : type === "Unread" ? null : type.toLowerCase();
    
    if (type === "Unread") {
      query = query.eq("is_read", false);
    } else if (typeValue && typeValue !== "all") {
      query = query.eq("type", typeValue);
    }
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`);
  }

  return { data, total: count };
};

exports.getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new Error(`Failed to get unread count: ${error.message}`);
  }

  return count;
};

exports.markAsRead = async (id, userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }

  return data;
};

exports.markAllAsRead = async (userId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) {
    throw new Error(`Failed to mark all notifications as read: ${error.message}`);
  }

  return true;
};

exports.deleteByIdAndUser = async (id, userId) => {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to delete notification: ${error.message}`);
  }

  return true;
};
