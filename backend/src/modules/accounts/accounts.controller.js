const accountsService = require("./accounts.service");
const {
  successResponse,
  errorResponse,
} = require("../../shared/utils/response.util");

exports.listAccounts = async (req, res) => {
  try {
    const accounts = await accountsService.listAccounts(req.user.id);
    return successResponse(res, accounts);
  } catch (error) {
    console.error("listAccounts error:", error);
    return errorResponse(res, error.message || "Failed to fetch accounts", 500);
  }
};

exports.createAccount = async (req, res) => {
  const { platformCode, external_id, username, display_name } = req.body;

  try {
    const account = await accountsService.createAccount(req.user.id, {
      platformCode,
      externalId: external_id,
      username,
      displayName: display_name,
    });
    return successResponse(res, account, 201);
  } catch (error) {
    console.error("createAccount error:", error);
    // getPlatformId throws "Platform not found for code: ..." for unknown codes.
    if (/platform not found/i.test(error.message || "")) {
      return errorResponse(res, error.message, 400);
    }
    return errorResponse(res, error.message || "Failed to create account", 500);
  }
};

exports.updateAccount = async (req, res) => {
  const { is_active, username, display_name } = req.body;

  // Only forward fields that were actually provided.
  const fields = {};
  if (is_active !== undefined) fields.is_active = is_active;
  if (username !== undefined) fields.username = username;
  if (display_name !== undefined) fields.display_name = display_name;

  try {
    const account = await accountsService.updateAccount(
      req.user.id,
      req.params.id,
      fields,
    );
    if (!account) {
      return errorResponse(res, "Account not found", 404);
    }
    return successResponse(res, account);
  } catch (error) {
    console.error("updateAccount error:", error);
    return errorResponse(res, error.message || "Failed to update account", 500);
  }
};

exports.disconnectAccount = async (req, res) => {
  try {
    const account = await accountsService.disconnectAccount(
      req.user.id,
      req.params.id,
    );
    if (!account) {
      return errorResponse(res, "Account not found", 404);
    }
    return successResponse(res, { id: account.id, is_active: account.is_active });
  } catch (error) {
    console.error("disconnectAccount error:", error);
    return errorResponse(res, error.message || "Failed to disconnect account", 500);
  }
};
