const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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
      throw new Error('Please enter your account email address');
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(404);
      throw new Error('No account found with this email address');
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token for database storage and set 60-minute expiration
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Build reset link pointing to the React client page
    const clientUrl = mailService.getClientUrl();
    const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

    // Send password reset email with dedicated security template
    await mailService.sendPasswordResetEmail({
      name: user.name,
      email: user.email,
      resetUrl,
      expireMinutes: 60
    });

    res.json({
      success: true,
      message: `Password reset link has been emailed to ${user.email}. Please check your inbox and follow the link to set your new password.`
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const token = req.params.token || req.body.token;
    const { password } = req.body;

    if (!token) {
      res.status(400);
      throw new Error('Password reset token is missing');
    }

    if (!password || password.trim().length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }

    // Hash token to compare with database value
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Password reset link is invalid or has expired. Please request a new one.');
    }

    // Set user's manual password (userSchema.pre('save') encrypts it with bcrypt salt!)
    user.password = password.trim();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.'
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

module.exports = { registerUser, loginUser, forgotPassword, resetPassword, getMe };
