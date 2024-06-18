import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  username: string;
  name: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // gets the token from the cookie, decodes it and sets the user
    const token = Cookies.get("token");
    if (token) {
      try {
        const decoded: User = jwtDecode<User>(token);
        setUser({
          id: decoded.id,
          username: decoded.username,
          name: decoded.name,
        });
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
    setLoading(false);
  }, []);

  // this should automatically redirect the user, but te logout button should still navigate to /login
  const logout = () => {
    setUser(null);
    Cookies.remove("token");
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used from within a UserProvider");
  }
  return context;
};

// --- Delete everything below when backend auth is implemented ---
const defaultUser: User = {
  id: "123",
  username: "defaultUser",
  name: "Default User",
};

export const getDefaultUser = () => defaultUser;
