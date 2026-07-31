const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { query } = require("../config/db");

// Verifies the JWT from the Authorization header (or httpOnly cookie) and
// attaches the authenticated user to req.user.
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const { rows } = await query(
    "SELECT id, name, email, role, avatar_url FROM users WHERE id = $1",
    [decoded.id]
  );

  if (!rows.length) {
    throw new ApiError(401, "Not authorized, user no longer exists");
  }

  req.user = rows[0];
  next();
});

// Restricts a route to one or more roles, e.g. authorize("admin", "delivery_partner").
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to perform this action");
    }
    next();
  };

module.exports = { protect, authorize };
