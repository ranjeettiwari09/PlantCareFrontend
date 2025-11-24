// 📁 Post.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/authContext";
import { Users, UserCheck } from "lucide-react";


import BASE_URL from "../../config/api";
const Post = () => {
  const { userDetails, token, isLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [commentInput, setCommentInput] = useState({});
  const [showComments, setShowComments] = useState({});
  const [users, setUsers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFilter, setShowFilter] = useState("all"); // "all" or "following"

  // Fetch following list
  const fetchFollowingList = async () => {
    if (!isLogin || !token) return;
    
    try {
      const res = await axios.get(`${BASE_URL}/auth/getuser`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFollowingList(res.data.following || []);
    } catch (error) {
      console.error("Error fetching following list:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchAllUsers();
    if (isLogin) {
      fetchFollowingList();
    }
  }, [isLogin, token]);

  // Filter posts based on showFilter
  useEffect(() => {
    if (showFilter === "following" && isLogin && followingList.length > 0) {
      const filtered = allPosts.filter(post => followingList.includes(post.email));
      setFilteredPosts(filtered);
    } else if (showFilter === "following" && isLogin && followingList.length === 0) {
      setFilteredPosts([]);
    } else {
      setFilteredPosts(allPosts);
    }
  }, [showFilter, allPosts, followingList, isLogin]);

  // ✅ Fetch all users
  const fetchAllUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/alluser`);
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // ✅ Fetch all posts
  const fetchPosts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/posts/getposts`);
      setAllPosts(res.data.posts);
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
        `${BASE_URL}/posts/like/${post._id}`,
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
        `${BASE_URL}/posts/comment/${post._id}`,
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
        `${BASE_URL}/posts/comment/${post._id}/${commentIndex}`,
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4 py-8">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <div className="max-w-xl mx-auto mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🌱 Latest Posts
          </h1>
          <p className="text-xl text-gray-600">See what's new in the community</p>
        </motion.div>

        {/* Filter Tabs */}
        {isLogin && (
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowFilter("all")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                showFilter === "all"
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              <Users className="w-5 h-5" />
              All Posts
            </button>
            <button
              onClick={() => setShowFilter("following")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                showFilter === "following"
                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200"
              }`}
            >
              <UserCheck className="w-5 h-5" />
              Following ({followingList.length})
            </button>
          </div>
        )}
      </div>

      {/* ✅ Display Posts Only */}
      <div className="flex flex-col gap-6 max-w-xl mx-auto">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <motion.div
              key={post._id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              whileHover={{ y: -5 }}
            >
              {/* Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <Link
                    to={`/user/${encodeURIComponent(post.email)}`}
                    className="hover:scale-110 transition-transform duration-200"
                  >
                    {getUserProfileImage(post.email) ? (
                      <img
                        src={getUserProfileImage(post.email)}
                        alt={getUserName(post.email)}
                        className="w-14 h-14 rounded-full object-cover border-2 border-green-400 shadow-md cursor-pointer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-xl shadow-md cursor-pointer hover:from-green-500 hover:to-green-700">
                        {getUserName(post.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>
                  <div className="flex-1">
                    <Link
                      to={`/user/${encodeURIComponent(post.email)}`}
                      className="font-semibold text-gray-900 hover:text-green-600 transition-colors duration-200 block"
                    >
                      {getUserName(post.email)}
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(post.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                  {post.caption}
                </h3>
              </div>

              {/* Image */}
              {post.image && (
                <div 
                  className="mx-2 md:mx-4 my-2 md:my-4 border-2 border-green-300 rounded-xl overflow-hidden shadow-lg cursor-pointer"
                  onClick={() => navigate(`/post/${post._id}`)}
                >
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
                          📸 Click to view full post
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="p-5">
                {/* Like & Comment */}
                <div className="flex items-center gap-3 mb-4">
                  <button
                    onClick={() => handleLike(post)}
                    className={`${
                      hasUserLiked(post)
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    } text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2`}
                  >
                    <span className="text-xl">
                      {hasUserLiked(post) ? "❤️" : "👍"}
                    </span>
                    <span className="font-semibold">
                      {hasUserLiked(post) ? "Unlike" : "Like"}
                    </span>
                    <span className="bg-white/30 px-2 py-1 rounded-full text-xs font-bold">
                      {post.likeCount || 0}
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      setShowComments((prev) => ({
                        ...prev,
                        [post._id]: !prev[post._id],
                      }))
                    }
                    className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <span className="text-xl">💬</span>
                    <span className="font-semibold">Comment</span>
                    <span className="bg-white/30 px-2 py-1 rounded-full text-xs font-bold">
                      {post.comment?.length || 0}
                    </span>
                  </button>
                </div>

                {/* Comments Section */}
                {showComments[post._id] && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 space-y-3"
                  >
                    <h4 className="font-bold text-gray-800 text-lg mb-3">
                      💭 Comments
                    </h4>

                    {post.comment?.length > 0 ? (
                      post.comment.map((c, i) => (
                        <div
                          key={i}
                          className="bg-white p-3 rounded-lg shadow-sm flex justify-between items-start gap-2"
                        >
                          <p className="text-gray-700 flex-1">{c}</p>
                          <button
                            onClick={() => handleDeleteComment(post, i)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200"
                          >
                            ❌
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm text-center py-2">
                        No comments yet. Be the first to comment!
                      </p>
                    )}

                    <div className="flex gap-2 mt-4">
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
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleComment(post);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleComment(post)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 font-semibold"
                      >
                        Post
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">
              {showFilter === "following" ? "👥" : "🌱"}
            </div>
            <p className="text-xl text-gray-600">
              {showFilter === "following" 
                ? "No posts from users you follow yet." 
                : "No posts available yet."}
            </p>
            <p className="text-gray-500 mt-2">
              {showFilter === "following" 
                ? "Follow more users to see their posts here!" 
                : "Be the first to share something!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Post;
