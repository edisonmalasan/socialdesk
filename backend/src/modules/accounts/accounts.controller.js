const accountsService = require("./accounts.service");
const { successResponse, errorResponse } = require("../../shared/utils/response.util");

exports.listAccounts = async (req, res) => {
  try {
    const accounts = await accountsService.listAccounts(req.user.id);
    return successResponse(res, accounts);
  } catch (error) {
    console.error("listAccounts error:", error);
    return errorResponse(res, error.message || "Failed to fetch accounts", 500);
  }
};

exports.connectAccount = async (req, res) => {
  try {
    const account = await accountsService.connectAccount(req.user.id, req.body);
    return successResponse(res, account, 201);
  } catch (error) {
    console.error("connectAccount error:", error);
    // Mimic the frontend behavior for platform not found
    if (error.message.includes("Platform not found")) {
      return errorResponse(res, "Platform not found", 400);
    }
    return errorResponse(res, error.message || "Failed to connect account", 500);
  }
};

exports.disconnectAccount = async (req, res) => {
  try {
    await accountsService.disconnectAccount(req.params.id, req.user.id);
    return successResponse(res, { success: true });
  } catch (error) {
    console.error("disconnectAccount error:", error);
    return errorResponse(res, error.message || "Failed to disconnect account", 500);
  }
};
