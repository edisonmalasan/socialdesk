/**
 * GET /api/saas-analytics — placeholder for the admin-only SaaS-level analytics
 * surface. The route is real and enforced by requireAdmin; the actual
 * platform-wide analytics logic is a separate future ticket, so this returns
 * 501 rather than faking a 200.
 */
exports.getSaasAnalytics = async (req, res) => {
  res.status(501).json({
    success: false,
    error: "saas-analytics is not implemented yet (admin access enforced)",
  });
};
