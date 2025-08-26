import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api"; // Import the custom axios instance

/**
 * A form component for creating or editing a blog post in the admin panel.
 * It handles form state, image uploads, and API communication with authentication.
 * @param {object} props
 * @param {object} props.blogData - The existing blog post data for editing. Null for a new post.
 * @param {function} props.onSuccess - Callback function to execute on successful form submission.
 */
const AdminBlogForm = ({ blogData, onSuccess }) => {
  // State for the form inputs
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    tags: "",
    content: "",
    excerpt: "",
    published: false,
  });
  // State for new images to be uploaded
  const [images, setImages] = useState([]);
  // State for image preview URLs (both new and existing)
  const [preview, setPreview] = useState([]);
  // State for tracking loading status during API calls
  const [loading, setLoading] = useState(false);
  // State for displaying error messages
  const [error, setError] = useState("");
  // React Router hook for programmatic navigation
  const navigate = useNavigate();

  // Initialize form data and image previews when a blogData object is provided (for editing)
  useEffect(() => {
    if (blogData) {
      setFormData({
        title: blogData.title || "",
        category: blogData.category || "",
        tags: Array.isArray(blogData.tags) ? blogData.tags.join(", ") : blogData.tags || "",
        content: blogData.content || "",
        excerpt: blogData.excerpt || "",
        published: blogData.published || false,
      });

      if (blogData.images && blogData.images.length > 0) {
        const existingImages = blogData.images.map((img) =>
          typeof img === "string" ? `http://localhost:8000/uploads/${img}` : img
        );
        setPreview(existingImages);
      }
    }
  }, [blogData]);

  // Client-side authentication check on component mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // Handle changes to form input fields
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle selection of new image files and create local preview URLs
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));
    setPreview(previewUrls);
  };

  // Remove an image from the preview and the files to be uploaded
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreview = preview.filter((_, i) => i !== index);
    setImages(newImages);
    setPreview(newPreview);
  };

  // Clean up object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      preview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [preview]);

  // Simple form validation
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    }
    if (!formData.content.trim()) {
      setError("Content is required");
      return false;
    }
    return true;
  };

  // Handle the form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setLoading(true);
  setError("");

  try {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const submitData = new FormData();
    submitData.append("title", formData.title.trim());
    submitData.append("category", formData.category.trim());
    submitData.append("tags", formData.tags);
    submitData.append("content", formData.content);
    submitData.append("excerpt", formData.excerpt.trim());
    submitData.append("published", formData.published);

    images.forEach((img) => submitData.append("images", img));

    let response;
    if (blogData?._id) {
      // ✅ CORRECT: PUT to /blogs/:id
      response = await api.put(`/blogs/${blogData._id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      // ✅ CORRECT: POST to /blogs (not /blogs/blogs)
      response = await api.post("/blogs", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    }

    if (onSuccess) {
      onSuccess(response.data);
    } else {
      navigate("/admin/blogs");
    }

    if (!blogData?._id) {
      setFormData({
        title: "",
        category: "",
        tags: "",
        content: "",
        excerpt: "",
        published: false,
      });
      setImages([]);
      setPreview([]);
    }
  } catch (err) {
    console.error("Blog save error:", err);
    if (err.response?.status === 401) {
      const errorMessage = err.response?.data?.error || "Authentication failed";
      if (["No token", "Invalid token", "Token expired", "Invalid user"].includes(errorMessage)) {
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
        return;
      }
    } else if (err.response?.status === 403) {
      setError("Access denied: Insufficient permissions");
      return;
    }
    setError(err.response?.data?.error || "Error saving blog. Please try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          {blogData ? "Edit Blog Post" : "Create New Blog Post"}
        </h2>
        <p className="text-gray-600 mt-2">
          {blogData ? "Update your existing blog post" : "Share your thoughts with the world"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
          <p className="text-red-600 flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Category Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Blog Title *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Enter an engaging blog title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              id="category"
              name="category"
              type="text"
              placeholder="e.g., Technology, Lifestyle, Business"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              disabled={loading}
            />
          </div>
        </div>

        {/* Tags and Published Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              placeholder="Enter tags separated by commas"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-1">Separate tags with commas</p>
          </div>

          <div className="flex items-center">
            <div className="flex items-center h-5">
              <input
                id="published"
                name="published"
                type="checkbox"
                checked={formData.published}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={loading}
              />
            </div>
            <div className="ml-3">
              <label htmlFor="published" className="text-sm font-medium text-gray-700">
                Publish immediately
              </label>
              <p className="text-sm text-gray-500">Make this blog post visible to readers</p>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows="3"
            placeholder="Brief summary of your blog post"
            value={formData.excerpt}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">Optional: This will be shown in blog previews</p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            rows="12"
            placeholder="Write your blog content here..."
            value={formData.content}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            required
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">Use markdown for formatting</p>
        </div>

        {/* Images */}
        <div>
          <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images
          </label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition duration-200"
            disabled={loading}
          />

          {/* Image Preview */}
          {preview.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Image Preview:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {preview.map((src, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {blogData ? "Updating..." : "Creating..."}
              </div>
            ) : (
              blogData ? "Update Blog Post" : "Create Blog Post"
            )}
          </button>

          <button
            type="button"
            onClick={() => navigate("/admin/blogs")}
            disabled={loading}
            className="flex-1 sm:flex-initial border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled.opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogForm;