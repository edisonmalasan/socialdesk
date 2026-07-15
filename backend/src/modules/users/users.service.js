const bcrypt = require("bcryptjs");
const usersRepository = require("./users.repository");
const mediaService = require("../media/media.service");

const AVATAR_FOLDER = "user_avatars";
const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5 MB

// Single source of truth for the avatar size cap: the route enforces it at the
// multer layer (rejecting while streaming) and the service re-checks it below.
exports.MAX_AVATAR_BYTES = MAX_AVATAR_BYTES;

/** Cloudinary public id for a user's avatar — deterministic so re-upload
 *  overwrites the old file and delete can target it without a stored id. */
const avatarPublicId = (userId) => `${AVATAR_FOLDER}/${userId}`;

/** Thrown for bad avatar input; the controller maps `statusCode` to the response. */
class AvatarValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AvatarValidationError";
    this.statusCode = 400;
  }
}

exports.listUsers = async () => {
  const { users, error } = await usersRepository.findAll();
  if (error) throw new Error(error.message);
  return users;
};

exports.getUserById = async (id) => {
  const { user, error } = await usersRepository.findById(id);
  if (error) throw new Error(error.message);
  return user;
};

/**
 * Creates a user. The password is hashed before persisting (the raw password
 * never reaches the DB), and adminId — the authenticated admin from the JWT —
 * is recorded as created_by.
 */
exports.createUser = async ({ email, password, full_name, role }, adminId) => {
  const password_hash = await bcrypt.hash(password, 10);
  const { user, error } = await usersRepository.create({
    email,
    password_hash,
    full_name,
    role: role || "user",
    created_by: adminId,
  });

  if (error) throw new Error(error.message);
  return user;
};

exports.updateUser = async (id, { email, full_name, role }) => {
  const { user, error } = await usersRepository.updateById(id, { email, full_name, role });
  if (error) throw new Error(error.message);
  return user;
};

/**
 * Backs the "disable" endpoint: reads the current status and flips it, so the
 * same route both disables an active user and re-enables an inactive one.
 * Returns null when the user does not exist (the controller maps that to 404).
 */
exports.toggleUserStatus = async (id) => {
  const { user: existing, error: findError } = await usersRepository.findById(id);
  if (findError) throw new Error(findError.message);
  if (!existing) return null;

  const nextStatus = existing.status === "active" ? "inactive" : "active";
  const { user, error } = await usersRepository.setStatus(id, nextStatus);
  if (error) throw new Error(error.message);
  return user;
};

exports.deleteUser = async (id) => {
  const { error } = await usersRepository.deleteById(id);
  if (error) throw new Error(error.message);
};

/**
 * Uploads the caller's own avatar to Cloudinary and persists its URL on
 * users.profile_url. Uses a deterministic public id so a re-upload overwrites
 * the previous avatar. Returns { profileUrl } for the response.
 */
exports.uploadAvatar = async (userId, file) => {
  if (!file) {
    throw new AvatarValidationError("An avatar image file is required");
  }
  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    throw new AvatarValidationError("Avatar must be an image file");
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new AvatarValidationError("Avatar must be 5 MB or smaller");
  }

  const result = await mediaService.uploadToCloudinary(file, {
    folder: AVATAR_FOLDER,
    public_id: userId,
    overwrite: true,
    invalidate: true,
    resource_type: "image",
  });

  const { user, error } = await usersRepository.updateProfileUrl(userId, result.secure_url);
  if (error) throw new Error(error.message);

  return { profileUrl: user ? user.profile_url : result.secure_url };
};

/**
 * Removes the caller's avatar: destroys the Cloudinary asset (a missing asset is
 * a no-op) and clears users.profile_url. Returns { profileUrl: null }.
 */
exports.removeAvatar = async (userId) => {
  await mediaService.destroyFromCloudinary(avatarPublicId(userId), { invalidate: true });

  const { error } = await usersRepository.updateProfileUrl(userId, null);
  if (error) throw new Error(error.message);

  return { profileUrl: null };
};
