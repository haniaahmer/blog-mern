import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";

export const createComment = async (req, res) => {
  console.log("🔔 [createComment] Request body:", req.body);
  try {
    const { blogId, content, authorName, authorEmail } = req.body;

    if (!blogId || !content || !authorName) {
      return res.status(400).json({ error: "Blog ID, content, and author name are required" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog || !blog.published) {
      return res.status(404).json({ error: "Blog not found or not published" });
    }

    const comment = await Comment.create({
      blog: blogId,
      content: content.trim(),
      authorName: authorName.trim(),
      authorEmail: authorEmail ? authorEmail.trim() : undefined,
    });

    console.log("✅ [createComment] Comment created:", comment._id);
    res.status(201).json(comment);
  } catch (error) {
    console.error("❌ [createComment] Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getCommentsByBlog = async (req, res) => {
  console.log("🔔 [getCommentsByBlog] Blog ID:", req.params.blogId);
  try {
    const comments = await Comment.find({ blog: req.params.blogId })
      .sort({ createdAt: -1 });
    console.log(`✅ [getCommentsByBlog] Returned ${comments.length} comments`);
    res.json(comments);
  } catch (error) {
    console.error("❌ [getCommentsByBlog] Error:", error);
    res.status(500).json({ error: error.message });
  }
};