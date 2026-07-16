const dashboardService = require("./dashboard.service");

exports.getOverview = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const overview = await dashboardService.getOverview(userId);
    res.status(200).json(overview);
  } catch (error) {
    console.error("Error in getOverview:", error);
    res.status(500).json({ error: "Failed to fetch dashboard overview" });
  }
};
