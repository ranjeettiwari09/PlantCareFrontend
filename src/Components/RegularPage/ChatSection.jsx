import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../../Context/authContext";
import { motion } from "framer-motion";
import { Send, Users, MessageCircle, Search } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import BASE_URL from "../../config/api";
const ChatSection = ({ initialUserEmail = null }) => {
  const { userDetails, token } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserList, setShowUserList] = useState(true); // Show user list by default
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      // Only scroll if user is near bottom (within 100px)
      if (isNearBottom || messages.length === 0) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  useEffect(() => {
    // Only scroll when messages actually change, not on every render
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/chat/conversations`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
      });
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      if (error.response?.status === 401) {
        toast.error("Please log in to view conversations");
      }
    }
  };

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await axios.get(`${BASE_URL}/chat/users`, {
        headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
      });
      setAllUsers(res.data.users || []);
      console.log("Fetched users:", res.data.users?.length || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      if (error.response?.status === 401) {
        toast.error("Please log in to view users");
      } else {
        toast.error("Failed to load users");
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch messages with selected user
  const fetchMessages = async (receiverEmail, shouldScroll = false) => {
    try {
      // URL encode the email to handle special characters
      const encodedEmail = encodeURIComponent(receiverEmail);
      const res = await axios.get(
        `${BASE_URL}/chat/messages/${encodedEmail}`,
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );
      const previousLength = messages.length;
      const newMessages = res.data.messages || [];
      setMessages(newMessages);
      
      // Only scroll if new messages were added (not just a refresh) and user is viewing
      if (shouldScroll && newMessages.length > previousLength) {
        setTimeout(() => scrollToBottom(), 200);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      if (error.response?.status === 401) {
        toast.error("Please log in to view messages");
      } else {
        toast.error("Failed to load messages");
      }
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      setLoading(true);
      const res = await axios.post(
        `${BASE_URL}/chat/send`,
        {
          receiverEmail: selectedUser.email,
          message: newMessage.trim(),
        },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("token")}` },
        }
      );

      if (res.data.success) {
        // Add the new message to the messages array
        setMessages(prevMessages => [...prevMessages, res.data.chat]);
        setNewMessage("");
        // Refresh conversations to update last message
        setTimeout(() => {
          fetchConversations();
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Select user to chat with
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    // Immediately fetch messages without delay
    fetchMessages(user.email, false);
    setShowUserList(false);
  };

  // Start new conversation
  const startNewChat = (user) => {
    handleSelectUser(user);
    fetchConversations();
  };

  // Poll for new messages
  useEffect(() => {
    if (selectedUser) {
      const interval = setInterval(() => {
        fetchMessages(selectedUser.email, true); // Pass true to allow scrolling only if new messages
        fetchConversations();
      }, 5000); // Poll every 5 seconds (reduced frequency to prevent excessive scrolling)

      return () => clearInterval(interval);
    }
  }, [selectedUser, token]);

  // Check if user is logged in
  const isLoggedIn = userDetails && (token || localStorage.getItem("token"));

  // Initial load
  useEffect(() => {
    if (isLoggedIn) {
      fetchConversations();
      fetchAllUsers();
    }
  }, [isLoggedIn, token]);

  // Auto-select user if initialUserEmail is provided
  useEffect(() => {
    if (initialUserEmail && allUsers.length > 0 && !selectedUser) {
      const userToSelect = allUsers.find(u => u.email === initialUserEmail);
      if (userToSelect) {
        handleSelectUser(userToSelect);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUserEmail, allUsers.length]);

  // Show user list by default if no conversations
  useEffect(() => {
    if (conversations.length === 0 && allUsers.length > 0) {
      setShowUserList(true);
    } else if (conversations.length > 0) {
      setShowUserList(false);
    }
  }, [conversations.length, allUsers.length]);

  // Filter users for search
  const filteredUsers = allUsers.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg mb-2">Please log in to chat</p>
            <p className="text-gray-500 text-sm">
              You need to be logged in to use the chat feature
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">Chat with Plant Lovers</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar - Conversations/Users List */}
        <div className={`absolute lg:relative inset-0 lg:inset-auto w-full lg:w-80 border-r border-gray-200 bg-gray-50 flex flex-col flex-shrink-0 z-10 transition-transform duration-300 ${
          selectedUser ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        }`}>
          {/* Toggle Buttons */}
          <div className="p-3 border-b border-gray-200 bg-white flex gap-2">
            <button
              onClick={() => setShowUserList(false)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                !showUserList
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Conversations
            </button>
            <button
              onClick={() => setShowUserList(true)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                showUserList
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Users
            </button>
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder={showUserList ? "Search users..." : "Search conversations..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-2">
            {showUserList ? (
              // All Users List
              <div className="p-2">
                <h3 className="text-sm font-semibold text-gray-600 mb-2 px-2">
                  All Users ({filteredUsers.length})
                </h3>
                {loadingUsers ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
                    <p className="text-sm">Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No users found</p>
                    {searchQuery && <p className="text-xs mt-1">Try a different search term</p>}
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <motion.div
                      key={user.email}
                      onClick={() => startNewChat(user)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 cursor-pointer transition mb-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          user.name?.charAt(0).toUpperCase() || "U"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {user.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              // Conversations List
              <div>
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Switch to "All Users" to start chatting</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <motion.div
                      key={conv.email}
                      onClick={() => handleSelectUser(conv)}
                      className={`flex items-center gap-3 p-3 cursor-pointer transition ${
                        selectedUser?.email === conv.email
                          ? "bg-green-100 border-l-4 border-green-500"
                          : "hover:bg-green-50"
                      }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold">
                          {conv.profileImageUrl ? (
                            <img
                              src={conv.profileImageUrl}
                              alt={conv.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            conv.name?.charAt(0).toUpperCase() || "U"
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800 truncate">
                            {conv.name || "Unknown"}
                          </p>
                          {conv.timestamp && (
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                              {new Date(conv.timestamp).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessage || "No messages"}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col absolute lg:relative inset-0 transition-transform duration-300 ${
          selectedUser ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center gap-3 justify-between">
                  <div className="flex items-center gap-3">
                    {/* Back Button for Mobile */}
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setShowUserList(false);
                      }}
                      className="lg:hidden w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors mr-2"
                      aria-label="Back to user list"
                    >
                      <svg
                        className="w-5 h-5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 flex items-center justify-center text-white font-bold">
                    {selectedUser.profileImageUrl ? (
                      <img
                        src={selectedUser.profileImageUrl}
                        alt={selectedUser.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      selectedUser.name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selectedUser.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">{selectedUser.email}</p>
                  </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto overscroll-contain p-4 bg-gray-50 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isOwnMessage = msg.senderEmail === userDetails?.email;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwnMessage
                              ? "bg-gradient-to-r from-green-500 to-blue-500 text-white"
                              : "bg-white text-gray-800 border border-gray-200"
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwnMessage ? "text-green-100" : "text-gray-500"
                            }`}
                          >
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newMessage.trim()}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageCircle className="w-20 h-20 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-600 text-lg mb-2">Select a conversation</p>
                <p className="text-gray-500 text-sm">
                  Choose a user from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSection;

