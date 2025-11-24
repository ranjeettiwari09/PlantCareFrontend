import React, { useState, useEffect, useContext, useRef } from "react";
import { Bell, X, MessageCircle, FileText, AlertCircle, Trash2, ArrowLeft } from "lucide-react";
import { AuthContext } from "../../Context/authContext";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";


import BASE_URL from "../../config/api";
const NotificationBell = () => {
  const { userDetails, token, isLogin } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!isLogin || !token) return;
    
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/notifications/`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
      });
      setNotifications(res.data.notifications || []);
      
      // Update unread count
      const unreadRes = await axios.get(`${BASE_URL}/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
      });
      setUnreadCount(unreadRes.data.count || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  // Setup socket connection for real-time notifications
  useEffect(() => {
    if (!isLogin || !token) return;

    const s = io(`${BASE_URL}`, { transports: ["websocket"] });
    setSocket(s);

    s.on("connect", () => {
      s.emit("register", { token: token || localStorage.getItem("token") });
    });

    // Listen for new notifications
    s.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      s.off("notification:new");
      s.disconnect();
      setSocket(null);
    };
  }, [isLogin, token]);

  // Fetch notifications on mount and when token changes
  useEffect(() => {
    if (isLogin) {
      fetchNotifications();
      // Poll for notifications every 30 seconds as backup
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLogin, token]);

  // Close dropdown when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Only close on desktop, mobile uses full-screen modal
        if (window.innerWidth >= 768) {
          setIsOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile notification is open
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(
        `${BASE_URL}/notifications/read/${notificationId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );
      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put(
        `${BASE_URL}/notifications/read-all`,
        {},
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );
      
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/notifications/clear-all`,
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );
      
      if (response.data.success) {
        setNotifications([]);
        setUnreadCount(0);
      } else {
        throw new Error(response.data.error || "Failed to clear notifications");
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      const errorMessage = error.response?.data?.error || error.message || "Failed to clear notifications. Please try again.";
      alert(errorMessage);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }

    setIsOpen(false);

    // Navigate based on notification type
    if (notification.type === "message") {
      // Navigate to chat with specific user if relatedEmail is available
      if (notification.relatedEmail) {
        navigate(`/chat?user=${encodeURIComponent(notification.relatedEmail)}`);
      } else {
        navigate("/chat");
      }
    } else if (notification.type === "post") {
      // Navigate to specific post if relatedId is available
      if (notification.relatedId) {
        navigate(`/post/${notification.relatedId}`);
      } else {
        navigate("/post");
      }
    } else {
      navigate("/post");
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <MessageCircle className="w-5 h-5" />;
      case "post":
        return <FileText className="w-5 h-5" />;
      case "update":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Get color based on notification type
  const getNotificationColor = (type) => {
    switch (type) {
      case "message":
        return "bg-blue-100 text-blue-600";
      case "post":
        return "bg-green-100 text-green-600";
      case "update":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (!isLogin) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-green-700 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Desktop Dropdown */}
      {isOpen && (
        <>
          {/* Mobile Full-Screen Modal */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-[9999] md:hidden"
                onClick={() => setIsOpen(false)}
              />
            )}
          </AnimatePresence>
          
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`
              ${isMobile ? 'fixed inset-0 z-[10000] md:absolute md:inset-auto md:right-0 md:mt-2 md:w-80 md:max-h-96 md:rounded-lg' : 'absolute right-0 mt-2 w-80 md:w-96 rounded-lg max-h-96'}
              bg-white shadow-xl border border-gray-200 overflow-hidden flex flex-col
            `}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-green-500 to-blue-500 text-white flex-shrink-0">
              <div className="flex items-center gap-3">
                {/* Back button for mobile */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="md:hidden hover:bg-white/20 rounded p-1 transition-colors"
                  aria-label="Close notifications"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h3 className="font-bold text-lg">Notifications</h3>
              </div>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-sm hover:bg-white/20 rounded px-2 py-1 flex items-center gap-1 transition-colors"
                    title="Clear all notifications"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear All</span>
                  </button>
                )}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm hover:bg-white/20 rounded px-2 py-1 transition-colors"
                  >
                    <span className="hidden sm:inline">Mark all read</span>
                    <span className="sm:hidden">Read all</span>
                  </button>
                )}
                {/* Close button for desktop */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="hidden md:block hover:bg-white/20 rounded p-1 transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No notifications yet</p>
                  <p className="text-sm text-gray-400 mt-2">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`p-4 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50/50" : "bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2.5 rounded-xl ${getNotificationColor(
                            notification.type
                          )} flex-shrink-0`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-900 text-base">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(notification.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;

