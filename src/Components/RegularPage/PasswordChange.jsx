import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../Context/authContext";

const PasswordChange = () => {
  const { userDetails } = useContext(AuthContext);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [token] = useState(localStorage.getItem("token"));
  const [timer, setTimer] = useState(0); // Timer in seconds
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);


  const baseUrl="https://plantcarebackend.onrender.com"
  // Generate 6-digit OTP
  const generateCode = () => Math.floor(100000 + Math.random() * 900000);

  // Start or reset the 45-second timer
  const startTimer = () => {
    setLoading(false);
    setTimer(45);
  };

  // Decrease timer every second
  useEffect(() => {
     const fetchUserProfile=async ()=>{
       const res=await axios.get(`${baseUrl}/auth/getuser`,{
         headers: { authorization: `Bearer ${token}` },
       })

       // Adjust this based on your backend response structure
       const data = res.data.user || res.data;
       setUser(data);

     }
   fetchUserProfile()
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Send OTP to user's email
  const handleSend = async () => {
    setLoading(true);
    if (!user.email) {
      setError("Email not found. Please log in again.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    const code = generateCode();
    setGeneratedCode(code.toString());
    setError("");
    setSuccess("");

    try {
      await axios.post(
        `${baseUrl}/mailer/send-otp`,
        {
          email: user.email,
          message: `Your verification code is: ${code}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Verification code sent to your email.");
      startTimer();
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP. Please try again.");
    }
  };

  // Handle password change with OTP verification
  const handleChangePassword = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }

    if (otp !== generatedCode) {
      setError("Invalid OTP.");
      return;
    }

    try {
      await axios.put(
        `${baseUrl}/auth/change-password`,
        {
          email: userDetails.email,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess("Password changed successfully!");
      setError("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
      setGeneratedCode("");
      setTimer(0);
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Failed to change password. Please try again.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Change Password</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      <div className="mb-4">
        <label htmlFor="newPassword" className="block text-sm font-medium">
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block text-sm font-medium">
          Confirm Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        onClick={handleSend}
        disabled={timer > 0}
        className={`w-full p-2 mb-4 text-white rounded ${
          timer > 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        {timer > 0
          ? `Resend OTP in ${timer}s`
          : loading
          ? "Sending OTP..."
          : "Send OTP"}
      </button>

      <div className="mb-4">
        <label htmlFor="otp" className="block text-sm font-medium">
          Enter OTP
        </label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        onClick={handleChangePassword}
        className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Change Password
      </button>
    </div>
  );
};

export default PasswordChange;