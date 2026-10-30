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
    const { email, newPassword } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Please provide your registered email address');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404);
      throw new Error('No account found with this email address');
    }

    // Use user-provided new password, or generate a random temporary password
    const resetPass = (newPassword && newPassword.trim()) 
      ? newPassword.trim() 
      : generateRandomPassword(10);

    user.password = resetPass;
    await user.save();

    // Send email with new credentials asynchronously without blocking or failing the request
    mailService.sendForgotPasswordEmail({
      name: user.name,
      email: user.email,
      newPassword: resetPass
    }).catch(err => console.warn('[Forgot Password Email Warning]', err.message));

    res.json({
      success: true,
      message: (newPassword && newPassword.trim())
        ? `Password updated successfully for ${user.email}! You can now sign in with your new password.`
        : `Password reset successfully! A temporary password has been sent to ${user.email}.`,
      tempPassword: (newPassword && newPassword.trim()) ? null : resetPass
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
