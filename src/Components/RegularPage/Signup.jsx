import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



const baseUrl="https://plantcarebackend.onrender.com"
const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name || !age || !gender) {
      toast.error("⚠️ Please fill in all fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${baseUrl}/auth/signup`, {
        email,
        password,
        name,
        age,
        gender,
        profileImageUrl: ""
      });

      localStorage.setItem("token", res.data.token);

      toast.success("🎉 User Created Successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Creation failed:", error);
      if (error.response) {
        toast.error(`❌ Error ${error.response.status}: ${error.response.data}`, {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("❌ Creation failed: " + error.message, {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 px-4">
      {/* Toast Container */}
      <ToastContainer />

      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-green-200 sm:w-96">
        <h2 className="text-2xl font-bold text-center text-green-900 mb-6">
          Sign Up
        </h2>

        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm text-green-900 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your name"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm text-green-900 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your email"
          />
        </div>

        {/* Age */}
        <div className="mb-4">
          <label htmlFor="age" className="block text-sm text-green-900 mb-2">
            Age
          </label>
          <input
            type="number"
            id="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your age"
            min="1"
          />
        </div>

        {/* Gender */}
        <div className="mb-4">
          <label htmlFor="gender" className="block text-sm text-green-900 mb-2">
            Gender
          </label>
          <select
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="">-- Select Gender --</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm text-green-900 mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your password"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            onClick={handleSignup}
            className="w-full mt-3 bg-green-700 hover:bg-green-800 text-yellow-300 font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
