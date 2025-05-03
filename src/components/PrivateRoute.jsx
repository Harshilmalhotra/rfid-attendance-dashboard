import { Navigate } from "react-router-dom";

const PrivateRoute = ({ session, children }) => {
  return session ? children : <Navigate to="/auth" replace />;
};

export default PrivateRoute;
