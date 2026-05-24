import { check } from 'express-validator';
import { ROLES } from '../constants/roles.js';

export const validateRoleUpdate = [
  check('role', 'Invalid role').isIn(Object.values(ROLES))
];
