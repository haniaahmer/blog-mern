import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "../services/api";
const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const response = await api.get("/blogs/get");
        setBlogs(response.data.blogs);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch blogs");
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Blogs</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div key={blog._id} className="border p-4 rounded">
              <h3 className="text-xl font-semibold">{blog.title}</h3>
              <p>{blog.excerpt}</p>
              <a href={`/blog/${blog.slug}`} className="text-blue-500">Read More</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogList;