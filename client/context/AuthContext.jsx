import React, { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState("");

  const backendURL = import.meta.env.VITE_BACKEND_URL; // ✅ use VITE_BACKEND_URL

  const login = async (endpoint, payload) => {
    try {
      const { data } = await axios.post(`${backendURL}/api/auth/${endpoint}`, payload);

      if (data.success) {
        setAuthUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        toast.success("Login successful");
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      return false;
    }
  };

  const logout = () => {
    setAuthUser(null);
    setToken("");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) return;

      const { data } = await axios.get(`${backendURL}/api/auth/check`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      if (data.success) {
        setAuthUser(data.user);
      } else {
        logout();
      }
    } catch (error) {
      logout();
      toast.error("Authentication failed");
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      checkAuth();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
