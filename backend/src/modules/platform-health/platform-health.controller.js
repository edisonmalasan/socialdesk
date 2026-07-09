/**
 * GET /api/platform-health — placeholder for the admin-only platform health
 * surface. The route is real and enforced by requireAdmin; the actual health
 * checks (DB/Redis/uptime) are a separate future ticket, so this returns 501
 * rather than faking a 200.
 */
exports.getPlatformHealth = async (req, res) => {
  res.status(501).json({
    success: false,
    error: "platform-health is not implemented yet (admin access enforced)",
  });
};
