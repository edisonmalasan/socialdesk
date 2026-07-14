const bcrypt = require("bcryptjs");
const usersRepository = require("./users.repository");

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
