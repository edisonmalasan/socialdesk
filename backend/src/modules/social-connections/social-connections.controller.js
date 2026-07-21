const socialConnectionsService = require("./social-connections.service");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

exports.getPlatforms = async (req, res) => {
  try {
    const platforms = await socialConnectionsService.getPlatforms();
    return successResponse(res, platforms);
  } catch (error) {
    console.error("getPlatforms error:", error);
    return errorResponse(res, "Failed to fetch platforms", 500);
  }
};

exports.getConnectedAccounts = async (req, res) => {
  try {
    const accounts = await socialConnectionsService.getUserConnections(req.user.id);
    return successResponse(res, accounts);
  } catch (error) {
    console.error("getConnectedAccounts error:", error);
    return errorResponse(res, "Failed to fetch connected accounts", 500);
  }
};
