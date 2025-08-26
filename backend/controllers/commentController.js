// controllers/commentController.js
import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";
import nodemailer from "nodemailer";

// Email setup (dummy example, replace with your SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

// ✅ Add a new comment (public)
export const addComment = async (req, res) => {
  try {
    const { blogId, name, email, text } = req.body;

    if (!blogId || !name || !email || !text) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = new Comment({
      blog: blogId,
      name,
      email,
      text,
      approved: false, // default pending
    });

    await comment.save();

    // send notification email to admin
    await transporter.sendMail({
      from: `"Blog CMS" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: "New Comment Submitted",
      text: `A new comment was submitted on blog "${blog.title}" by ${name} (${email}).`,
    });

    res.status(201).json({ message: "Comment submitted for review" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get approved comments for a blog (public)
export const getBlogComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const comments = await Comment.find({ blog: blogId, approved: true }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin approve comment
export const approveComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndUpdate(id, { approved: true }, { new: true });
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment approved", comment });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Admin reject/delete comment
export const rejectComment = async (req, res) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findByIdAndDelete(id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    res.json({ message: "Comment rejected and deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
