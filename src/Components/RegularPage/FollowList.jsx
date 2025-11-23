import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, UserPlus, UserMinus, MessageCircle, Users, UserCheck } from "lucide-react";
import axios from "axios";
import { AuthContext } from "../../Context/authContext";


const baseUrl="https://plantcarebackend.onrender.com"
const FollowList = () => {
  const { type, email } = useParams(); // type = "followers" or "following"
  const { token, userDetails, isLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const decodedEmail = decodeURIComponent(email || "");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followStatuses, setFollowStatuses] = useState({}); // Track follow status for each user
  const [isLoadingFollow, setIsLoadingFollow] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [type, decodedEmail]);

  // Fetch follow statuses for all users
  useEffect(() => {
    if (isLogin && token && users.length > 0) {
      fetchFollowStatuses();
    }
  }, [users, isLogin, token]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl}/auth/alluser`);
      const allUsers = res.data.users || [];

      // Get the target user to find their followers/following
      const targetUser = allUsers.find(u => u.email === decodedEmail);
      
      if (!targetUser) {
        setUsers([]);
        return;
      }

      // Get the list based on type
      const userList = type === "followers" 
        ? (targetUser.followers || [])
        : (targetUser.following || []);

      // Map emails to user objects
      const userObjects = userList
        .map(email => allUsers.find(u => u.email === email))
        .filter(Boolean);

      setUsers(userObjects);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStatuses = async () => {
    if (!isLogin || !token) return;

    try {
      const statusPromises = users.map(async (user) => {
        try {
          const res = await axios.get(
            `${baseUrl}/follow/status/${encodeURIComponent(user.email)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          return { email: user.email, isFollowing: res.data.isFollowing || false };
        } catch (error) {
          return { email: user.email, isFollowing: false };
        }
      });

      const statuses = await Promise.all(statusPromises);
      const statusMap = {};
      statuses.forEach(s => {
        statusMap[s.email] = s.isFollowing;
      });
      setFollowStatuses(statusMap);
    } catch (error) {
      console.error("Error fetching follow statuses:", error);
    }
  };

  const handleFollow = async (userEmail) => {
    if (!isLogin || !token) {
      alert("Please login to follow users");
      return;
    }

    setIsLoadingFollow(prev => ({ ...prev, [userEmail]: true }));
    try {
      const isFollowing = followStatuses[userEmail];
      const endpoint = isFollowing ? "unfollow" : "follow";
      
      await axios.post(
        `${baseUrl}/follow/${endpoint}/${encodeURIComponent(userEmail)}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFollowStatuses(prev => ({
        ...prev,
        [userEmail]: !isFollowing
      }));

      // Refresh the list to update counts
      fetchUsers();
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      alert(error.response?.data?.error || "Failed to update follow status");
    } finally {
      setIsLoadingFollow(prev => ({ ...prev, [userEmail]: false }));
    }
  };

  const handleMessage = (userEmail) => {
    navigate(`/chat?user=${encodeURIComponent(userEmail)}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-200"
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div className="flex items-center gap-3">
              {type === "followers" ? (
                <Users className="w-6 h-6 text-green-600" />
              ) : (
                <UserCheck className="w-6 h-6 text-blue-600" />
              )}
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {type === "followers" ? "Followers" : "Following"}
              </h1>
            </div>
          </div>
          <p className="text-gray-600">
            {users.length} {users.length === 1 ? "user" : "users"}
          </p>
        </motion.div>

        {/* Users List */}
        {users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-200"
          >
            <div className="text-6xl mb-4">
              {type === "followers" ? "👥" : "🔍"}
            </div>
            <p className="text-xl text-gray-700 font-medium mb-2">
              No {type === "followers" ? "followers" : "following"} yet
            </p>
            <p className="text-gray-500">
              {type === "followers" 
                ? "This user doesn't have any followers yet."
                : "This user isn't following anyone yet."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {users.map((user, index) => (
              <motion.div
                key={user.email}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-4 border border-gray-200"
              >
                <div className="flex items-center gap-4">
                  {/* Profile Image */}
                  <div
                    onClick={() => navigate(`/user/${encodeURIComponent(user.email)}`)}
                    className="cursor-pointer hover:scale-110 transition-transform"
                  >
                    {user.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-green-400 shadow-md"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3
                      onClick={() => navigate(`/user/${encodeURIComponent(user.email)}`)}
                      className="font-bold text-lg text-gray-900 hover:text-green-600 transition-colors cursor-pointer truncate"
                    >
                      {user.name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>

                  {/* Action Buttons */}
                  {isLogin && userDetails?.email !== user.email && (
                    <div className="flex items-center gap-2">
                      {followStatuses[user.email] !== undefined && (
                        <button
                          onClick={() => handleFollow(user.email)}
                          disabled={isLoadingFollow[user.email]}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                            followStatuses[user.email]
                              ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                              : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl"
                          }`}
                        >
                          {isLoadingFollow[user.email] ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : followStatuses[user.email] ? (
                            <>
                              <UserMinus className="w-4 h-4" />
                              <span className="hidden sm:inline">Unfollow</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4" />
                              <span className="hidden sm:inline">Follow</span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleMessage(user.email)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Message</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowList;


