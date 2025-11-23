import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";

const baseUrl="https://plantcarebackend.onrender.com"
const Post = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [showPostBox, setShowPostBox] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ caption: "" });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [commentInput, setCommentInput] = useState({});
  const [showComments, setShowComments] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchPosts();
    allusersFetch();
  }, []);

  // ✅ Fetch all users
  const allusersFetch = async () => {
    try {
      const res = await axios.get(`${baseUrl}/auth/alluser`);
      setUsers(res.data.users || []); // Expecting { users: [...] }
      console.log(res.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ✅ Fetch all posts
  const fetchPosts = async () => {
    try { 
      const emailtofind=localStorage.getItem("email")
      console.log(emailtofind)
      const res = await axios.get(`${baseUrl}/posts/getposts`);
      const p=res.data.posts.filter((post)=>post.email==emailtofind)
      setAllPosts(p);
    } catch (err) {
      console.error(err);
      setAllPosts([]);
    }
  };

  // ✅ Match user name by email
  const getUserName = (email) => {
    const user = users.find((u) => u.email === email);
    return user ? user.name : "Unknown User";
  };

  // ✅ Get user profile image
  const getUserProfileImage = (email) => {
    const user = users.find((u) => u.email === email);
    return user ? user.profileImageUrl : null;
  };

  // ✅ Input Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // ✅ Submit Post
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.caption || !image) {
      toast.error("Caption and image are required");
      return;
    }

    const data = new FormData();
    data.append("caption", formData.caption);
    data.append("image", image);
    data.append("date", new Date().toISOString());
    data.append("likeCount", 0);
    data.append("comment", JSON.stringify([]));

    const email = localStorage.getItem("email");
    if (email) {
      data.append("email", email);
    } else {
      toast.error("User email not found. Please log in again.");
      return;
    }

    try {
      setIsAdding(true);
      await axios.post(`${baseUrl}/posts/addPost`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Post added successfully!");
      setFormData({ caption: "" });
      setImage(null);
      setPreview(null);
      setShowPostBox(false);
      setIsAdding(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to add post");
      setIsAdding(false);
    }
  };

  // ✅ Delete Post
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${baseUrl}/posts/delete/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Post deleted successfully!");
      setAllPosts(allPosts.filter((post) => post._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    }
  };

  // ✅ Check if user liked the post
  const hasUserLiked = (post) => {
    return post.likedBy && post.likedBy.includes(localStorage.getItem("email"));
  };

  // ✅ Like/Unlike Post
  const handleLike = async (post) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to like posts");
        return;
      }

      await axios.put(
        `${baseUrl}/posts/like/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Refresh posts to get updated data
      fetchPosts();
    } catch (err) {
      console.error(err);
        toast.error("Failed to like/unlike post");
    }
  };

  // ✅ Add Comment
  const handleComment = async (post) => {
    if (!commentInput[post._id]) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to comment");
        return;
      }

      const updatedComments = [...(post.comment || []), commentInput[post._id]];

      await axios.put(
        `${baseUrl}/posts/comment/${post._id}`,
        { comment: updatedComments },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAllPosts((prev) =>
        prev.map((p) =>
          p._id === post._id ? { ...p, comment: updatedComments } : p
        )
      );

      setCommentInput((prev) => ({ ...prev, [post._id]: "" }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    }
  };

  // ✅ Delete Comment
  const handleDeleteComment = async (post, commentIndex) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to delete comments");
        return;
      }

      await axios.delete(
        `${baseUrl}/posts/comment/${post._id}/${commentIndex}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedComments = post.comment.filter((_, i) => i !== commentIndex);
      setAllPosts((prev) =>
        prev.map((p) =>
          p._id === post._id ? { ...p, comment: updatedComments } : p
        )
      );

      toast.success("Comment deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="max-w-xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            📝 My Posts
          </h1>
          <p className="text-xl text-gray-600">Manage and view your own posts</p>
        </motion.div>
      </div>

      {/* New Post Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={() => setShowPostBox(!showPostBox)}
          className={`px-6 py-2 rounded-md font-semibold transition duration-200 ${
            showPostBox
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {showPostBox ? "Close Post Box" : "➕ New Post"}
        </button>
      </div>

      {/* Post Form */}
      {showPostBox && (
        <motion.div
          className="mx-auto w-full max-w-md p-6 bg-white rounded-lg shadow-lg border border-gray-300 mb-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-bold mb-4 text-gray-800">Create Post</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="caption"
              placeholder="Write a caption..."
              value={formData.caption}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-green-400"
            />

            {preview && (
              <div className="mt-2">
                <p className="text-gray-600 mb-1">Preview:</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-60 object-cover rounded-md border"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-200"
            >
              {isAdding ? "Posting..." : "Post"}
            </button>
          </form>
        </motion.div>
      )}

      {/* Display Posts */}
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        {allPosts.length > 0 ? (
          allPosts.map((post) => (
            <motion.div
              key={post._id}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="mb-2 p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Link
                    to={`/user/${encodeURIComponent(post.email)}`}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    {getUserProfileImage(post.email) ? (
                      <img
                        src={getUserProfileImage(post.email)}
                        alt={getUserName(post.email)}
                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-200 flex items-center justify-center text-green-900 font-bold cursor-pointer hover:bg-green-300">
                        {getUserName(post.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <Link
                    to={`/user/${encodeURIComponent(post.email)}`}
                    className="font-medium text-gray-800 underline hover:text-gray-900"
                  >
                    {getUserName(post.email)}
                  </Link>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {post.caption}
                </h3>
              </div>

              {post.image && (
                <div className="mx-2 md:mx-4 my-2 md:my-4 border-2 border-green-300 rounded-xl overflow-hidden shadow-lg">
                  <div className="relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="w-full aspect-video object-cover transition-all duration-700 hover:scale-105 md:hover:scale-110 hover:brightness-105"
                      loading="lazy"
                    />
                    <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
                        <p className="text-sm text-gray-800 font-medium">
                          📸 Click to enlarge
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4">
                {/* Like & Comment */}
                <div className="flex items-center space-x-4 mb-2">
                  <button
                    onClick={() => handleLike(post)}
                    className={`${
                      hasUserLiked(post)
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                    } text-white px-3 py-1 rounded-md`}
                  >
                    {hasUserLiked(post) ? "❤️ Unlike" : "👍 Like"} ({post.likeCount || 0})
                  </button>

                  <button
                    onClick={() =>
                      setShowComments((prev) => ({
                        ...prev,
                        [post._id]: !prev[post._id],
                      }))
                    }
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md"
                  >
                    💬 Comment ({post.comment?.length || 0})
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <h4 className="font-semibold mb-2 text-gray-800">
                      Comments
                    </h4>

                    {post.comment?.length > 0 ? (
                      post.comment.map((c, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-white p-2 mb-2 rounded shadow-sm"
                        >
                          <p className="text-gray-700">{c}</p>
                          <button
                            onClick={() => handleDeleteComment(post, i)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            ❌ Delete
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No comments yet.</p>
                    )}

                    <div className="flex mt-3">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={commentInput[post._id] || ""}
                        onChange={(e) =>
                          setCommentInput((prev) => ({
                            ...prev,
                            [post._id]: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <button
                        onClick={() => handleComment(post)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-r-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(post._id)}
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded-md transition duration-200"
                >
                  Delete Post
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600">No posts available.</p>
        )}
      </div>
    </div>
  );
};

export default Post;
