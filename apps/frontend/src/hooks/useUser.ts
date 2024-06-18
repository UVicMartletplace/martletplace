import { useContext } from "react";
import UserContext from "../contexts/userContext";
import { UserContextType } from "../types";

const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used from within a UserProvider");
  }
  return context;
};

export default useUser;
