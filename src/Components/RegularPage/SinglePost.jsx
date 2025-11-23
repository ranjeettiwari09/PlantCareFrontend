import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, User } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../Context/authContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const baseUrl="https://plantcarebackend.onrender.com"
const SinglePost = () => {
  const { id } = useParams();
  const { token, userDetails } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [commentInput, setCommentInput] = useState("");
  const [showComments, setShowComments] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${baseUrl}/posts/${id}`);
        setPost(res.data.post);
        
        // Fetch user details
        if (res.data.post?.email) {
          try {
            const userRes = await axios.get(`${baseUrl}/auth/alluser`);
            const foundUser = userRes.data.users?.find(u => u.email === res.data.post.email);
            setUser(foundUser);
          } catch (err) {
            console.error("Error fetching user:", err);
          }
        }
      } catch (err) {
        setError("Post not found or server error.");
        console.error(err);
      }
    };
    fetchPost();
  }, [id]);

  const hasUserLiked = () => {
    return post?.likedBy?.includes(userDetails?.email || localStorage.getItem("email"));
  };

  const handleLike = async () => {
    if (!token) {
      toast.error("Please log in to like posts");
      return;
    }

    try {
      await axios.put(
        `${baseUrl}/posts/like/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh post
      const res = await axios.get(`${baseUrl}/posts/${id}`);
      setPost(res.data.post);
    } catch (err) {
      console.error(err);
      toast.error("Failed to like/unlike post");
    }
  };

  const handleComment = async () => {
    if (!commentInput.trim()) return;
    if (!token) {
      toast.error("Please log in to comment");
      return;
    }

    try {
      const updatedComments = [...(post.comment || []), commentInput];
      await axios.put(
        `${baseUrl}/comment/${post._id}`,
        { comment: updatedComments },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPost(prev => ({ ...prev, comment: updatedComments }));
      setCommentInput("");
      toast.success("Comment added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentIndex) => {
    if (!token) {
      toast.error("Please log in to delete comments");
      return;
    }

    try {
      await axios.delete(
        `${baseUrl}/posts/comment/${post._id}/${commentIndex}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedComments = post.comment.filter((_, i) => i !== commentIndex);
      setPost(prev => ({ ...prev, comment: updatedComments }));
      toast.success("Comment deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete comment");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </motion.button>

        {/* Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <Link
                to={`/user/${encodeURIComponent(post.email)}`}
                className="hover:scale-110 transition-transform"
              >
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-green-400 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </Link>
              <div className="flex-1">
                <Link
                  to={`/user/${encodeURIComponent(post.email)}`}
                  className="font-bold text-xl text-gray-900 hover:text-green-600 transition-colors block"
                >
                  {user?.name || "Unknown User"}
                </Link>
                <p className="text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-relaxed">
              {post.caption}
            </h1>
          </div>

          {/* Image */}
          {post.image && (
            <div className="w-full">
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-auto object-contain bg-gray-100"
                style={{ maxHeight: "70vh" }}
              />
            </div>
          )}

          {/* Actions */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                  hasUserLiked()
                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Heart className={`w-5 h-5 ${hasUserLiked() ? "fill-current" : ""}`} />
                {hasUserLiked() ? "Liked" : "Like"}
                <span className="bg-white/30 px-2 py-1 rounded-full text-sm">
                  {post.likeCount || 0}
                </span>
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                Comments
                <span className="bg-white/30 px-2 py-1 rounded-full text-sm">
                  {post.comment?.length || 0}
                </span>
              </button>
            </div>

            {/* Comments Section */}
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-gray-50 rounded-xl p-4 space-y-4"
              >
                <h3 className="font-bold text-gray-800 text-lg">Comments</h3>

                {post.comment?.length > 0 ? (
                  <div className="space-y-3">
                    {post.comment.map((c, i) => (
                      <div
                        key={i}
                        className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-start gap-2"
                      >
                        <p className="text-gray-700 flex-1">{c}</p>
                        {token && (
                          <button
                            onClick={() => handleDeleteComment(i)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            ❌
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No comments yet. Be the first to comment!
                  </p>
                )}

                {token && (
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleComment();
                        }
                      }}
                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    />
                    <button
                      onClick={handleComment}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-2 rounded-xl shadow-md hover:shadow-lg transition-all font-semibold"
                    >
                      Post
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SinglePost;


