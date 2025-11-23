import React from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import ChatSection from "./ChatSection";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const userEmail = searchParams.get("user");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            💬 Chat with Plant Lovers
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with other plant enthusiasts, share your experiences, and get help with your plant care journey!
          </p>
        </motion.div>

        {/* Chat Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <ChatSection initialUserEmail={userEmail ? decodeURIComponent(userEmail) : null} />
        </motion.div>
      </div>
    </div>
  );
};

export default Chat;



