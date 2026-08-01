const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const generateToken = require("../utils/generateToken");
const UserModel = require("../models/user.model");
const { sendEmail } = require("../services/email.service");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// @route POST /api/v1/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await UserModel.findByEmail(email);
  if (existing) throw new ApiError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await UserModel.create({ name, email, passwordHash });
  const token = generateToken({ id: user.id, role: user.role });

  res.cookie("token", token, cookieOptions);
  res.status(201).json({ success: true, data: { user, token } });
});

// @route POST /api/v1/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await UserModel.findByEmail(email);
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const token = generateToken({ id: user.id, role: user.role });
  delete user.password_hash;

  res.cookie("token", token, cookieOptions);
  res.status(200).json({ success: true, data: { user, token } });
});

// @route POST /api/v1/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// @route GET /api/v1/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

// @route POST /api/v1/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await UserModel.findByEmail(email);

  // Always respond the same way to avoid leaking which emails are registered.
  if (!user) {
    return res.status(200).json({
      success: true,
      message: "If that email exists, a reset link has been sent",
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await UserModel.setResetToken(user.id, resetToken, expiresAt);

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Farmly password",
    html: `<p>Click the link below to reset your password. This link expires in 30 minutes.</p>
           <a href="${resetUrl}">${resetUrl}</a>`,
  });

  res.status(200).json({
    success: true,
    message: "If that email exists, a reset link has been sent",
  });
});

// @route POST /api/v1/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await UserModel.findByResetToken(token);
  if (!user) throw new ApiError(400, "Reset link is invalid or has expired");

  const passwordHash = await bcrypt.hash(password, 12);
  await UserModel.updatePassword(user.id, passwordHash);

  res.status(200).json({ success: true, message: "Password reset successfully" });
});

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };
