import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-indigo-600">QR Generator</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Welcome, {user?.fullName}</span>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="px-4 py-2 bg-indigo-100 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-200 transition"
            >
              {user?.fullName.charAt(0).toUpperCase()}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
                <div className="px-4 py-3 border-b text-sm text-gray-700">
                  <p className="font-semibold">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">Role: {user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-semibold"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
