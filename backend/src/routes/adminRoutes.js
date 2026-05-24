import express from 'express';
import {
  getPendingEditorRequests,
  approveEditorRequest,
  rejectEditorRequest,
  getAllUsers,
  updateUserRole,
  toggleUserSuspension,
  deleteUserByAdmin,
  getAdminStats,
  createUserByAdmin,
  getAllTenants,
  createTenant,
  deleteTenant,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes must be protected and restricted to 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.post('/users', createUserByAdmin);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/suspend', toggleUserSuspension);
router.delete('/users/:id', deleteUserByAdmin);
router.get('/editor-requests', getPendingEditorRequests);
router.put('/editor-requests/:id/approve', approveEditorRequest);
router.put('/editor-requests/:id/reject', rejectEditorRequest);
router.get('/tenants', getAllTenants);
router.post('/tenants', createTenant);
router.delete('/tenants/:id', deleteTenant);

export default router;
