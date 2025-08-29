import express from 'express';
import { protect, authorize } from '../Middlewares/auth.js';
import commentController from '../controllers/commentController.js';

const router = express.Router();

// Debug middleware for all comment routes
router.use((req, res, next) => {
  console.log(`💬 [CommentRoutes] ${req.method} ${req.path}`);
  console.log(`💬 [CommentRoutes] Query:`, req.query);
  console.log(`💬 [CommentRoutes] Params:`, req.params);
  console.log(`💬 [CommentRoutes] Body keys:`, Object.keys(req.body || {}));
  next();
});

// Public routes
router.post('/', commentController.createComment);  // Create comment
router.get('/blog/:blogId', commentController.getCommentsByBlog);  // Get comments by blog

// Admin routes - require authentication
router.get('/', protect, authorize('admin', 'superadmin'), commentController.getAllComments);  // Get all comments (admin only)
router.put('/:id', protect, authorize('admin', 'superadmin'), commentController.updateComment);  // Update comment
router.delete('/:id', protect, authorize('admin', 'superadmin'), commentController.deleteComment);  // Delete comment

// Routes for comment moderation
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    console.log(`✅ [CommentRoutes] Approving comment: ${req.params.id}`);
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.approved = true;
    await comment.save();
    
    console.log(`✅ [CommentRoutes] Comment approved:`, comment._id);
    res.json(comment);
  } catch (error) {
    console.error(`❌ [CommentRoutes] Error approving comment:`, error);
    res.status(500).json({ error: 'Failed to approve comment' });
  }
});

router.put('/:id/reject', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    console.log(`❌ [CommentRoutes] Rejecting comment: ${req.params.id}`);
    
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.approved = false;
    await comment.save();
    
    console.log(`❌ [CommentRoutes] Comment rejected:`, comment._id);
    res.json(comment);
  } catch (error) {
    console.error(`❌ [CommentRoutes] Error rejecting comment:`, error);
    res.status(500).json({ error: 'Failed to reject comment' });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error(`❌ [CommentRoutes] Route error on ${req.method} ${req.path}:`, {
    message: error.message,
    stack: error.stack
  });
  
  if (error.name === 'CastError') {
    return res.status(400).json({ 
      error: 'Invalid ID format', 
      path: req.path,
      provided: req.params
    });
  }
  
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    path: req.path
  });
});

export default router;