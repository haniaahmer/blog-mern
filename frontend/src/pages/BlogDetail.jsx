// src/pages/BlogDetail.jsx
import React, { useEffect, useState, memo } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

/* ----------------------------- Blog Content ----------------------------- */
const BlogContent = memo(function BlogContent({ blog }) {
  if (!blog) return null;

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Blog Image */}
      {blog.images && blog.images.length > 0 && (
        <div className="w-full h-64 sm:h-80 lg:h-96">
          <img
            src={`http://localhost:8000/uploads/${blog.images[0]}`}
            alt={blog.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log("[BlogDetail] Image failed to load:", e.target.src);
              e.target.src =
                "https://via.placeholder.com/800x400?text=No+Image";
            }}
          />
        </div>
      )}

      {/* Blog Content */}
      <div className="p-6 lg:p-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mb-6">
          {blog.category && (
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
              {blog.category}
            </span>
          )}
          <span className="text-gray-500 text-sm">
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {blog.views && (
            <span className="text-gray-500 text-sm">{blog.views} views</span>
          )}
        </div>

        {blog.excerpt && (
          <div className="text-lg text-gray-600 mb-6 font-medium">
            {blog.excerpt}
          </div>
        )}

        <div className="prose prose-lg max-w-none text-gray-700 mb-8">
          {blog.content.split("\n").map((paragraph, index) =>
            paragraph.trim() ? (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ) : null
          )}
        </div>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Tags:</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="border-t pt-6 mb-8">
          <Link
            to="/blogs"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to All Blogs
          </Link>
        </div>
      </div>
    </article>
  );
});

/* ----------------------------- Comment Form ----------------------------- */
function CommentForm({ blogId, onCommentAdded }) {
  const [newComment, setNewComment] = useState({
    content: "",
    name: "",
    email: "",
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newComment.content.trim() || !newComment.name.trim()) {
      alert("Please fill in your name and comment");
      return;
    }

    try {
      setSubmitLoading(true);
      const response = await api.post("/blogs/comment", {
        blogId,
        content: newComment.content.trim(),
        name: newComment.name.trim(),
        email: newComment.email.trim() || undefined,
      });

      setNewComment({ content: "", name: "", email: "" });
      onCommentAdded(response.data);
      alert("Comment submitted successfully!");
    } catch (error) {
      console.error("[BlogDetail] Error submitting comment:", error);
      alert(
        error.response?.data?.error ||
          "Failed to submit comment. Please try again."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 p-4 bg-gray-50 rounded-lg"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Leave a Comment
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={newComment.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Your name"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email (optional)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={newComment.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="mb-4">
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Comment *
        </label>
        <textarea
          id="content"
          name="content"
          value={newComment.content}
          onChange={handleInputChange}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Share your thoughts..."
        />
      </div>

      <button
        type="submit"
        disabled={submitLoading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {submitLoading ? "Submitting..." : "Post Comment"}
      </button>
    </form>
  );
}

/* ----------------------------- Comments List ----------------------------- */
function CommentsList({ comments, loading }) {
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading comments...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div
          key={comment._id}
          className="border-b border-gray-200 pb-6 last:border-b-0"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-800">
                  {(comment.author?.name ||
                    comment.authorName ||
                    "Guest")[0].toUpperCase()}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {comment.author?.name || comment.authorName || "Guest"}
                </h4>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="mt-2 text-gray-700">{comment.content}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------- Main Component ----------------------------- */
export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blogs/${slug}`);
      setBlog(response.data);
      if (response.data._id) {
        fetchComments(response.data._id);
      }
    } catch (err) {
      setError("Failed to load blog.");
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (blogId) => {
    try {
      setCommentsLoading(true);
      const response = await api.get(`/blogs/comments/${blogId}`);
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading blog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Blog not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BlogContent blog={blog} />

        <div className="mt-8 bg-white rounded-lg shadow-md p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>
          <CommentForm
            blogId={blog._id}
            onCommentAdded={(newComment) =>
              setComments((prev) => [newComment, ...prev])
            }
          />
          <CommentsList comments={comments} loading={commentsLoading} />
        </div>
      </div>
    </div>
  );
}
