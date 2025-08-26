// src/components/BlogCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const BlogCard = ({ blog }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/api/placeholder/400/250';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/uploads/${imagePath}`;
  };

  return (
    <article className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      {/* Blog Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={getImageUrl(blog.images?.[0])}
          alt={blog.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/api/placeholder/400/250';
          }}
        />
        
        {/* Category Badge */}
        {blog.category && (
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 backdrop-blur-sm">
              {blog.category}
            </span>
          </div>
        )}

        {/* Reading Time */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white backdrop-blur-sm">
            {Math.ceil((blog.content?.length || 0) / 200)} min read
          </span>
        </div>
      </div>

      {/* Blog Content */}
      <div className="p-6">
        {/* Meta Information */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m4 0H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z" />
            </svg>
            {formatDate(blog.createdAt || blog.publishedAt)}
          </div>
          
          {blog.views && (
            <>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {blog.views} views
              </div>
            </>
          )}
        </div>

        {/* Blog Title */}
        <Link 
          to={`/blog/${blog.slug || blog._id}`}
          className="block group-hover:text-indigo-600 transition-colors duration-200"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 leading-tight">
            {blog.title}
          </h2>
        </Link>

        {/* Blog Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {blog.excerpt || getExcerpt(blog.content)}
        </p>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                #{tag.trim()}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                +{blog.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Read More Link */}
        <div className="flex items-center justify-between">
          <Link
            to={`/blog/${blog.slug || blog._id}`}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium text-sm group transition-colors duration-200"
          >
            Read More
            <svg 
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Like Button */}
          <div className="flex items-center space-x-4">
            {blog.likes !== undefined && (
              <button className="flex items-center text-gray-500 hover:text-red-500 transition-colors duration-200">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm">{blog.likes || 0}</span>
              </button>
            )}

            {/* Share Button */}
            <button className="text-gray-500 hover:text-indigo-500 transition-colors duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;