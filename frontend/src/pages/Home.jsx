import { useEffect, useState } from "react";
import api from "../services/api";
import BlogCard from "../components/BlogCard";

export default function Home() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    api.get("/blogs").then(res => setBlogs(res.data.blogs));
  }, []);

  return (
    <div className="p-6 grid md:grid-cols-3 gap-6">
      {blogs.map(blog => (
        <BlogCard key={blog._id} blog={blog} />
      ))}
    </div>
  );
}
