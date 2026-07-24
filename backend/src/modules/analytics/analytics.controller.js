const analyticsService = require("./analytics.service");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

exports.getSummary = async (req, res) => {
  try {
    const summary = await analyticsService.getSummary(req.user.id, req.query);
    return successResponse(res, summary);
  } catch (error) {
    console.error("getSummary error:", error);
    return errorResponse(res, error.message || "Failed to fetch analytics summary", 500);
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await analyticsService.getPosts(req.user.id, req.query);
    return successResponse(res, posts);
  } catch (error) {
    console.error("getPosts error:", error);
    return errorResponse(res, error.message || "Failed to fetch analytics posts", 500);
  }
};

exports.getTopPosts = async (req, res) => {
  try {
    const topPosts = await analyticsService.getTopPosts(req.user.id, req.query);
    return successResponse(res, topPosts);
  } catch (error) {
    console.error("getTopPosts error:", error);
    return errorResponse(res, error.message || "Failed to fetch top posts", 500);
  }
};

exports.getBestTime = async (req, res) => {
  try {
    const result = await analyticsService.getBestTime(req.user.id, req.query);
    return successResponse(res, result);
  } catch (error) {
    console.error("getBestTime error:", error);
    return errorResponse(res, error.message || "Failed to fetch best time analytics", 500);
  }
};

exports.exportAnalytics = async (req, res) => {
  try {
    await analyticsService.exportAnalytics(req.user.id, req.query, res);
  } catch (error) {
    console.error("exportAnalytics error:", error);
    if (!res.headersSent) {
      return errorResponse(res, error.message || "Failed to export analytics", 500);
    }
  }
};
