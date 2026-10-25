const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mailService = require('../services/mailService');
const { generateRandomPassword } = require('../utils/generatePassword');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jira_key_2026_antigravity', {
    expiresIn: '30d'
  });
};

const registerUser = async (req, res, next) => {
  try {
    res.status(403);
    throw new Error('Public registration is disabled. User accounts are created by System Admin.');
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        token: generateToken(user._id)
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Please provide your registered email address');
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('No account found with this email address');
    }

    // Auto-generate random new password
    const newPassword = generateRandomPassword(10);
    user.password = newPassword;
    await user.save();

    // Send email with new password
    await mailService.sendForgotPasswordEmail({
      name: user.name,
      email: user.email,
      newPassword
    });

    res.json({
      message: `Password reset successfully! A temporary password has been sent to ${email}.`
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, forgotPassword, getMe };
