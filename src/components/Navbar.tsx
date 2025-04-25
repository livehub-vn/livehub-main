import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.png';
import { useAuthStore } from '../stores/authStore';
import { AccountRole } from '../types/Account';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };
  
  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <img
                className="h-10 w-auto"
                src={Logo}
                alt="LiveHub Logo"
              />
            </Link>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <div className="flex space-x-8">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-500 px-3 py-2 text-sm font-medium"
              >
                Trang chủ
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    to="/services"
                    className="text-gray-600 hover:text-blue-500 px-3 py-2 text-sm font-medium"
                  >
                    Dịch Vụ
                  </Link>
                  
                  {user?.metadata.role === AccountRole.SUPPLIER && (
                    <Link
                      to="/demands"
                      className="text-gray-600 hover:text-blue-500 px-3 py-2 text-sm font-medium"
                    >
                      Nhu Cầu
                    </Link>
                  )}
                  
                  {user?.metadata.role === AccountRole.BUYER && (
                    <Link
                      to="/demands/new"
                      className="text-gray-600 hover:text-blue-500 px-3 py-2 text-sm font-medium"
                    >
                      Đăng nhu cầu
                    </Link>
                  )}

                  {user?.metadata.role === AccountRole.SUPPLIER && (
                    <Link
                      to="/services/create"
                      className="text-gray-600 hover:text-blue-500 px-3 py-2 text-sm font-medium"
                    >
                      Đăng dịch vụ
                    </Link>
                  )}
                </>
              )}
              
              <Link
                to="/contact"
                className="text-gray-600 hover:text-blue-500 px-3 py-2 text-sm font-medium"
              >
                Liên hệ
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {!isAuthenticated ? (
              <div className="flex space-x-2">
                <Link
                  to="/login"
                  className="text-[var(--text-primary)] hover:text-[var(--primary-500)] px-3 py-2 text-sm font-medium"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)] px-4 py-2 rounded-md text-sm font-medium"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-gray-600 hover:text-blue-500 px-3 py-2 text-sm font-medium"
                >
                  <span className="mr-1">{user?.metadata.fullName || 'Người dùng'}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Hồ sơ của bạn
                    </Link>
                    {user?.metadata.role === AccountRole.BUYER && (
                      <Link
                        to="/my-demands"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Nhu cầu của tôi
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 