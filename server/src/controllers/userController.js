const User = require('../models/User');
const Project = require('../models/Project');
const Ticket = require('../models/Ticket');
const mailService = require('../services/mailService');
const { generateRandomPassword } = require('../utils/generatePassword');

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, department } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User with this email already exists');
    }

    const initialPassword = (password && password.trim()) ? password : generateRandomPassword(10);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const user = await User.create({
      name,
      email,
      password: initialPassword,
      role: role || 'Developer',
      department: department || 'Engineering',
      avatar
    });

    // Send Welcome Credentials Email
    try {
      await mailService.sendWelcomeUserEmail({
        name: user.name,
        email: user.email,
        password: initialPassword,
        role: user.role,
        createdBy: req.user
      });
    } catch (err) {
      console.error('[Welcome Email Error]', err.message);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      generatedPassword: initialPassword
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      res.status(404);
      throw new Error('User not found');
    }

    if (req.user._id.toString() === userId) {
      res.status(400);
      throw new Error('You cannot delete your own active Admin account');
    }

    // Delete user document
    await User.findByIdAndDelete(userId);

    // Clean up references in Projects and Tickets
    await Project.updateMany({ members: userId }, { $pull: { members: userId } });
    await Ticket.updateMany({ assignee: userId }, { $unset: { assignee: "" } });

    res.json({ message: `User '${userToDelete.name}' deleted successfully` });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUserById, createUser, deleteUser };
