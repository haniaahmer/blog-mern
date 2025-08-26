// Backend: server/controllers/blogController.js
import Blog from "../models/Blog.js";
import slugify from "slugify";

// ✅ Create Blog
export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? req.file.filename : null;

    // Save to DB (example)
    const blog = await Blog.create({ title, content, image });

    res.status(201).json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ Update Blog
export const updateBlog = async (req, res) => {
  console.log("🔔 [updateBlog] Blog ID:", req.params.id);
  console.log("🔔 [updateBlog] Request body:", req.body);
  console.log("🔔 [updateBlog] Uploaded files:", req.files);
  try {
    const { title, content, category, tags, excerpt, published } = req.body;
    const images = req.files?.map(file => file.filename);

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.warn("⚠️ [updateBlog] Blog not found");
      return res.status(404).json({ message: "Blog not found" });
    }

    // Authorization check
    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this blog" });
    }

    // Update fields
    if (title && title !== blog.title) {
      let baseSlug = slugify(title, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      while (await Blog.findOne({ slug, _id: { $ne: blog._id } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      blog.title = title.trim();
      blog.slug = slug;
    }
    if (content) blog.content = content;
    if (category) blog.category = category.trim();
    if (tags) blog.tags = tags.split(",").map(tag => tag.trim());
    if (excerpt) blog.excerpt = excerpt.trim();
    if (published !== undefined) blog.published = published === "true" || published === true;
    if (images?.length) blog.images = images;

    await blog.save();
    console.log("✅ [updateBlog] Blog updated:", blog._id);
    res.json(blog);
  } catch (error) {
    console.error("❌ [updateBlog] Error:", error);
    res.status(500).json({ error: "Failed to update blog post" });
  }
};

// Other functions (getBlogs, getBlogBySlug, deleteBlog, likeBlog) remain unchanged
export const getBlogs = async (req, res) => {
  console.log("🔔 [getBlogs] Query params:", req.query);
  try {
    const { page = 1, limit = 10, category, tag } = req.query;
    const query = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;

    const blogs = await Blog.find(query)
      .populate('author', 'email')
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
    console.error("❌ [getBlogs] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  console.log("🔔 [getBlogBySlug] Slug:", req.params.slug);
  try {
    const blog = await Blog.findOne({ slug: req.params.slug }).populate('author', 'email');
    if (!blog) {
      console.warn("⚠️ [getBlogBySlug] Blog not found");
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.views += 1;
    await blog.save();
    console.log("✅ [getBlogBySlug] Blog found:", blog._id);
    res.json(blog);
  } catch (error) {
    console.error("❌ [getBlogBySlug] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  console.log("🔔 [deleteBlog] Blog ID:", req.params.id);
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.warn("⚠️ [deleteBlog] Blog not found");
      return res.status(404).json({ message: "Blog not found" });
    }

    if (blog.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    console.log("✅ [deleteBlog] Blog deleted:", req.params.id);
    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("❌ [deleteBlog] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const likeBlog = async (req, res) => {
  console.log("🔔 [likeBlog] Blog ID:", req.params.id);
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      console.warn("⚠️ [likeBlog] Blog not found");
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.likes += 1;
    await blog.save();
    console.log("✅ [likeBlog] Blog liked:", blog._id, "Total likes:", blog.likes);
    res.json({ likes: blog.likes });
  } catch (error) {
    console.error("❌ [likeBlog] Error:", error);
    res.status(500).json({ error: error.message });
  }
};