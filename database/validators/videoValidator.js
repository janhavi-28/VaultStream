import { check } from 'express-validator';

export const validateVideoMetadata = [
  check('title', 'Title is required').not().isEmpty().isLength({ max: 100 }),
  check('description', 'Description max length is 500').optional().isLength({ max: 500 })
];
