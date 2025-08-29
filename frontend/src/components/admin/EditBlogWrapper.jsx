import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import AdminBlogForm from "./AdminBlogForm";
import api from "../../services/api";
const EditBlogWrapper = () => {
  const { id } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await api.get(`/blogs/get/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        let blog = response.data.blog || response.data.data || response.data;
        setBlogData(blog);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }
        setError("Blog not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id, navigate]);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} onBack={() => navigate("/admin/blogs")} />;

  return <AdminBlogForm blogData={blogData} onSuccess={() => navigate("/admin/blogs")} />;
};

// Small reusable components
const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

const ErrorMessage = ({ message, onBack }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onBack}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
      >
        Back to Blogs
      </button>
    </div>
  </div>
);

export default EditBlogWrapper;
