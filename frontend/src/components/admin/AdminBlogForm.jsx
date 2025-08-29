import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import { jwtDecode } from "jwt-decode";

const AdminBlogForm = ({ blogData, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    tags: "",
    content: "",
    excerpt: "",
    published: false,
  });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    console.log("[AdminBlogForm] Checking token in localStorage:", token ? "Present" : "Missing");

    if (!token) {
      console.log("[AdminBlogForm] No token found, redirecting to login.");
      navigate("/admin/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      console.log("[AdminBlogForm] Decoded token:", decoded);
      
      // Check if user has admin or editor privileges
      const hasAdminAccess = ['admin', 'editor', 'superadmin'].includes(decoded.role);
      
      if (!hasAdminAccess) {
        console.log("[AdminBlogForm] Invalid role:", decoded.role);
        setError("Access denied: Only admins and editors can access this page");
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }

      // If we get here, user is authorized
      setIsAuthorized(true);

      if (blogData) {
        setFormData({
          title: blogData.title || "",
          category: blogData.category || "",
          tags: blogData.tags?.join(", ") || "",
          content: blogData.content || "",
          excerpt: blogData.excerpt || "",
          published: blogData.published || false,
        });
        setPreview(blogData.images || []);
      }
    } catch (err) {
      console.error("Token decode error:", err);
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
    }
  }, [blogData, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreview(previews);
  };

  const validateForm = () => {
    if (!formData.title || !formData.content || !formData.category) {
      setError("Title, content, and category are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("content", formData.content);
    submitData.append("category", formData.category);
    submitData.append("tags", formData.tags);
    submitData.append("excerpt", formData.excerpt);
    submitData.append("published", formData.published);
    images.forEach((image) => submitData.append("images", image));

    try {
      let response;
      if (id) {
        response = await api.put(`/blogs/update/${id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        response = await api.post("/blogs/create", submitData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      onSuccess?.(response.data);
      navigate("/admin/blogs");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      } else if (err.response?.status === 403) {
        setError("Access denied: Insufficient permissions");
      } else {
        setError(err.response?.data?.error || "Failed to save blog");
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render the form until we've checked authorization
  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <p className="text-gray-500">Checking permissions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{id ? "Edit Blog" : "Create Blog"}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Tags (comma-separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="6"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Excerpt</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
              className="mr-2"
            />
            Published
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {preview.map((url, index) => (
              <img key={index} src={url} alt="Preview" className="w-24 h-24 object-cover" />
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : id ? "Update Blog" : "Create Blog"}
        </button>
      </form>
    </div>
  );
};

export default AdminBlogForm;