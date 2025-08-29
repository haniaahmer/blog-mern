import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";

export const createComment = async (req, res) => {
  console.log("📝 [createComment] Entry");
  console.log("📝 [createComment] Request body:", req.body);
  console.log("📝 [createComment] Request headers:", req.headers);
  console.log("📝 [createComment] Request IP:", req.ip);
  
  try {
    const { blogId, content, name, email } = req.body;

    // Validation
    if (!blogId) {
      console.warn("⚠️ [createComment] Missing blogId");
      return res.status(400).json({ 
        error: "Blog ID is required",
        received: { blogId, content: !!content, name: !!name, email: !!email }
      });
    }

    if (!content || !content.trim()) {
      console.warn("⚠️ [createComment] Missing or empty content");
      return res.status(400).json({ 
        error: "Comment content is required",
        received: { blogId, content: content || "undefined", name: !!name, email: !!email }
      });
    }

    if (!name || !name.trim()) {
      console.warn("⚠️ [createComment] Missing or empty name");
      return res.status(400).json({ 
        error: "Author name is required",
        received: { blogId, content: !!content, name: name || "undefined", email: !!email }
      });
    }

    // Verify the blog exists and is published
    console.log("🔍 [createComment] Looking for blog with ID:", blogId);
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      console.warn("⚠️ [createComment] Blog not found for ID:", blogId);
      return res.status(404).json({ 
        error: "Blog not found",
        blogId 
      });
    }

    if (!blog.published) {
      console.warn("⚠️ [createComment] Blog not published:", blogId);
      return res.status(404).json({ 
        error: "Blog not found or not published",
        blogId 
      });
    }

    console.log("✅ [createComment] Blog found:", {
      id: blog._id,
      title: blog.title,
      published: blog.published
    });

    // Create the comment
    const commentData = {
      blogId,
      content: content.trim(),
      author: {
        name: name.trim(),
        email: email ? email.trim() : undefined
      }
    };

    console.log("📝 [createComment] Creating comment with data:", commentData);

    const comment = await Comment.create(commentData);

    console.log("✅ [createComment] Comment created successfully:", {
      id: comment._id,
      blogId: comment.blogId,
      authorName: comment.author.name,
      contentLength: comment.content.length
    });

    // Populate the response with additional info if needed
    const populatedComment = await Comment.findById(comment._id);
    
    res.status(201).json(populatedComment);
    
  } catch (error) {
    console.error("❌ [createComment] Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Handle specific mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationErrors 
      });
    }
    
    // Handle mongoose CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: "Invalid blog ID format",
        provided: req.body.blogId
      });
    }

    res.status(500).json({ 
      error: "Failed to create comment", 
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getCommentsByBlog = async (req, res) => {
  console.log("📝 [getCommentsByBlog] Entry");
  console.log("📝 [getCommentsByBlog] Blog ID:", req.params.blogId);
  console.log("📝 [getCommentsByBlog] Query params:", req.query);
  
  try {
    const { blogId } = req.params;
    const { limit = 50, page = 1, approved } = req.query;

    // Validate blogId
    if (!blogId) {
      console.warn("⚠️ [getCommentsByBlog] Missing blogId parameter");
      return res.status(400).json({ error: "Blog ID is required" });
    }

    // Verify the blog exists
    console.log("🔍 [getCommentsByBlog] Verifying blog exists:", blogId);
    const blog = await Blog.findById(blogId);
    
    if (!blog) {
      console.warn("⚠️ [getCommentsByBlog] Blog not found:", blogId);
      return res.status(404).json({ error: "Blog not found" });
    }

    console.log("✅ [getCommentsByBlog] Blog found:", {
      id: blog._id,
      title: blog.title
    });

    // Build query
    let query = { blogId };
    
    // Filter by approval status if specified
    if (approved !== undefined) {
      query.approved = approved === 'true';
      console.log("🔍 [getCommentsByBlog] Filtering by approved:", query.approved);
    }

    console.log("🔍 [getCommentsByBlog] Query:", query);
    console.log("🔍 [getCommentsByBlog] Options:", { limit, page });

    // Get comments with pagination
    const skip = (page - 1) * limit;
    const comments = await Comment.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count for pagination
    const total = await Comment.countDocuments(query);

    console.log(`✅ [getCommentsByBlog] Found ${comments.length} comments (${total} total)`);

    // Log each comment for debugging
    comments.forEach(comment => {
      console.log("📝 [getCommentsByBlog] Comment:", {
        id: comment._id,
        authorName: comment.author?.name || comment.authorName,
        contentPreview: comment.content.substring(0, 50) + (comment.content.length > 50 ? '...' : ''),
        createdAt: comment.createdAt,
        approved: comment.approved
      });
    });

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("❌ [getCommentsByBlog] Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Handle mongoose CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        error: "Invalid blog ID format",
        provided: req.params.blogId
      });
    }

    res.status(500).json({ 
      error: "Failed to fetch comments",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getAllComments = async (req, res) => {
  console.log("📝 [getAllComments] Entry");
  console.log("📝 [getAllComments] Query params:", req.query);
  console.log("📝 [getAllComments] User:", req.user);
  
  try {
    const { limit = 50, page = 1, approved, blogId } = req.query;

    // Build query
    let query = {};
    
    if (approved !== undefined) {
      query.approved = approved === 'true';
    }
    
    if (blogId) {
      query.blogId = blogId;
    }

    console.log("🔍 [getAllComments] Query:", query);

    const skip = (page - 1) * limit;
    const comments = await Comment.find(query)
      .populate('blogId', 'title slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Comment.countDocuments(query);

    console.log(`✅ [getAllComments] Found ${comments.length} comments (${total} total)`);

    res.json({
      comments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("❌ [getAllComments] Error:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({ 
      error: "Failed to fetch comments",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const updateComment = async (req, res) => {
  console.log("📝 [updateComment] Entry");
  console.log("📝 [updateComment] Comment ID:", req.params.id);
  console.log("📝 [updateComment] Request body:", req.body);
  
  try {
    const { id } = req.params;
    const { approved, content } = req.body;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      console.warn("⚠️ [updateComment] Comment not found:", id);
      return res.status(404).json({ error: "Comment not found" });
    }

    if (approved !== undefined) {
      comment.approved = approved;
    }
    
    if (content && content.trim()) {
      comment.content = content.trim();
    }

    await comment.save();
    
    console.log("✅ [updateComment] Comment updated:", comment._id);
    
    const updatedComment = await Comment.findById(comment._id);
    res.json(updatedComment);
    
  } catch (error) {
    console.error("❌ [updateComment] Error:", error);
    res.status(500).json({ error: "Failed to update comment" });
  }
};

export const deleteComment = async (req, res) => {
  console.log("📝 [deleteComment] Entry");
  console.log("📝 [deleteComment] Comment ID:", req.params.id);
  
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    
    if (!comment) {
      console.warn("⚠️ [deleteComment] Comment not found:", id);
      return res.status(404).json({ error: "Comment not found" });
    }

    await Comment.findByIdAndDelete(id);
    
    console.log("✅ [deleteComment] Comment deleted:", id);
    
    res.json({ message: "Comment deleted successfully" });
    
  } catch (error) {
    console.error("❌ [deleteComment] Error:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
};

const commentController = {
  createComment,
  getCommentsByBlog,
  getAllComments,
  updateComment,
  deleteComment
};

export default commentController;