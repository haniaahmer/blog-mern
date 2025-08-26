import express from 'express';
import { adminLogin, editorLogin } from '../controllers/authController.js';

const router = express.Router();

router.post('/admin-login', adminLogin);
router.post('/editor-login', editorLogin);

export default router;