import User from '../models/User.js';
import Video from '../models/Video.js';
import Tenant from '../models/Tenant.js';
import Notification from '../models/Notification.js';
import { emitNotification } from '../sockets/socketHandler.js';

// @desc    Get all pending editor requests
// @route   GET /api/admin/editor-requests
// @access  Private/Admin
export const getPendingEditorRequests = async (req, res, next) => {
  try {
    const requests = await User.find({ editorRequestStatus: 'pending' })
      .select('-password')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve an editor request
// @route   PUT /api/admin/editor-requests/:id/approve
// @access  Private/Admin
export const approveEditorRequest = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.editorRequestStatus !== 'pending') {
      res.status(400);
      return next(new Error('This user does not have a pending request'));
    }

    user.role = 'editor';
    user.editorRequestStatus = 'none';
    await user.save();

    // Create a persistent notification in DB
    const notification = await Notification.create({
      userId: user._id,
      title: 'Creator Access Granted!',
      message: 'Your request to switch from Viewer to Creator/Editor has been approved by the admin. You can now upload and manage videos!',
      type: 'success',
    });

    // Emit real-time socket notification
    const io = req.app.get('io');
    if (io) {
      emitNotification(io, user._id.toString(), notification);
    }

    res.status(200).json({
      success: true,
      message: 'Editor request approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject an editor request
// @route   PUT /api/admin/editor-requests/:id/reject
// @access  Private/Admin
export const rejectEditorRequest = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    if (user.editorRequestStatus !== 'pending') {
      res.status(400);
      return next(new Error('This user does not have a pending request'));
    }

    user.editorRequestStatus = 'rejected';
    await user.save();

    // Create a persistent notification in DB
    const notification = await Notification.create({
      userId: user._id,
      title: 'Creator Request Not Approved',
      message: 'Your request to switch to Creator/Editor mode was not approved by the admin at this time. Please contact support for more information.',
      type: 'warning',
    });

    // Emit real-time socket notification
    const io = req.app.get('io');
    if (io) {
      emitNotification(io, user._id.toString(), notification);
    }

    res.status(200).json({
      success: true,
      message: 'Editor request rejected',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users in the system
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('-password')
      .populate('tenantId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a user's role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role || !['viewer', 'editor', 'admin'].includes(role.toLowerCase())) {
      res.status(400);
      return next(new Error('Invalid role specified'));
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.role = role.toLowerCase();
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated successfully to ${role}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user suspension status
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
export const toggleUserSuspension = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status changed to ${user.isActive ? 'Active' : 'Suspended'}`,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully from system',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system live statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res, next) => {
  try {
    // Proactive Migration: Fix any videos with legacy userId instead of uploadedBy
    // Use updateOne to avoid Mongoose validation errors on stale/corrupt documents
    const legacyVideos = await Video.find({ uploadedBy: { $exists: false }, userId: { $exists: true } });
    if (legacyVideos.length > 0) {
      console.log(`Migrating ${legacyVideos.length} legacy videos with userId to uploadedBy...`);
      for (const v of legacyVideos) {
        await Video.updateOne({ _id: v._id }, { $set: { uploadedBy: v.get('userId') } });
      }
    }

    // Proactive Migration: Sync tenantId from uploader if missing on video
    const noTenantVideos = await Video.find({ tenantId: null }).populate('uploadedBy');
    for (const v of noTenantVideos) {
      if (v.uploadedBy && v.uploadedBy.tenantId) {
        await Video.updateOne({ _id: v._id }, { $set: { tenantId: v.uploadedBy.tenantId } });
      }
    }

    const totalUsers = await User.countDocuments({});
    const totalVideos = await Video.countDocuments({});
    const flaggedVideos = await Video.countDocuments({ sensitivity: 'flagged' });
    const safeVideos = await Video.countDocuments({ sensitivity: 'safe' });
    const pendingVideos = await Video.countDocuments({ status: { $in: ['uploading', 'processing'] } });
    const tenantsCount = await Tenant.countDocuments({});

    // Calculate total storage footprint
    const sizeAggregate = await Video.aggregate([
      { $group: { _id: null, totalSize: { $sum: '$size' } } }
    ]);
    const totalStorageBytes = sizeAggregate[0]?.totalSize || 0;

    // Fetch recent uploads (last 5)
    const recentVideos = await Video.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('uploadedBy', 'name email');

    // Fetch moderation pressure queue (flagged)
    const moderationQueue = await Video.find({ sensitivity: 'flagged' })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('uploadedBy', 'name');

    // Fetch tenant list with details
    const tenantsList = await Tenant.find({}).limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVideos,
        flaggedVideos,
        safeVideos,
        pendingVideos,
        tenantsCount,
        totalStorageBytes,
      },
      recentVideos,
      moderationQueue,
      tenantsList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new user by Admin
// @route   POST /api/admin/users
// @access  Private/Admin
export const createUserByAdmin = async (req, res, next) => {
  try {
    const { name, email, role, tenant } = req.body;

    if (!name || !email) {
      res.status(400);
      return next(new Error('Please provide user name and email'));
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(409);
      return next(new Error('A user with this email already exists'));
    }

    // Resolve tenantId if tenant organization name is provided
    let resolvedTenantId = null;
    if (tenant && tenant.trim()) {
      const trimmedTenant = tenant.trim();
      let dbTenant = await Tenant.findOne({ name: { $regex: new RegExp(`^${trimmedTenant}$`, 'i') } });
      if (!dbTenant) {
        // Create new tenant
        const slug = trimmedTenant
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        dbTenant = await Tenant.create({
          name: trimmedTenant,
          slug: slug || `tenant-${Date.now()}`
        });
      }
      resolvedTenantId = dbTenant._id;
    }

    const cleanRole = typeof role === 'string' ? role.trim().toLowerCase() : 'viewer';
    const assignedRole = ['admin', 'editor', 'viewer'].includes(cleanRole) ? cleanRole : 'viewer';

    // Set a secure default password for admin-created users
    const defaultPassword = 'VaultStream123!';

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: defaultPassword,
      role: assignedRole,
      tenantId: resolvedTenantId,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully by administrator',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tenants with user counts
// @route   GET /api/admin/tenants
// @access  Private/Admin
export const getAllTenants = async (req, res, next) => {
  try {
    const dbTenants = await Tenant.find({}).sort({ name: 1 });

    const tenantsWithUsers = await Promise.all(
      dbTenants.map(async (t) => {
        const userCount = await User.countDocuments({ tenantId: t._id });
        return {
          _id: t._id,
          id: t._id.toString(), // Support both formats in frontend
          name: t.name,
          slug: t.slug,
          users: userCount,
          plan: 'Enterprise',
          health: 'Healthy',
          createdAt: t.createdAt,
        };
      })
    );

    res.status(200).json({
      success: true,
      tenants: tenantsWithUsers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new tenant
// @route   POST /api/admin/tenants
// @access  Private/Admin
export const createTenant = async (req, res, next) => {
  try {
    const { name, plan } = req.body;

    if (!name || !name.trim()) {
      res.status(400);
      return next(new Error('Tenant name is required'));
    }

    const trimmedName = name.trim();
    const existingTenant = await Tenant.findOne({ name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (existingTenant) {
      res.status(409);
      return next(new Error('A tenant with this name already exists'));
    }

    const slug = trimmedName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const tenant = await Tenant.create({
      name: trimmedName,
      slug: slug || `tenant-${Date.now()}`
    });

    res.status(201).json({
      success: true,
      message: 'Tenant organization provisioned successfully',
      tenant: {
        _id: tenant._id,
        id: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        users: 0,
        plan: plan || 'Starter',
        health: 'Healthy',
        createdAt: tenant.createdAt,
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a tenant
// @route   DELETE /api/admin/tenants/:id
// @access  Private/Admin
export const deleteTenant = async (req, res, next) => {
  try {
    const tenantId = req.params.id;
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      res.status(404);
      return next(new Error('Tenant organization not found'));
    }

    // Check if tenant has any active users
    const userCount = await User.countDocuments({ tenantId });
    if (userCount > 0) {
      res.status(400);
      return next(new Error(`Cannot delete tenant "${tenant.name}" because it has ${userCount} active users.`));
    }

    await tenant.deleteOne();

    res.status(200).json({
      success: true,
      message: `Tenant "${tenant.name}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};


