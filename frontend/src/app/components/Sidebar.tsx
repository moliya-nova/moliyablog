import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, Briefcase, Mail, Bot, LogIn, LogOut, User as UserIcon, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useChatFloat } from "./ChatFloat";

const API_BASE_URL = 'http://localhost:8080';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { isOpen: chatOpen, toggle: toggleChat } = useChatFloat();

  const navItems = [
    { name: "首页", path: "/home", icon: <Home size={20} /> },
    { name: "关于", path: "/home/about", icon: <User size={20} /> },
    { name: "博客", path: "/home/blog", icon: <Briefcase size={20} /> },
    { name: "留言", path: "/home/guestbook", icon: <Mail size={20} /> },
  ];

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
    <aside className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-4">
      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isActive(item.path)
              ? "bg-white text-gray-800 shadow-md"
              : "bg-gray-800/30 text-white hover:bg-gray-800/50"
          }`}
          title={item.name}
        >
          {item.icon}
        </Link>
      ))}

      {/* AI 浮动面板按钮 */}
      <button
        onClick={toggleChat}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          chatOpen
            ? "bg-white text-gray-800 shadow-md"
            : "bg-gray-800/30 text-white hover:bg-gray-800/50"
        }`}
        title="AI 助手"
      >
        <Bot size={20} />
      </button>

      {/* 登录/登出相关按钮 */}
      {isLoggedIn ? (
        <>
          {/* 登出按钮 */}
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-gray-800/30 flex items-center justify-center text-white hover:bg-gray-800/50 transition-colors"
            title="登出"
          >
            <LogOut size={20} />
          </button>
          {/* 管理员后台入口 */}
          {user?.admin && (
            <Link
              to="/admin"
              className="w-10 h-10 rounded-full bg-gray-800/30 flex items-center justify-center text-white hover:bg-gray-800/50 transition-colors"
              title="管理后台"
            >
              <Settings size={20} />
            </Link>
          )}
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="w-10 h-10 rounded-full bg-gray-800/30 flex items-center justify-center text-white hover:bg-gray-800/50 transition-colors"
            title="登录"
          >
            <LogIn size={20} />
          </Link>
          <Link
            to="/register"
            className="w-10 h-10 rounded-full bg-gray-800/30 flex items-center justify-center text-white hover:bg-gray-800/50 transition-colors"
            title="注册"
          >
            <UserIcon size={20} />
          </Link>
        </>
      )}
    </aside>
  );
}
