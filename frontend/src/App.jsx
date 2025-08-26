// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setupAxiosInterceptors } from './utils/auth';

// Public Components
import Home from './pages/Home';
import BlogDetail from './pages/BlogDetail';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminBlogForm from './components/admin/AdminBlogForm';
import BlogManagement from './components/admin/BlogManagement';
import CommentManagement from './components/admin/CommentManagement';
import ProtectedRoute from './components/ProtectedRoute'; // Uncommented and imported

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// CSS
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsAuthenticated(true);
      // Set default Authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
    
    // Setup axios interceptors for authentication
    setupAxiosInterceptors();
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    delete axios.defaults.headers.common['Authorization'];
  };

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
          <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/login" 
            element={
              isAuthenticated ? 
                <Navigate to="/admin/dashboard" replace /> : 
                <AdminLogin onLoginSuccess={handleLogin} />
            } 
          />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminDashboard onLogout={handleLogout} />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/blogs" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <BlogManagement />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/create-blog" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AdminBlogForm />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/edit-blog/:id" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <EditBlogWrapper />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/comments" 
            element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <CommentManagement />
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect /admin to dashboard */}
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

// Public Layout Component
const PublicLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
};

// Edit Blog Wrapper to fetch blog data
const EditBlogWrapper = () => {
  const { id } = useParams();
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const API_URL = process.env.VITE_API_URL || 'http://localhost:8000';
        const token = localStorage.getItem("adminToken");
        const response = await axios.get(`${API_URL}/api/blogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBlogData(response.data);
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Blog not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  const handleSuccess = () => {
    navigate("/admin/blogs");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Blog Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/admin/blogs")}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return <AdminBlogForm blogData={blogData} onSuccess={handleSuccess} />;
};

// 404 Component
const NotFound = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;