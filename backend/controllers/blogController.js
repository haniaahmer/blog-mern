import Blog from '../models/Blog.js';
import Admin from '../models/Admin.js';
import User from '../models/authModel.js';
import slugify from 'slugify';
import Comment from '../models/Comment.js'

export const createBlog = async (req, res) => {
  console.log('🔔 [createBlog] Request body:', req.body);
  console.log('🔔 [createBlog] Uploaded files:', req.files);
  console.log('🔔 [createBlog] User:', req.user);
  try {
    const { title, content, category, tags, excerpt, published } = req.body;

    if (!title || !content || !category) {
      console.warn('⚠️ [createBlog] Missing required fields:', { title, content, category });
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }

    // Ensure user is an admin or superadmin
    console.log('🔍 [createBlog] User role:', req.user.role);
    if (!['admin', 'superadmin'].includes(req.user.role)) {
      console.warn('⚠️ [createBlog] Unauthorized role:', req.user.role);
      return res.status(403).json({ error: 'Only admins can create blogs' });
    }

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Blog.findOne({ slug })) {
      console.log(`🔄 [createBlog] Slug conflict, trying: ${slug}`);
      slug = `${baseSlug}-${counter++}`;
    }

    const images = req.files?.map(file => file.filename) || [];
    console.log('🔍 [createBlog] Images:', images);

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
        type: 'Admin',
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
  console.log('🔔 [updateBlog] Blog ID:', req.params.id);
  console.log('🔔 [updateBlog] Request body:', req.body);
  console.log('🔔 [updateBlog] Uploaded files:', req.files);
  console.log('🔔 [updateBlog] User:', req.user);
  try {
    const { title, content, category, tags, excerpt, published } = req.body;
    const images = req.files?.map(file => file.filename);

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.warn('⚠️ [updateBlog] Blog not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is authorized (author or admin/superadmin)
    const isAuthor = blog.author.type === 'Admin' && blog.author.id.toString() === req.user.id;
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
  console.log('🔔 [deleteBlog] Blog ID:', req.params.id);
  console.log('🔔 [deleteBlog] User:', req.user);
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.warn('⚠️ [deleteBlog] Blog not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Check if user is authorized (author or admin/superadmin)
    const isAuthor = blog.author.type === 'Admin' && blog.author.id.toString() === req.user.id;
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
  console.log('🔔 [getBlogs] Query params:', req.query);
  try {
    const { page = 1, limit = 10, category, tag } = req.query;
    const query = { published: true };

    if (category) query.category = category;
    if (tag) query.tags = tag;

    console.log('🔍 [getBlogs] Query:', query);

    const blogs = await Blog.find(query)
      .populate({
        path: 'author.id',
        select: 'email username name',
        model: function (doc) {
          return Admin;
        },
      })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Blog.countDocuments(query);
    console.log(`✅ [getBlogs] Returned ${blogs.length} blogs`);
    res.json({
      blogs,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('❌ [getBlogs] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  console.log('🔔 [getBlogBySlug] Slug:', req.params.slug);
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true })
      .populate({
        path: 'author.id',
        select: 'email username name',
        model: function (doc) {
          return Admin;
        },
      });
    if (!blog) {
      console.warn('⚠️ [getBlogBySlug] Blog not found for slug:', req.params.slug);
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.views += 1;
    await blog.save();
    console.log('✅ [getBlogBySlug] Blog found:', blog._id);
    res.json(blog);
  } catch (error) {
    console.error('❌ [getBlogBySlug] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const likeBlog = async (req, res) => {
  console.log('🔔 [likeBlog] Blog ID:', req.params.id);
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog || !blog.published) {
      console.warn('⚠️ [likeBlog] Blog not found or not published for ID:', req.params.id);
      return res.status(404).json({ message: 'Blog not found or not published' });
    }

    blog.likes += 1;
    await blog.save();
    console.log('✅ [likeBlog] Blog liked:', blog._id, 'Total likes:', blog.likes);
    res.json({ likes: blog.likes });
  } catch (error) {
    console.error('❌ [likeBlog] Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const createComment = async (req, res) => {
  console.log('🔔 [createComment] Request body:', req.body);
  try {
    const { blogId, content, name, email } = req.body;

    if (!blogId || !content || !name) {
      console.warn('⚠️ [createComment] Missing required fields:', { blogId, content, name });
      return res.status(400).json({ error: 'Blog ID, content, and name are required' });
    }

    const blog = await Blog.findById(blogId);
    if (!blog || !blog.published) {
      console.warn('⚠️ [createComment] Blog not found or not published for ID:', blogId);
      return res.status(404).json({ error: 'Blog not found or not published' });
    }

    const comment = await Comment.create({
      blogId,
      content: content.trim(),
      author: { name: name.trim(), email: email?.trim() },
    });

    console.log('✅ [createComment] Comment created:', comment._id);
    res.status(201).json(comment);
  } catch (error) {
    console.error('❌ [createComment] Error:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const getComments = async (req, res) => {
  console.log('🔔 [getComments] Blog ID:', req.params.blogId);
  try {
    const comments = await Comment.find({ blogId: req.params.blogId })
      .sort({ createdAt: -1 });
    console.log('✅ [getComments] Returned comments:', comments.length);
    res.json(comments);
  } catch (error) {
    console.error('❌ [getComments] Error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};