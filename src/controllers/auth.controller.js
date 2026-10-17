// src/controllers/auth.controller.js
const { User, TokenBlacklist } = require('../models');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');

/**
 * Register a new user
 * POST /api/auth/register
 */
async function userRegisterController(req, res) {
  const { email, password, name } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(422).json({ message: 'User already exists with email.', status: 'failed' });
  }

  const user = await User.create({ email, password, name });
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '3d' });

  res.cookie('token', token);
  res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });

  await emailService.sendRegistrationEmail(user.email, user.name);
}

/**
 * Login an existing user
 * POST /api/auth/login
 */
async function userLoginController(req, res) {
  const { email, password } = req.body;
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Email or password is INVALID' });
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Email or password is INVALID' });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '3d' });
  res.cookie('token', token);
  res.status(200).json({
    user: { id: user.id, email: user.email, name: user.name },
    token,
  });
}

/**
 * Logout user – blacklist the JWT token
 * POST /api/auth/logout
 */
async function userLogoutController(req, res) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(200).json({ message: 'User logged out successfully' });
  }
  await TokenBlacklist.create({ token });
  res.clearCookie('token');
  res.status(200).json({ message: 'User logged out successfully' });
}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController,
};
