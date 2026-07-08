const usersService = require("./users.service");

exports.listUsers = async (req, res) => {
  try {
    const users = await usersService.listUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
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
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const user = await usersService.createUser({ email, password, full_name, role }, req.user.id);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, full_name, role } = req.body;

  try {
    const user = await usersService.updateUser(id, { email, full_name, role });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.disableUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await usersService.toggleUserStatus(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await usersService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
