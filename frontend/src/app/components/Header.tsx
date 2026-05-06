import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAvatarUrl } from "../hooks/useImageUrl";

function AvatarImage({ src, alt, className }: { src?: string | null; alt?: string; className?: string }) {
  const { url } = useAvatarUrl(src);
  if (!url) {
    return <User className={className} />;
  }
  return <img src={url} alt={alt} className={className} />;
}

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();

  const navItems = [
    { name: "首页", path: "/home" },
    { name: "博客", path: "/home/blog" },
    { name: "关于", path: "/home/about" },
    { name: "友链", path: "/home/friends" },
    { name: "AI", path: "/home/chat" }
  ];

  useEffect(() => {
    const handleLoginStatusChange = () => {
    };
    window.addEventListener('loginStatusChanged', handleLoginStatusChange as EventListener);
    return () => {
      window.removeEventListener('loginStatusChanged', handleLoginStatusChange as EventListener);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === "/home") {
      return location.pathname === "/home";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/home" className="flex items-center space-x-2">
              <span className="text-2xl">📝</span>
              <span className="font-semibold text-lg">我的博客</span>
            </Link>
            {isLoggedIn && (
              <div className="flex items-center space-x-2 ml-4">
                {user?.avatar ? (
                    <AvatarImage
                      src={user.avatar}
                      alt={user.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-gray-400" />
                  )}
                <span className="text-gray-600">{user?.username || '用户'}</span>
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-colors ${
                  isActive(item.path)
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isLoggedIn && user?.admin && (
              <Link
                to="/admin"
                className={`transition-colors ${
                  isActive("/admin")
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                管理
              </Link>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>登出</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/register"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>注册</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>登录</span>
                </Link>
              </div>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`transition-colors ${
                    isActive(item.path)
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {isLoggedIn ? (
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center space-x-2">
                    {user?.avatar ? (
                      <AvatarImage
                        src={user.avatar}
                        alt={user.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                    <span className="text-gray-600">{user?.username || '用户'}</span>
                  </div>
                  {user?.admin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`transition-colors ${
                        isActive("/admin")
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      管理
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>登出</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>注册</span>
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>登录</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}