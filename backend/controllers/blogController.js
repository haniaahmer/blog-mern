import Blog from '../models/Blog.js';
import Admin from '../models/Admin.js';
import User from '../models/authModel.js';
import slugify from 'slugify';
import Comment from '../models/Comment.js';

export const createBlog = async (req, res) => {
  console.log('🔨 [createBlog] Entry');
  console.log('🔨 [createBlog] Request body:', req.body);
  console.log('🔨 [createBlog] Uploaded files:', req.files);
  console.log('🔨 [createBlog] User:', req.user);
  try {
    const { title, content, category, tags, excerpt, published } = req.body;

    if (!title || !content || !category) {
      console.warn('⚠️ [createBlog] Missing required fields:', { title, content, category });
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    // Allow admins, superadmins, and editors to create blogs
    if (!['admin', 'superadmin', 'editor'].includes(req.user.role)) {
      console.warn('⚠️ [createBlog] Unauthorized role:', req.user.role);
      return res.status(403).json({ error: 'Only admins and editors can create blogs' });
    }

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Blog.findOne({ slug })) {
      console.log(`🔄 [createBlog] Slug conflict, trying: ${slug}`);
      slug = `${baseSlug}-${counter++}`;
    }

    const images = req.files?.map(file => file.filename) || [];
    console.log('📸 [createBlog] Images:', images);

    const blog = await Blog.create({
      title: title.trim(),
      content,
      category: category.trim(),
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      excerpt: excerpt ? excerpt.trim() : '',
      published: published === 'true' || published === true,
      images,
      slug,
      author: {
        id: req.user.id,
        type: req.user.role === 'editor' ? 'User' : 'Admin',
      },
    });

    console.log('✅ [createBlog] Blog created:', blog._id);
    res.status(201).json(blog);
  } catch (err) {
    console.error('❌ [createBlog] Error:', err);
    res.status(500).json({ error: err.message });
  }
};

export const updateBlog = async (req, res) => {
  console.log('🔨 [updateBlog] Entry');
  console.log('🔨 [updateBlog] Blog ID:', req.params.id);
  console.log('🔨 [updateBlog] Request body:', req.body);
  console.log('🔨 [updateBlog] Uploaded files:', req.files);
  console.log('🔨 [updateBlog] User:', req.user);
  try {
    const { title, content, category, tags, excerpt, published } = req.body;
    const images = req.files?.map(file => file.filename);

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.warn('⚠️ [updateBlog] Blog not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is authorized (author or admin/superadmin)
    const isAuthor = (blog.author.type === 'Admin' || blog.author.type === 'User') &&
      blog.author.id.toString() === req.user.id;
    const isAdminOrSuperadmin = ['admin', 'superadmin'].includes(req.user.role);

    console.log('🔍 [updateBlog] isAuthor:', isAuthor, 'isAdminOrSuperadmin:', isAdminOrSuperadmin);

    if (!isAuthor && !isAdminOrSuperadmin) {
      console.warn('⚠️ [updateBlog] Not authorized:', req.user);
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    if (title && title !== blog.title) {
      let baseSlug = slugify(title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
        console.log(`🔄 [updateBlog] Slug conflict, trying: ${slug}`);
        slug = `${baseSlug}-${counter++}`;
      }
      blog.title = title.trim();
      blog.slug = slug;
    }
    if (content) blog.content = content;
    if (category) blog.category = category.trim();
    if (tags) blog.tags = tags.split(',').map(tag => tag.trim());
    if (excerpt) blog.excerpt = excerpt.trim();
    if (published !== undefined) blog.published = published === 'true' || published === true;
    if (images?.length) blog.images = images;

    await blog.save();
    console.log('✅ [updateBlog] Blog updated:', blog._id);
    res.json(blog);
  } catch (error) {
    console.error('❌ [updateBlog] Error:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
};

export const deleteBlog = async (req, res) => {
  console.log('🔨 [deleteBlog] Entry');
  console.log('🔨 [deleteBlog] Blog ID:', req.params.id);
  console.log('🔨 [deleteBlog] User:', req.user);
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.warn('⚠️ [deleteBlog] Blog not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is authorized (author or admin/superadmin)
    const isAuthor = (blog.author.type === 'Admin' || blog.author.type === 'User') &&
      blog.author.id.toString() === req.user.id;
    const isAdminOrSuperadmin = ['admin', 'superadmin'].includes(req.user.role);

    console.log('🔍 [deleteBlog] isAuthor:', isAuthor, 'isAdminOrSuperadmin:', isAdminOrSuperadmin);

    if (!isAuthor && !isAdminOrSuperadmin) {
      console.warn('⚠️ [deleteBlog] Not authorized:', req.user);
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    await Blog.findByIdAndDelete(req.params.id);
    console.log('✅ [deleteBlog] Blog deleted:', req.params.id);
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('❌ [deleteBlog] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getBlogs = async (req, res) => {
  console.log('🔨 [getBlogs] Entry');
  console.log('🔨 [getBlogs] Query params:', req.query);
  console.log('🔨 [getBlogs] Headers:', req.headers);
  
  try {
    const { 
      published = 'true', 
      limit = 50, 
      page = 1, 
      category, 
      search,
      includeUnpublished = 'false' 
    } = req.query;

    // Build query
    let query = {};
    
    // For admin requests, they might want to see unpublished posts too
    if (includeUnpublished === 'false') {
      query.published = published === 'true';
    }
    
    if (category && category !== 'all') {
      query.category = { $regex: category, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('🔍 [getBlogs] Final query:', JSON.stringify(query, null, 2));

    const skip = (page - 1) * parseInt(limit);
    
    const blogs = await Blog.find(query)
      .populate({
        path: 'author.id',
        select: 'username email'
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Blog.countDocuments(query);

    console.log(`✅ [getBlogs] Found ${blogs.length} blogs (${total} total)`);

    // Log each blog for debugging
    blogs.forEach((blog, index) => {
      console.log(`📖 [getBlogs] Blog ${index + 1}:`, {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        category: blog.category,
        published: blog.published,
        views: blog.views || 0,
        createdAt: blog.createdAt
      });
    });

    res.json({
      blogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ [getBlogs] Error:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find blog and increment views in one go
    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },   // increment views by 1
      { new: true }             // return updated doc
    );

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (error) {
    console.error("❌ [getBlogBySlug] Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getBlogById = async (req, res) => {
  console.log('🔨 [getBlogById] Entry');
  console.log('🔨 [getBlogById] Request params:', req.params);
  
  try {
    const { id } = req.params;
    
    if (!id) {
      console.warn('⚠️ [getBlogById] No ID provided');
      return res.status(400).json({ error: 'Blog ID is required' });
    }

    console.log('🔍 [getBlogById] Looking for blog with ID:', id);
    
    const blog = await Blog.findById(id)
      .populate({
        path: 'author.id',
        select: 'username email'
      });
      
    if (!blog) {
      console.warn('⚠️ [getBlogById] Blog not found for ID:', id);
      return res.status(404).json({ error: 'Blog not found' });
    }

    if (!blog.published) {
      console.warn('⚠️ [getBlogById] Blog not published for ID:', id);
      return res.status(404).json({ error: 'Blog not found or not published' });
    }

    console.log('✅ [getBlogById] Blog found:', {
      id: blog._id,
      title: blog.title,
      published: blog.published,
      views: blog.views
    });

    // Increment view count
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    
    res.json(blog);
  } catch (error) {
    console.error('❌ [getBlogById] Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: 'Invalid blog ID format',
        provided: req.params.id
      });
    }
    
    res.status(500).json({ error: 'Failed to fetch blog' });
  }
};

export const likeBlog = async (req, res) => {
  console.log('🔨 [likeBlog] Entry');
  console.log('🔨 [likeBlog] Blog ID:', req.params.id);
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || !blog.published) {
      console.warn('⚠️ [likeBlog] Blog not found or not published for ID:', req.params.id);
      return res.status(404).json({ message: 'Blog not found or not published' });
    }

    blog.likes = (blog.likes || 0) + 1;
    await blog.save();
    console.log('✅ [likeBlog] Blog liked:', blog._id, 'Total likes:', blog.likes);
    res.json({ likes: blog.likes });
  } catch (error) {
    console.error('❌ [likeBlog] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Legacy comment methods - keeping for backward compatibility
export const createComment = async (req, res) => {
  console.log('🔨 [createComment] Legacy method called, redirecting...');
  // Redirect to the new comment controller
  const commentController = await import('./commentController.js');
  return commentController.createComment(req, res);
};

export const getComments = async (req, res) => {
  console.log('🔨 [getComments] Legacy method called, redirecting...');
  // Redirect to the new comment controller
  const commentController = await import('./commentController.js');
  return commentController.getCommentsByBlog(req, res);
};

const blogController = {
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogs,
  getBlogBySlug,
  getBlogById,
  likeBlog,
  createComment,
  getComments
};

export default blogController;