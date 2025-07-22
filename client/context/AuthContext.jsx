import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/check`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        setAuthUser(res.data.user);
      } catch (error) {
        console.log("Auth check failed");
        setAuthUser(null);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (authUser) {
      const socket = io(import.meta.env.VITE_BACKEND_URL, {
        query: { userId: authUser._id },
      });

      setSocket(socket);

      socket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      return () => socket.close();
    }
  }, [authUser]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      localStorage.setItem("token", res.data.token);
      setAuthUser(res.data.user);
      return true;
    } catch (error) {
      return false;
    }
  };

  const signup = async (fullName, email, password, bio) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        { fullName, email, password, bio },
        { withCredentials: true }
      );

      localStorage.setItem("token", res.data.token);
      setAuthUser(res.data.user);
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update-profile`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      // ✅ Fix: Use "res.data.user" instead of just res.data to prevent logout
      setAuthUser(res.data.user || res.data);
    } catch (error) {
      console.error("Update profile failed", error);
    }
  };

  const logout = async () => {
    localStorage.removeItem("token");
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        authUser,
        setAuthUser,
        socket,
        onlineUsers,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
