/**
 * Tenant Middleware — VaultStream
 *
 * Attaches the current user's tenantId to every request as req.tenantId.
 * This allows all downstream controllers to filter queries by tenant
 * without repeating the logic.
 *
 * USAGE: Apply AFTER the `protect` middleware, since it relies on req.user.
 * Example: router.get('/', protect, resolveTenant, getVideos);
 */
export const resolveTenant = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    return next(new Error('Not authorized — no user on request'));
  }

  // Attach tenantId from the authenticated user to the request object
  req.tenantId = req.user.tenantId || null;

  next();
};

/**
 * Build a safe MongoDB filter object that includes tenantId scoping.
 *
 * - If user has a tenantId, restrict to their tenant only.
 * - If user has NO tenantId (e.g. super-admin or standalone user),
 *   only return their own videos (scoped by uploadedBy).
 *
 * @param {Object} req - Express request object (must have req.user + req.tenantId)
 * @param {Object} extraFilters - Additional MongoDB filter fields to merge in
 * @returns {Object} MongoDB query filter
 */
export const buildTenantFilter = (req, extraFilters = {}) => {
  const filter = { ...extraFilters };

  if (req.user && req.user.role === 'editor') {
    // Editor role strictly only sees/manages their own uploaded videos
    filter.uploadedBy = req.user._id;
  } else if (req.tenantId) {
    // Multi-tenant: only show videos from the same organisation
    filter.tenantId = req.tenantId;
  } else if (req.user && req.user.role === 'viewer') {
    // Viewer role: in standalone/null-tenant mode, see all global/tenantless videos
    filter.tenantId = null;
  } else {
    // Single user (no tenant): only show their own uploads
    filter.uploadedBy = req.user._id;
  }

  return filter;
};
