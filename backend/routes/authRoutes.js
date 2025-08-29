import express from 'express';
import authController from '../controllers/authController.js';
import { protect, authorize } from '../Middlewares/auth.js';

const router = express.Router();

// Public routes
router.post('/admin-login', authController.adminLogin);
router.post('/editor-login', authController.editorLogin);
router.post('/seed-admin', authController.seedAdmin);
router.post('/seed-editor', authController.seedEditor);
router.post('/seed-multiple-editors', authController.seedMultipleEditors);

// Protected route - use protect middleware instead of authMiddleware
router.get('/verify', protect, authController.verifyAdmin);

export default router;