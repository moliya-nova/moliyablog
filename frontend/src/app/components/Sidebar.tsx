import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, User, Briefcase, Mail, Bot, LogIn, LogOut, User as UserIcon, Settings, Network, Link2, Activity } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useChatFloat } from "./ChatFloat";

const API_BASE_URL = 'http://localhost:8080';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const { isOpen: chatOpen, toggle: toggleChat } = useChatFloat();

  const navItems = [
    { name: "首页", path: "/home", icon: <Home size={18} /> },
    { name: "关于", path: "/home/about", icon: <User size={18} /> },
    { name: "博客", path: "/home/blog", icon: <Briefcase size={18} /> },
    { name: "图谱", path: "/home/graph", icon: <Network size={18} /> },
    { name: "足迹", path: "/home/contributions", icon: <Activity size={18} /> },
    { name: "留言", path: "/home/guestbook", icon: <Mail size={18} /> },
    { name: "友链", path: "/home/friends", icon: <Link2 size={18} /> },
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
    <aside className="fixed left-0 top-0 h-screen w-16 z-50 flex flex-col items-center py-6 bg-transparent">
      {/* 导航项目 */}
      <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
                active
                  ? "bg-white/20 text-white border border-white/30 shadow-lg shadow-white/10"
                  : "text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
              }`}
              title={item.name}
            >
              {/* 活跃指示器 */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full shadow-lg shadow-white/50" />
              )}

              {/* 图标 */}
              <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>

              {/* 工具提示 */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-black/80 backdrop-blur-xl text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10">
                {item.name}
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45 border-l border-b border-white/10" />
              </div>
            </Link>
          );
        })}

        {/* 分隔线 */}
        <div className="w-8 h-px bg-white/20 my-2" />

        {/* AI 助手按钮 */}
        <button
          onClick={toggleChat}
          className={`group relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer backdrop-blur-sm ${
            chatOpen
              ? "bg-white/20 text-white border border-white/30"
              : "text-white/60 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/20"
          }`}
          title="AI 助手"
        >
          <Bot size={18} className="transition-transform duration-300 group-hover:scale-110" />

          {/* 工具提示 */}
          <div className="absolute left-full ml-4 px-3 py-2 bg-black/80 backdrop-blur-xl text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10">
            AI 助手
            <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45 border-l border-b border-white/10" />
          </div>
        </button>
      </nav>

      {/* 底部区域 */}
      <div className="flex flex-col items-center gap-2 w-full px-2">
        {/* 分隔线 */}
        <div className="w-8 h-px bg-white/20 mb-2" />

        {isLoggedIn ? (
          <>
            {/* 用户头像 */}
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white font-bold mb-2 border border-white/20">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {/* 管理后台入口 */}
            {user?.admin && (
              <Link
                to="/admin"
                className="group relative w-12 h-12 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20"
                title="管理后台"
              >
                <Settings size={18} className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90" />

                {/* 工具提示 */}
                <div className="absolute left-full ml-4 px-3 py-2 bg-black/80 backdrop-blur-xl text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10">
                  管理后台
                  <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45 border-l border-b border-white/10" />
                </div>
              </Link>
            )}

            {/* 登出按钮 */}
            <button
              onClick={handleLogout}
              className="group relative w-12 h-12 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer backdrop-blur-sm border border-transparent hover:border-white/20"
              title="登出"
            >
              <LogOut size={18} className="transition-transform duration-300 group-hover:scale-110" />

              {/* 工具提示 */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-black/80 backdrop-blur-xl text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10">
                登出
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45 border-l border-b border-white/10" />
              </div>
            </button>
          </>
        ) : (
          <>
            {/* 登录按钮 */}
            <Link
              to="/login"
              className="group relative w-12 h-12 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20"
              title="登录"
            >
              <LogIn size={18} className="transition-transform duration-300 group-hover:scale-110" />

              {/* 工具提示 */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-black/80 backdrop-blur-xl text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10">
                登录
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45 border-l border-b border-white/10" />
              </div>
            </Link>

            {/* 注册按钮 */}
            <Link
              to="/register"
              className="group relative w-12 h-12 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20"
              title="注册"
            >
              <UserIcon size={18} className="transition-transform duration-300 group-hover:scale-110" />

              {/* 工具提示 */}
              <div className="absolute left-full ml-4 px-3 py-2 bg-black/80 backdrop-blur-xl text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap shadow-xl border border-white/10">
                注册
                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45 border-l border-b border-white/10" />
              </div>
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
