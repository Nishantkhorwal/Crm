import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;
  const role = parsedUser?.role;

  return token && role === "admin" ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
