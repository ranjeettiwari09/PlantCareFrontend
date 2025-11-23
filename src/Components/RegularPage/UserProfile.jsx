import React, { useEffect, useMemo, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, UserMinus, MessageCircle, Users, UserCheck } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../Context/authContext";


const baseUrl="https://plantcarebackend.onrender.com"
const UserProfile = () => {
  const { email } = useParams();
  const decodedEmail = decodeURIComponent(email || "");
  const { userDetails, token, isLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);

  // Fetch follow status and counts
  const fetchFollowData = async () => {
    if (!isLogin || !token) return;

    try {
      const [statusRes, countsRes] = await Promise.all([
        axios.get(`${baseUrl}/follow/status/${encodeURIComponent(decodedEmail)}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${baseUrl}/follow/counts/${encodeURIComponent(decodedEmail)}`),
      ]);

      setIsFollowing(statusRes.data.isFollowing || false);
      setFollowingCount(countsRes.data.followingCount || 0);
      setFollowersCount(countsRes.data.followersCount || 0);
    } catch (error) {
      console.error("Error fetching follow data:", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const [usersRes, postsRes] = await Promise.all([
          axios.get(`${baseUrl}/auth/alluser`),
          axios.get(`${baseUrl}/posts/getposts`),
        ]);

        const users = usersRes.data.users || [];
        const foundUser = users.find((u) => u.email === decodedEmail) || null;
        setUser(foundUser);

        const posts = postsRes.data.posts || [];
        const filtered = posts.filter((p) => p.email === decodedEmail);
        setUserPosts(filtered);

        // Fetch follow data if logged in
        if (isLogin) {
          await fetchFollowData();
        }
      } catch (e) {
        setError("Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [decodedEmail, isLogin, token]);

  // Handle follow/unfollow
  const handleFollow = async () => {
    if (!isLogin || !token) {
      alert("Please login to follow users");
      return;
    }

    setIsLoadingFollow(true);
    try {
      const endpoint = isFollowing ? "unfollow" : "follow";
      await axios.post(
        `${baseUrl}/follow/${endpoint}/${encodeURIComponent(decodedEmail)}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      alert(error.response?.data?.error || "Failed to update follow status");
    } finally {
      setIsLoadingFollow(false);
    }
  };

  // Navigate to chat with this user
  const handleChat = () => {
    navigate(`/chat?user=${encodeURIComponent(decodedEmail)}`);
  };

  const postCount = useMemo(() => userPosts.length, [userPosts]);

  if (loading) {
    return <div className="p-6 max-w-3xl mx-auto">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 max-w-3xl mx-auto text-red-600">{error}</div>;
  }

  if (!user) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">User not found</h1>
        <p className="text-gray-700">No user with email {decodedEmail}</p>
      </div>
    );
  }

  const isOwnProfile = isLogin && userDetails?.email === decodedEmail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-200"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Image */}
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-green-400 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-4xl shadow-lg">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
            
            {/* User Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{user.name}</h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
                
                {/* Action Buttons */}
                {isLogin && !isOwnProfile && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleFollow}
                      disabled={isLoadingFollow}
                      className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                        isFollowing
                          ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                          : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
                      }`}
                    >
                      {isLoadingFollow ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isFollowing ? (
                        <>
                          <UserMinus className="w-5 h-5" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5" />
                          Follow
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleChat}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Message
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">{postCount}</span>
                  <span className="text-gray-600">posts</span>
                </div>
                <button
                  onClick={() => navigate(`/user/${encodeURIComponent(decodedEmail)}/followers`)}
                  className="flex items-center gap-2 hover:text-green-600 transition-colors cursor-pointer"
                >
                  <Users className="w-5 h-5" />
                  <span className="font-bold text-gray-900">{followersCount}</span>
                  <span className="text-gray-600">followers</span>
                </button>
                <button
                  onClick={() => navigate(`/user/${encodeURIComponent(decodedEmail)}/following`)}
                  className="flex items-center gap-2 hover:text-green-600 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-5 h-5" />
                  <span className="font-bold text-gray-900">{followingCount}</span>
                  <span className="text-gray-600">following</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        {postCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userPosts.map((p, index) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200 cursor-pointer"
                onClick={() => navigate(`/post/${p._id}`)}
              >
                {p.image && (
                  <div className="w-full h-64 overflow-hidden bg-gray-100">
                    <img 
                      src={p.image} 
                      alt={p.caption} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-2">{p.caption}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>❤️ {p.likeCount || 0}</span>
                    <span>💬 {p.comment?.length || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200"
          >
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-700 text-lg font-medium">This user hasn't posted yet.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;


