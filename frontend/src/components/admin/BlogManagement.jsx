// src/components/admin/BlogManagement.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function BlogManagement() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, published, draft
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }
    
    fetchBlogs();
  }, [navigate]);

  const fetchBlogs = async () => {
  try {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('adminToken');
    const response = await api.get('/blogs/get', {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    let blogsData = [];
    
    if (Array.isArray(response.data)) {
      blogsData = response.data;
    } else if (response.data && Array.isArray(response.data.blogs)) {
      blogsData = response.data.blogs;
    } else if (response.data && Array.isArray(response.data.data)) {
      blogsData = response.data.data;
    }
    
    setBlogs(blogsData);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      return;
    }
    
    setError(error.response?.data?.error || 'Failed to load blogs');
    setBlogs([]);
  } finally {
    setLoading(false);
  }
};
  const handleDelete = async (id) => {
  if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
    return;
  }

  setDeleteLoading(prev => ({ ...prev, [id]: true }));

  try {
    const token = localStorage.getItem('adminToken');
    await api.delete(`/api/blogs/delete/${id}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== id));
  } catch (error) {
    console.error('Error deleting blog:', error);
    alert(error.response?.data?.error || 'Failed to delete blog post');
  } finally {
    setDeleteLoading(prev => ({ ...prev, [id]: false }));
  }
};
  const handleTogglePublish = async (id, currentStatus) => {
  try {
    const token = localStorage.getItem('adminToken');
    await api.put(
      `/api/blogs/update/${id}/toggle-publish`,
      { published: !currentStatus },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      }
    );
    
    setBlogs(prevBlogs => prevBlogs.map(blog => 
      blog._id === id ? { ...blog, published: !currentStatus } : blog
    ));
  } catch (error) {
    console.error('Error toggling publish status:', error);
    alert(error.response?.data?.error || 'Failed to update publish status');
  }
};

  const handleEdit = (blogId) => {
    navigate(`/admin/edit-blog/${blogId}`);
  };

  // Safe filter and search blogs
  const filteredBlogs = Array.isArray(blogs) ? blogs.filter(blog => {
    const matchesSearch = blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "published") return blog.published && matchesSearch;
    if (filter === "draft") return !blog.published && matchesSearch;
    return matchesSearch;
  }) : [];

  const publishedCount = Array.isArray(blogs) ? blogs.filter(b => b.published).length : 0;
  const draftCount = Array.isArray(blogs) ? blogs.filter(b => !b.published).length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Management</h1>
            <p className="text-gray-600">Manage your blog posts</p>
          </div>
          <button
            onClick={() => navigate("/admin/create-blog")}
            className="mt-4 sm:mt-0 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Blog
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border">
          <h3 className="text-sm font-medium text-gray-500">Total Blogs</h3>
          <p className="text-2xl font-bold text-gray-900">{blogs.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border">
          <h3 className="text-sm font-medium text-gray-500">Published</h3>
          <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border">
          <h3 className="text-sm font-medium text-gray-500">Drafts</h3>
          <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchBlogs}
            className="mt-2 text-red-700 hover:text-red-800 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search blogs by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All Blogs</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
      </div>

      {/* Blogs List */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden border">
        {filteredBlogs.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "No blogs match your search criteria." : "Get started by creating your first blog post."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => navigate("/admin/create-blog")}
                className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Blog Post
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Blog Post
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {blog.images && blog.images.length > 0 && (
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={`http://localhost:8000/uploads/${blog.images[0]}`}
                              alt={blog.title}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-2">
                            {blog.title}
                          </p>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {blog.excerpt || (blog.content ? blog.content.substring(0, 60) + "..." : "No content")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {blog.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {blog.published ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blog.views || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "Unknown date"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(blog._id)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-md transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleTogglePublish(blog._id, blog.published)}
                          className={`px-3 py-1 rounded-md transition-colors ${
                            blog.published
                              ? "text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100"
                              : "text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100"
                          }`}
                        >
                          {blog.published ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          disabled={deleteLoading[blog._id]}
                          className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors disabled:opacity-50"
                        >
                          {deleteLoading[blog._id] ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
