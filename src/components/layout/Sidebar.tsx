import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Users, Calendar, DollarSign, PlusCircle, LogOut, Lock } from 'lucide-react';
import { storage } from '../../utils/storage';
import { toast } from 'react-hot-toast';
import { usePasswordProtection } from '../../contexts/PasswordProtectionContext';
import { PasswordModal } from '../PasswordModal';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isUnlocked, unlock, lock } = usePasswordProtection();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [attemptedPath, setAttemptedPath] = useState<string | null>(null);

  const handleLogout = () => {
    storage.clearAdminToken();
    lock(); // Lock employee access when logging out
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleProtectedNavigation = (path: string) => {
    if (!isUnlocked) {
      setAttemptedPath(path);
      setShowPasswordModal(true);
      return;
    }
    navigate(path);
  };

  const handlePasswordSubmit = (password: string) => {
    if (unlock(password) && attemptedPath) {
      setShowPasswordModal(false);
      navigate(attemptedPath);
    }
  };

  return (
    <>
      <div className="h-screen w-64 bg-white border-r border-gray-200 fixed left-0 top-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Trans Kota Kita</h1>
          <p className="text-sm text-gray-500">Payment System</p>
        </div>
        
        <nav className="mt-6">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium ${
                isActive
                  ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <DollarSign className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/attendance"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium ${
                isActive
                  ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <Calendar className="w-5 h-5 mr-3" />
            Attendance
          </NavLink>

          <button
            onClick={() => handleProtectedNavigation('/admin/employees')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium ${
              location.pathname === '/admin/employees'
                ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-5 h-5 mr-3" />
            Employees
            {!isUnlocked && <Lock className="w-4 h-4 ml-auto text-gray-400" />}
          </button>

          <button
            onClick={() => handleProtectedNavigation('/admin/add-employee')}
            className={`w-full flex items-center px-6 py-3 text-sm font-medium ${
              location.pathname === '/admin/add-employee'
                ? 'text-blue-600 bg-blue-50 border-r-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <PlusCircle className="w-5 h-5 mr-3" />
            Add Employee
            {!isUnlocked && <Lock className="w-4 h-4 ml-auto text-gray-400" />}
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </div>

      {showPasswordModal && (
        <PasswordModal
          onSubmit={handlePasswordSubmit}
          onClose={() => setShowPasswordModal(false)}
        />
      )}
    </>
  );
}