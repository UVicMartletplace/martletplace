import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useUser from "../../hooks/useUser";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useUser();

  // this should be fast enough the loading... never shows
  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/user/login" />;
};

export default PrivateRoute;
