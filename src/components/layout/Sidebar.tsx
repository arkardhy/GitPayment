import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Users, Calendar, DollarSign, PlusCircle, LogOut, Lock, Building2, History } from 'lucide-react';
import { storage } from '../../utils/storage';
import { toast } from 'react-hot-toast';
import { usePasswordProtection } from '../../contexts/PasswordProtectionContext';
import { PasswordModal } from '../PasswordModal';
import { cn } from '../../utils/cn';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isUnlocked, unlock, lock } = usePasswordProtection();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [attemptedPath, setAttemptedPath] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    storage.clearAdminToken();
    lock();
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
    setIsMobileMenuOpen(false);
  };

  const handlePasswordSubmit = (password: string) => {
    if (unlock(password) && attemptedPath) {
      setShowPasswordModal(false);
      navigate(attemptedPath);
    }
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: <DollarSign className="w-5 h-5 mr-3" />,
      label: 'Dashboard',
      protected: false
    },
    {
      path: '/admin/attendance',
      icon: <Calendar className="w-5 h-5 mr-3" />,
      label: 'Attendance',
      protected: false
    },
    {
      path: '/admin/payment-history',
      icon: <History className="w-5 h-5 mr-3" />,
      label: 'Payment History',
      protected: false
    },
    {
      path: '/admin/employees',
      icon: <Users className="w-5 h-5 mr-3" />,
      label: 'Employees',
      protected: true
    },
    {
      path: '/admin/add-employee',
      icon: <PlusCircle className="w-5 h-5 mr-3" />,
      label: 'Add Employee',
      protected: true
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-[#105283] text-white"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-gray-200 bg-[#105283] text-white">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Trans Kota Kita</h1>
              <p className="text-sm text-[#6EC7F7]">Payment System</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-6 px-2">
          {menuItems.map((item) => (
            item.protected ? (
              <button
                key={item.path}
                onClick={() => handleProtectedNavigation(item.path)}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-colors",
                  location.pathname === item.path
                    ? "text-white bg-[#2D85B2]"
                    : "text-[#46525A] hover:bg-[#F8FAFC] hover:text-[#105283]"
                )}
              >
                {item.icon}
                {item.label}
                {!isUnlocked && <Lock className="w-4 h-4 ml-auto text-gray-400" />}
              </button>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg mb-1 transition-colors",
                    isActive
                      ? "text-white bg-[#2D85B2]"
                      : "text-[#46525A] hover:bg-[#F8FAFC] hover:text-[#105283]"
                  )
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            )
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-white bg-[#105283] rounded-lg hover:bg-[#2D85B2] transition-colors"
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