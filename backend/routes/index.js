import express from 'express';
import authRoutes from './authRoutes.js';
import blogRoutes from './blogRoutes.js';
import commentRoutes from './commentRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/blogs', blogRoutes);
router.use('/comments', commentRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'Blog CMS API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      blogs: '/api/blogs',
      comments: '/api/comments',
      upload: '/api/upload',
      admin: '/api/admin',
    },
  });
});

router.use('*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl,
  });
});

export default router;