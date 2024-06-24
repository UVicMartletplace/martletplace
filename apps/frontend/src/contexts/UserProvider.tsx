import { useState, useEffect, ReactNode } from "react";
import UserContext from "./userContext";
import { User } from "../types";
import axios from "axios";
import Cookies from "js-cookie";

const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const setUserAndStopLoading = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
    setLoading(false);
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem("user");
    Cookies.remove("token");

    try {
      await axios.post("/api/user/logout");
    } catch (error) {
      // If this fails, it should still act as though the user logged out since the cookie and user were cleared
      console.error("Logout request was unsuccessful");
    }
  };

  return (
    <UserContext.Provider
      value={{ user, setUser: setUserAndStopLoading, logout, loading }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
