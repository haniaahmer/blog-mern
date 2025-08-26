import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    api.get(`/blogs/${slug}`).then(res => setBlog(res.data));
  }, [slug]);

  if (!blog) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      {blog.images?.map((img, i) => (
        <img
          key={i}
          src={`http://localhost:8000/uploads/${img}`}
          alt={blog.title}
          className="my-4 rounded"
        />
      ))}
      <p>{blog.content}</p>
      <button
        onClick={() => api.post(`/blogs/${blog._id}/like`)}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        👍 Like ({blog.likes})
      </button>
    </div>
  );
}
