import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

// Public Pages
import Home from "./pages/Home";
import BlogDetail from "./pages/BlogDetail";
import AllBlogs from "./pages/AllBlogs";

// Admin Pages
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminBlogForm from "./components/admin/AdminBlogForm";
import BlogManagement from "./components/admin/BlogManagement";
import CommentManagement from "./components/admin/CommentManagement";
import EditBlogWrapper from "./components/admin/EditBlogWrapper";
import NotFound from "./pages/NotFound";
// Layout
import PublicLayout from "./components/layouts/PublicLayout";

// CSS
import "./App.css";

// Protected Route
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("adminToken");
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
};

// Axios interceptors
const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        window.location.href = "/admin/login";
      }
      return Promise.reject(error);
    }
  );
};

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
    setupAxiosInterceptors();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/blogs" element={<PublicLayout><AllBlogs /></PublicLayout>} />
          <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />

          {/* Admin Auth */}
          <Route
            path="/admin/login"
            element={
              localStorage.getItem("adminToken")
                ? <Navigate to="/admin/dashboard" replace />
                : <AdminLogin />
            }
          />

          {/* Admin Protected */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/blogs" element={<ProtectedRoute><BlogManagement /></ProtectedRoute>} />
          <Route path="/admin/create-blog" element={<ProtectedRoute><AdminBlogForm /></ProtectedRoute>} />
          <Route path="/admin/edit-blog/:id" element={<ProtectedRoute><EditBlogWrapper /></ProtectedRoute>} />
          <Route path="/admin/comments" element={<ProtectedRoute><CommentManagement /></ProtectedRoute>} />

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}


export default App;
