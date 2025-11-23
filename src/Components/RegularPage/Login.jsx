import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../Context/authContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const baseUrl="https://plantcarebackend.onrender.com"
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();

  if (!email || !password) {
    toast.error("Please fill in all fields");
    return;
  }

  try {
    setLoading(true);

    const res = await axios.post(`${baseUrl}/auth/login`, {
      email,
      password,
    });

    console.log("Response:", res.data);

    // Save user data via your context or directly
    login(res.data.token, res.data.user);

    // ✅ Store in browser localStorage
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("email", res.data.user.email);

    console.log("User logged in:", res.data.user.email);

    toast.success("Login successful!");
    navigate("/");
  } catch (error) {
    console.error("Login failed:", error);
    if (error.response) {
      toast.error(`Error ${error.response.status}: ${error.response.data}`);
    } else {
      toast.error("Login failed: " + error.message);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-green-50 px-4">
      <div className="w-full max-w-sm p-8 bg-white rounded-xl shadow-lg border border-green-200 sm:w-96">
        <h2 className="text-2xl font-bold text-center text-green-900 mb-6">
          Login
        </h2>

        {/* Email / Username */}
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-sm text-green-900 mb-2"
          >
            Username / Email
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your email"
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-sm text-green-900 mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder="Enter your password"
          />
        </div>

        {/* Button */}
        <div>
          <button
            onClick={handleLogin}
            className="w-full mt-3 bg-green-700 hover:bg-green-800 text-yellow-300 font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default Login;
