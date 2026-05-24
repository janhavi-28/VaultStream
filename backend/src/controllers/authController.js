import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { generateToken } from '../utils/jwt.js';
import Notification from '../models/Notification.js';
import { emitNotification } from '../sockets/socketHandler.js';

// ─────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role, tenantId } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      res.status(400);
      return next(new Error('Please provide name, email, and password'));
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409);
      return next(new Error('An account with this email already exists'));
    }

    // Normalize and sanitize the role to be completely bulletproof
    const cleanRole = typeof role === 'string' ? role.trim().toLowerCase() : 'viewer';
    const assignedRole = ['editor', 'viewer'].includes(cleanRole) ? cleanRole : 'viewer';

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      tenantId: tenantId || null,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide email and password'));
    }

    // Explicitly select password since it's hidden by default
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    if (!user.isActive) {
      res.status(403);
      return next(new Error('Your account has been deactivated. Please contact support.'));
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    // req.user is already set by the protect middleware
    const user = req.user;

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        editorRequestStatus: user.editorRequestStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Change user password
// @route   PUT /api/auth/password
// @access  Private
// ─────────────────────────────────────────────
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400);
      return next(new Error('Please provide both current and new passwords'));
    }

    if (newPassword.length < 6) {
      res.status(400);
      return next(new Error('New password must be at least 6 characters'));
    }

    // Find user and explicitly select password
    const user = await User.findById(req.user._id).select('+password');

    // Check if current password is correct
    if (!(await user.matchPassword(currentPassword))) {
      res.status(401);
      return next(new Error('Incorrect current password'));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Upgrade user role to editor
// @route   PUT /api/auth/upgrade
// @access  Private
// ─────────────────────────────────────────────
export const upgradeToEditor = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.role === 'admin' || user.role === 'editor') {
      return res.status(200).json({
        success: true,
        message: 'User is already an editor or admin',
        role: user.role
      });
    }

    if (user.editorRequestStatus === 'pending') {
      return res.status(200).json({
        success: true,
        message: 'Request already pending',
      });
    }

    user.editorRequestStatus = 'pending';
    await user.save();

    // Notify the user that their request was received
    const notification = await Notification.create({
      userId: user._id,
      title: 'Creator Request Submitted',
      message: 'Your request to become a Creator/Editor has been submitted. An admin will review it shortly.',
      type: 'info',
    });
    const io = req.app.get('io');
    if (io) emitNotification(io, user._id.toString(), notification);

    res.status(200).json({
      success: true,
      message: 'Creator access request submitted successfully. Waiting for admin approval.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        editorRequestStatus: user.editorRequestStatus,
      }
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Downgrade user role to viewer
// @route   PUT /api/auth/downgrade
// @access  Private
// ─────────────────────────────────────────────
export const downgradeToViewer = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.role === 'admin' || user.role === 'viewer') {
      return res.status(200).json({
        success: true,
        message: 'User is already a viewer or admin',
        role: user.role
      });
    }

    user.role = 'viewer';
    await user.save();

    // Generate a new token since role is embedded in the token payload
    const token = generateToken(user._id, user.role);

    // Notify user of the switch
    const notification = await Notification.create({
      userId: user._id,
      title: 'Switched to Viewer Mode',
      message: 'You have successfully switched back to Viewer mode. You can request Creator access again anytime from Settings.',
      type: 'info',
    });
    const io = req.app.get('io');
    if (io) emitNotification(io, user._id.toString(), notification);

    res.status(200).json({
      success: true,
      message: 'Successfully switched to Viewer mode',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        tenantId: user.tenantId,
        createdAt: user.createdAt,
        editorRequestStatus: user.editorRequestStatus,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all public tenants for dropdown signup
// @route   GET /api/auth/tenants
// @access  Public
export const getPublicTenants = async (req, res, next) => {
  try {
    const tenants = await Tenant.find({ isActive: true }).select('name').sort({ name: 1 });
    res.status(200).json({
      success: true,
      tenants,
    });
  } catch (error) {
    next(error);
  }
};

