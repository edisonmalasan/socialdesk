const usersService = require("./users.service");
const {
  successResponse,
  errorResponse,
} = require("../../shared/utils/response.util");

exports.listUsers = async (req, res) => {
  try {
    const users = await usersService.listUsers();
    return successResponse(res, users);
  } catch (error) {
    return errorResponse(res, error.message || "Internal server error", 500);
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await usersService.getUserById(id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, error.message || "Internal server error", 500);
  }
};

/**
 * POST /api/users — create a user. req.user is populated by the authenticate
 * middleware; its id is passed to the service and stored as created_by (which
 * admin provisioned the account).
 */
exports.createUser = async (req, res) => {
  const { email, password, full_name, role } = req.body;

  if (!email || !password) {
    return errorResponse(res, "email and password are required", 400);
  }

  try {
    const user = await usersService.createUser(
      { email, password, full_name, role },
      req.user.id,
    );
    return successResponse(res, user, 201);
  } catch (error) {
    return errorResponse(res, error.message || "Internal server error", 500);
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, full_name, role } = req.body;

  try {
    const user = await usersService.updateUser(id, { email, full_name, role });
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, error.message || "Internal server error", 500);
  }
};

exports.disableUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await usersService.toggleUserStatus(id);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }
    return successResponse(res, user);
  } catch (error) {
    return errorResponse(res, error.message || "Internal server error", 500);
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await usersService.deleteUser(id);
    return res.status(204).send();
  } catch (error) {
    return errorResponse(res, error.message || "Internal server error", 500);
  }
};

/**
 * POST /api/users/avatar — self-service. Uploads the authenticated caller's
 * avatar (multipart field "avatar") and returns the persisted URL. Validation
 * failures carry a statusCode (400); everything else falls back to 500.
 */
exports.uploadAvatar = async (req, res) => {
  try {
    const result = await usersService.uploadAvatar(req.user.id, req.file);
    return successResponse(res, result);
  } catch (error) {
    console.error("Failed to upload avatar:", error);
    return errorResponse(
      res,
      error.message || "Failed to upload avatar",
      error.statusCode || 500,
    );
  }
};

/**
 * DELETE /api/users/avatar — self-service. Removes the authenticated caller's
 * avatar from storage and clears it on their profile.
 */
exports.deleteAvatar = async (req, res) => {
  try {
    const result = await usersService.removeAvatar(req.user.id);
    return successResponse(res, result);
  } catch (error) {
    console.error("Failed to delete avatar:", error);
    return errorResponse(
      res,
      error.message || "Failed to delete avatar",
      error.statusCode || 500,
    );
  }
};
