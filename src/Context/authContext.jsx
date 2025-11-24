// src/Context/authContext.js
import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../config/api";

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin,setIsLogin]=useState(false) ///// testing for navbar
  const navigate = useNavigate();

  const Authenticate = async (token) => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/authenticate`, {
        headers: { authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const login = async(token, userDetail)=>{
      setIsLogin(true);
      setUserDetails(userDetail);      
  }

  const fetchUserProfile = async (token) => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/getuser`, {
        headers: { authorization: `Bearer ${token}` },
      });

      // Adjust this based on your backend response structure
      const data = res.data.user || res.data;
      setUserDetails(data);
      setIsLogin(true)
      console.log("Fetched userDetails:", data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
      setUserDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUserDetails(null);
    setIsLogin(false);
    navigate("/login");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    if (storedToken) {
      Authenticate(storedToken).then((valid) => {
        if (valid) {
          fetchUserProfile(storedToken);
        } else {
          setIsLoading(false);
          logout();
        }
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ userDetails, isLoading, token, Authenticate, logout,login,isLogin }}>
      {children}
    </AuthContext.Provider>
  );
};
