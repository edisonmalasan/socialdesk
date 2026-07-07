const jwt = require("jsonwebtoken");

/**
 * Express middleware that verifies the JWT from the Authorization header
 * or the "auth-token" cookie and attaches the decoded payload to req.user.
 *
 * Decoded payload shape: { id: string, role: string }
 *
 * Usage:
 *   const { authenticate } = require("../../shared/middleware/auth.middleware");
 *   router.get("/protected", authenticate, handler);
 */
const authenticate = (req, res, next) => {
  // 1. Try Authorization header first (Bearer <token>)
  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  }

  // 2. Fall back to cookie
  if (!token && req.cookies) {
    token = req.cookies["auth-token"];
  }

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/**
 * Express middleware that restricts access to admin users only.
 * Must be used AFTER authenticate.
 *
 * Usage:
 *   router.get("/admin-only", authenticate, requireAdmin, handler);
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = { authenticate, requireAdmin };
