import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Smart City AI
              </Link>
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </Link>
              <Link
                to="/complaints"
                className="text-gray-600 hover:text-gray-900"
              >
                Complaints
              </Link>
              <Link
                to="/complaints/new"
                className="text-gray-600 hover:text-gray-900"
              >
                New Complaint
              </Link>
              <Link
                to="/ask"
                className="text-gray-600 hover:text-gray-900"
              >
                AI Assistant
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
