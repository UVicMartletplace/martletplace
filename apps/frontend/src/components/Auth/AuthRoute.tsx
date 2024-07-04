import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useUser from "../../hooks/useUser";

const AuthRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user && !loading ? <Navigate to="/user/profile" /> : <>{children}</>;
};

export default AuthRoute;
