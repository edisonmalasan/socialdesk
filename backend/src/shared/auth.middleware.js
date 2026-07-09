const jwt = require("jsonwebtoken");

const getCookieValue = (cookieHeader, name) => {
  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) {
    return null;
  }

  const value = cookie.slice(name.length + 1);

  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
};

const getTokenFromRequest = (req) => {
  const authorization = req.get("authorization") || "";

  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }

  return getCookieValue(req.get("cookie"), "auth-token");
};

exports.requireAuth = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: payload.id,
      role: payload.role,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports._private = {
  getCookieValue,
  getTokenFromRequest,
};
