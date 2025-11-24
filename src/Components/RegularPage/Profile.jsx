import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Calendar, Lock, Key, Save, Eye, EyeOff, Users, UserCheck, FileText } from "lucide-react";
import axios from "axios";
import photo from "..//../assets/sddefault.jpg"


import BASE_URL from "../../config/api";
const Profile = () => {
  const [user, setUser] = useState({});
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const navigate = useNavigate();

  const { gender, email, type } = user;

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("age", age);
      formData.append("password", password);
      formData.append("gender", gender);
      formData.append("email", email);
      formData.append("type", type);
      if (image) {
        formData.append("profileImage", image);
      }

      await axios.put(`${BASE_URL}/auth/update`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Updated Successfully");
    } catch (error) {
      alert(error.message);
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      setToken(token);
      try {
        if (token) {
          const res = await axios.get(`${BASE_URL}/auth/getuser`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = res.data;
          setUser(data);
          setName(data.name || "");
          setAge(data.age || 0);
          setPassword(data.password || "");
          if (data.profileImageUrl) {
            setPreview(data.profileImageUrl);
          }

          // Fetch followers and following counts
          if (data.email) {
            try {
              const countsRes = await axios.get(
                `${BASE_URL}/follow/counts/${encodeURIComponent(data.email)}`
              );
              setFollowingCount(countsRes.data.followingCount || 0);
              setFollowersCount(countsRes.data.followersCount || 0);
            } catch (error) {
              console.error("Error fetching follow counts:", error);
            }
          }
        }
      } catch (error) {
        console.log(error.response ? error.response.data : error.message);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 px-4 py-8">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 via-green-600 to-blue-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">User Profile</h2>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">

          {/* Profile Image Upload */}
          <div className="mb-8 text-center">
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={preview || photo}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-green-400 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => document.getElementById("fileInput").click()}
              />
              <div className="absolute bottom-0 right-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-4 border-white cursor-pointer hover:bg-green-600 transition-colors">
                <User className="w-5 h-5 text-white" />
              </div>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setImage(file);
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-3 font-medium">Click the image to change</p>
          </div>

          {/* Stats Section - Followers, Following, My Posts */}
          <div className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-around">
              {/* Followers */}
              <button
                onClick={() => navigate(`/user/${encodeURIComponent(email)}/followers`)}
                className="text-center hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-gray-900">{followersCount}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Followers</p>
              </button>

              {/* Following */}
              <button
                onClick={() => navigate(`/user/${encodeURIComponent(email)}/following`)}
                className="text-center hover:scale-105 transition-transform cursor-pointer"
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">{followingCount}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Following</p>
              </button>

              {/* My Posts Button */}
              <div className="text-center">
                <button
                  onClick={() => navigate("/my-post")}
                  className="flex flex-col items-center gap-1 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-semibold">My Posts</span>
                </button>
              </div>
            </div>
          </div>

          {/* Grid Layout for Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-green-600" />
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your name"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Mail className="w-4 h-4 text-green-600" />
                Email
              </label>
              <input
                type="email"
                value={user?.email || "N/A"}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Age */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-green-600" />
                Age
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="Enter your age"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-green-600" />
                Gender
              </label>
              <input
                type="text"
                value={user?.gender || "N/A"}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Lock className="w-4 h-4 text-green-600" />
                Password
              </label>
              <div className="flex items-center gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  readOnly
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition-colors flex items-center gap-2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <Link to="/changepassword" className="text-green-600 hover:text-green-700 text-sm font-medium inline-flex items-center gap-1 transition-colors">
                <Key className="w-4 h-4" />
                Change Password
              </Link>
            </div>

            {/* Role */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 text-green-600" />
                Role
              </label>
              <input
                type="text"
                value={user?.type || "N/A"}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 focus:outline-none cursor-not-allowed capitalize"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8">
            <button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
