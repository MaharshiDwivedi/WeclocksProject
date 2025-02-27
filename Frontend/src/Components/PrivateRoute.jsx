import { Navigate, Outlet } from "react-router-dom";
import jwtDecode from "jwt-decode"; // Install with `npm install jwt-decode`

const PrivateRoute = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // Current time in seconds

    // Check if token is expired
    if (decodedToken.exp < currentTime) {
      localStorage.removeItem("token"); // Clear expired token
      return <Navigate to="/login" replace />;
    }

    return <Outlet />;
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token"); // Clear invalid token
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;