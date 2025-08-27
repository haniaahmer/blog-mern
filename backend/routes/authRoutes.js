import express from 'express';
import { 
 adminLogin, 
  editorLogin, 
  verifyAdmin, 
  seedAdmin, 
  seedEditor,
  seedMultipleEditors
} from '../controllers/authController.js';

const router = express.Router();

router.post('/admin-login', adminLogin);
router.post('/editor-login', editorLogin);
router.get('/verify-admin', verifyAdmin);
router.post('/seed-admin', seedAdmin);
router.post('/seed-editor', seedEditor);
router.post('/seed-multiple-editors', seedMultipleEditors);

export default router;