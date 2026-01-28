import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../features/auth/authStore";

export const AppLayout = () => {
  const navigate = useNavigate();
  const { token, role, logout } = useAuthStore();

  return (
    <div className="layout-shell">
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};
