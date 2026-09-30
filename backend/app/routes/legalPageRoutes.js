import express from 'express';
import { getPublicLegalPage, listLegalPages, upsertLegalPage } from '../controller/legalPageController.js';
import { verifyToken, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: fetch one panel/type's content (shown during login/signup)
router.get('/public', getPublicLegalPage);

// Admin only: list all panel/type combinations for management
router.get('/', verifyToken, allowRoles('admin'), listLegalPages);

// Admin only: create/update a panel/type's content
router.put('/', verifyToken, allowRoles('admin'), upsertLegalPage);

export default router;
