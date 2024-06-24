import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useUser from "../../hooks/useUser";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useUser();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/user/login" />;

  return <>{children}</>;
};

export default PrivateRoute;
