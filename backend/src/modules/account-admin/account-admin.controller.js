/**
 * GET /api/account-admin — placeholder for the admin-only account
 * administration surface. The route is real and enforced by requireAdmin; the
 * actual account admin logic is a separate future ticket, so this returns 501
 * rather than faking a 200.
 */
exports.getAccountAdmin = async (req, res) => {
  res.status(501).json({
    success: false,
    error: "account-admin is not implemented yet (admin access enforced)",
  });
};
