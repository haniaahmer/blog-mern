import express from "express";
import { uploadSingle, uploadMultiple } from "../controllers/uploadController.js";
import { protect, authorize } from "../Middlewares/auth.js";
import blogController from '../controllers/blogController.js';
import commentController from '../controllers/commentController.js';

const router = express.Router();

// Debug middleware for all blog routes
router.use((req, res, next) => {
  console.log(`🚀 [BlogRoutes] ${req.method} ${req.path}`);
  console.log(`🚀 [BlogRoutes] Query:`, req.query);
  console.log(`🚀 [BlogRoutes] Params:`, req.params);
  console.log(`🚀 [BlogRoutes] Body keys:`, Object.keys(req.body || {}));
  next();
});

// Public routes - no authentication required
router.get('/get', blogController.getBlogs);  // Get all blogs
router.get('/:slug', (req, res, next) => {
  console.log(`🔍 [BlogRoutes] Slug route hit with slug: "${req.params.slug}"`);
  blogController.getBlogBySlug(req, res, next);
});
router.get('/by-id/:id', blogController.getBlogById);  // Get blog by ID
router.post('/like/:id', blogController.likeBlog);  // Like a blog

// Comment routes - public
router.get('/comments/:blogId', (req, res, next) => {
  console.log(`🗨️ [BlogRoutes] Comments route hit for blog ID: "${req.params.blogId}"`);
  commentController.getCommentsByBlog(req, res, next);
});

router.post('/comment', (req, res, next) => {
  console.log(`🗨️ [BlogRoutes] Create comment route hit`);
  console.log(`🗨️ [BlogRoutes] Comment data:`, req.body);
  commentController.createComment(req, res, next);
});

// Protected routes - require authentication
router.post('/create', 
  protect, 
  authorize('admin', 'superadmin', 'editor'), 
  uploadMultiple, 
  blogController.createBlog
);

router.put('/update/:id', 
  protect, 
  authorize('admin', 'superadmin', 'editor'), 
  uploadMultiple, 
  blogController.updateBlog
);

router.delete('/delete/:id', 
  protect, 
  authorize('admin', 'superadmin', 'editor'), 
  blogController.deleteBlog
);

// Route to toggle publish status
router.put('/update/:id/toggle-publish', 
  protect, 
  authorize('admin', 'superadmin', 'editor'), 
  async (req, res) => {
    try {
      console.log(`🔄 [BlogRoutes] Toggle publish for blog ID: ${req.params.id}`);
      console.log(`🔄 [BlogRoutes] New status:`, req.body.published);
      
      const blog = await Blog.findById(req.params.id);
      if (!blog) {
        return res.status(404).json({ error: 'Blog not found' });
      }

      blog.published = req.body.published;
      await blog.save();
      
      console.log(`✅ [BlogRoutes] Blog publish status updated:`, {
        id: blog._id,
        published: blog.published
      });
      
      res.json(blog);
    } catch (error) {
      console.error(`❌ [BlogRoutes] Error toggling publish status:`, error);
      res.status(500).json({ error: 'Failed to update publish status' });
    }
  }
);

// Error handling middleware
router.use((error, req, res, next) => {
  console.error(`❌ [BlogRoutes] Route error on ${req.method} ${req.path}:`, {
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