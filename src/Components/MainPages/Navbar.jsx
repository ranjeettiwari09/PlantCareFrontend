import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, MessageCircle, Bell, Leaf, Home, User, LogOut, FileText } from "lucide-react";
import { AuthContext } from "../../Context/authContext";
import NotificationBell from "../RegularPage/NotificationBell";
import ChatBadge from "../RegularPage/ChatBadge";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { userDetails, logout, isLogin } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-green-800 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl text-green-200 font-bold tracking-wide">
              🌱
            </span>
            <span className="text-lg font-semibold text-white hidden sm:block">Plant Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/plant-care-tips"
              className="hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700"
            >
              🌿 Plant Care Tips
            </Link>
            <Link
              to="/post"
              className="hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700"
            >
              Latest Post
            </Link>
            {isLogin && (
              <>
                <NotificationBell />
                <Link
                  to="/chat"
                  className="relative hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700"
                >
                  Chat
                  <ChatBadge />
                </Link>
                <Link
                  to="/my-post"
                  className="hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700"
                >
                  My Post
                </Link>
                {userDetails?.type === "admin" && (
                  <Link
                    to="/register-request"
                    className="hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700"
                  >
                    Check Registration Request
                  </Link>
                )}
                {userDetails?.type === "user" && (
                  <>
                    <Link
                      to="/registerPage"
                      className="hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700"
                    >
                      Trip Registration
                    </Link>
                    <Link
                      to="/history"
                      className="hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700"
                    >
                      Trip History
                    </Link>
                  </>
                )}
                <Link
                  to="/profile"
                  className="hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:text-green-300 transition-colors duration-200 focus:outline-none py-2 px-3 rounded-md hover:bg-green-700"
                >
                  Logout
                </button>
              </>
            )}
            {!isLogin && (
              <>
                <Link
                  to="/login"
                  className="hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="hover:text-green-300 transition-colors duration-200 py-2 px-3 rounded-md hover:bg-green-700 bg-green-700 hover:bg-green-600"
                >
                  Signup
                </Link>
              </>
            )}
          </div>

          {/* Mobile Quick Actions - Always Visible */}
          <div className="md:hidden flex items-center gap-3">
            {isLogin && (
              <>
                <Link
                  to="/plant-care-tips"
                  className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                  aria-label="Plant Care Tips"
                >
                  <Leaf className="w-6 h-6" />
                </Link>
                <NotificationBell />
                <Link
                  to="/chat"
                  className="relative p-2 hover:bg-green-700 rounded-lg transition-colors"
                  aria-label="Chat"
                >
                  <MessageCircle className="w-6 h-6" />
                  <ChatBadge />
                </Link>
              </>
            )}
            {!isLogin && (
              <Link
                to="/plant-care-tips"
                className="p-2 hover:bg-green-700 rounded-lg transition-colors"
                aria-label="Plant Care Tips"
              >
                <Leaf className="w-6 h-6" />
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-green-700 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            {/* Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-2xl z-50 md:hidden overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🌱</span>
                    <span className="font-bold text-gray-900">Plant Connect</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                  >
                    <Home className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Home</span>
                  </Link>

                  <Link
                    to="/plant-care-tips"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                  >
                    <Leaf className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Plant Care Tips</span>
                  </Link>

                  <Link
                    to="/post"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                  >
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Latest Posts</span>
                  </Link>

                  {isLogin ? (
                    <>
                      <Link
                        to="/chat"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                      >
                        <MessageCircle className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Chat</span>
                        <ChatBadge />
                      </Link>

                      <Link
                        to="/my-post"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                      >
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="font-medium">My Posts</span>
                      </Link>

                      {userDetails?.type === "admin" && (
                        <Link
                          to="/register-request"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                        >
                          <FileText className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Registration Requests</span>
                        </Link>
                      )}

                      {userDetails?.type === "user" && (
                        <>
                          <Link
                            to="/registerPage"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                          >
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Trip Registration</span>
                          </Link>
                          <Link
                            to="/history"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                          >
                            <FileText className="w-5 h-5 text-green-600" />
                            <span className="font-medium">Trip History</span>
                          </Link>
                        </>
                      )}

                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                      >
                        <User className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 transition-colors text-red-600"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                      >
                        <User className="w-5 h-5 text-green-600" />
                        <span className="font-medium">Login</span>
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Signup</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
