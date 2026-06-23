const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authRepository = require("./auth.repository");

exports.login = async ({ email, password }) => {
  console.log(email, password);
  const { user, error } = await authRepository.findUserByEmail(email);

  if (error || !user) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return null;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  return {
    token,
    role: user.role,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name
    }
  };
};
