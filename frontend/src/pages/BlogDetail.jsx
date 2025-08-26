import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ authorName: "", authorEmail: "", content: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/blogs/get/${slug}`);
        setBlog(response.data);
        const commentResponse = await axios.get(`http://localhost:8000/api/comments/blog/${response.data._id}`);
        setComments(commentResponse.data);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const handleLike = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/blogs/like/${blog._id}`);
      setBlog({ ...blog, likes: response.data.likes });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to like blog");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/api/comments", {
        blogId: blog._id,
        content: newComment.content,
        authorName: newComment.authorName,
        authorEmail: newComment.authorEmail,
      });
      setComments([...comments, response.data]);
      setNewComment({ authorName: "", authorEmail: "", content: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to post comment");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!blog) return null;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{blog.title}</h2>
      <p>{blog.content}</p>
      <div className="mt-4">
        <p>Likes: {blog.likes}</p>
        <button onClick={handleLike} className="bg-blue-500 text-white px-4 py-2 rounded">
          Like
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Comments</h3>
        {comments.map((comment) => (
          <div key={comment._id} className="border p-2 mt-2">
            <p>{comment.content}</p>
            <p className="text-sm text-gray-500">By {comment.authorName}</p>
          </div>
        ))}
        <form onSubmit={handleCommentSubmit} className="mt-4 space-y-2">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={newComment.authorName}
              onChange={(e) => setNewComment({ ...newComment, authorName: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Email (optional)</label>
            <input
              type="email"
              value={newComment.authorEmail}
              onChange={(e) => setNewComment({ ...newComment, authorEmail: e.target.value })}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Comment</label>
            <textarea
              value={newComment.content}
              onChange={(e) => setNewComment({ ...newComment, content: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Post Comment
          </button>
        </form>
      </div>
    </div>
  );
};

export default BlogDetail;