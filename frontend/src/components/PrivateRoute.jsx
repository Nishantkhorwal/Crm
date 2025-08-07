import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const token = localStorage.getItem("token"); // or sessionStorage
  const user = localStorage.getItem("user");
  const parsedUser = user ? JSON.parse(user) : null;
  const role = parsedUser?.role;
  console.log(role);

  return token ?  <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
