import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../Context/authContext";
import axios from "axios";
import { io } from "socket.io-client";

const baseUrl="https://plantcarebackend.onrender.com"
const ChatBadge = () => {
  const { userDetails, token, isLogin } = useContext(AuthContext);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  // Fetch total unread messages count
  const fetchUnreadCount = async () => {
    if (!isLogin || !token) {
      setUnreadCount(0);
      return;
    }

    try {
      const res = await axios.get(`${baseUrl}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
      });
      
      const conversations = res.data.conversations || [];
      // Sum up all unread counts from conversations
      const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setUnreadCount(0);
    }
  };

  // Setup socket connection for real-time updates
  useEffect(() => {
    if (!isLogin || !token) return;

    const s = io(`${baseUrl}`, { transports: ["websocket"] });
    setSocket(s);

    s.on("connect", () => {
      s.emit("register", { token: token || localStorage.getItem("token") });
    });

    // Listen for new notifications which may include new messages
    s.on("notification:new", (notification) => {
      if (notification.type === "message") {
        // Refresh unread count when new message notification arrives
        fetchUnreadCount();
      }
    });

    return () => {
      s.off("notification:new");
      s.disconnect();
      setSocket(null);
    };
  }, [isLogin, token]);

  // Fetch unread count on mount and when token changes
  useEffect(() => {
    if (isLogin) {
      fetchUnreadCount();
      // Poll for updates every 5 seconds as backup
      const interval = setInterval(fetchUnreadCount, 5000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isLogin, token]);

  if (!isLogin || unreadCount === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
      {unreadCount > 9 ? "9+" : unreadCount}
    </span>
  );
};

export default ChatBadge;

