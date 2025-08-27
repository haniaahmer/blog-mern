import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-r from-teal-500 to-teal-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-md">
              <span className="text-teal-600 font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-white">BlogSite</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-white hover:text-teal-200 transition-colors duration-300">
              Home
            </Link>
            <Link to="/blogs" className="text-white hover:text-teal-200 transition-colors duration-300">
              All Blogs
            </Link>
            {/* <Link to="/about" className="text-white hover:text-teal-200 transition-colors duration-300">
              About
            </Link> */}
            <Link to="/contact" className="text-white hover:text-teal-200 transition-colors duration-300">
              Contact
            </Link>
            <button
              onClick={() => navigate('/admin/login')}
              className="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-100 hover:text-teal-700 transition-colors duration-300 shadow-md"
            >
              Admin
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-teal-200 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-teal-600 border-t border-teal-400">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 text-white hover:text-teal-200 hover:bg-teal-700 rounded-md transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/blogs"
                className="block px-3 py-2 text-white hover:text-teal-200 hover:bg-teal-700 rounded-md transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                All Blogs
              </Link>
              {/* <Link
                to="/about"
                className="block px-3 py-2 text-white hover:text-teal-200 hover:bg-teal-700 rounded-md transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link> */}
              <Link
                to="/contact"
                className="block px-3 py-2 text-white hover:text-teal-200 hover:bg-teal-700 rounded-md transition-colors duration-300"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <button
                onClick={() => {
                  navigate('/admin/login');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 bg-white text-teal-600 rounded-lg hover:bg-teal-100 hover:text-teal-700 transition-colors duration-300 shadow-md"
              >
                Admin Login
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
export default Navbar;