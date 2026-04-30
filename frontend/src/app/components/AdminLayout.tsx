import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarTrigger, SidebarProvider } from './ui/sidebar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { AuthGuard } from './AuthGuard';
import { useAvatarUrl } from '../hooks/useImageUrl';
import { PageTransition } from './PageTransition';

import { Home, Users, Shield, FileText, Edit3, LogOut, BookOpen, MessageCircle, ImageIcon, Tags, Sparkles } from 'lucide-react';

function AdminAvatar({ src, alt }: { src?: string | null; alt?: string }) {
  const { url } = useAvatarUrl(src);
  if (!url) {
    return <span className="text-sm font-medium text-[#bfcbd9]">{alt?.charAt(0)?.toUpperCase()}</span>;
  }
  return <img src={url} alt={alt} />;
}

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = [
    { label: '仪表盘', icon: Home, path: '/admin' },
    { label: '用户管理', icon: Users, path: '/admin/users' },
    { label: '权限管理', icon: Shield, path: '/admin/permissions' },
    { label: '博客管理', icon: BookOpen, path: '/admin/blog' },
    { label: '字段管理', icon: Tags, path: '/admin/fields' },
    { label: '内容管理', icon: FileText, path: '/admin/content' },
    { label: '页面管理', icon: Edit3, path: '/admin/pages' },
    { label: '图库管理', icon: ImageIcon, path: '/admin/gallery' },
    { label: '留言管理', icon: MessageCircle, path: '/admin/guestbook' },
    { label: 'AI 管理', icon: Sparkles, path: '/admin/ai' },
  ];

  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
          <Sidebar className="bg-[#304156] border-r border-[#1f2d3d]">
            <SidebarContent className="flex flex-col bg-[#304156]">
              <div className="flex items-center gap-3 p-4 border-b border-[#1f2d3d]">
                <Avatar className="h-10 w-10 bg-[#1f2d3d]">
                  {user?.avatar ? (
                    <AdminAvatar src={user.avatar} alt={user.username} />
                  ) : (
                    <span className="text-sm font-medium text-[#bfcbd9]">
                      {user?.username?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-[#bfcbd9]/70">管理员</p>
                </div>
              </div>

              <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <div
                        key={item.path}
                        className={`flex items-center w-full text-sm font-normal py-2.5 px-4 rounded-md cursor-pointer transition-all ${
                          isActive
                            ? 'bg-[#1f2d3d] text-white font-medium border-l-2 border-[#409EFF]'
                            : 'text-[#bfcbd9] hover:bg-[#1f2d3d] hover:text-white'
                        }`}
                        onClick={() => navigate(item.path)}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.label}
                      </div>
                    );
                  })}
                </nav>
              </ScrollArea>

              <div className="p-4 border-t border-[#1f2d3d]">
                <div
                  className="flex items-center w-full text-sm font-normal py-2.5 px-4 rounded-md cursor-pointer text-[#bfcbd9] hover:bg-[#1f2d3d] hover:text-white transition-all"
                  onClick={onLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  退出登录
                </div>
              </div>
            </SidebarContent>
          </Sidebar>

          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <SidebarTrigger className="ml-2" />
                  <Badge variant="outline" className="text-xs">后台管理系统</Badge>
                </div>
                <div className="flex items-center space-x-4">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/home')}>
                    <span className="mr-1">←</span> 退出管理
                  </Button>
                </div>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-gray-900">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
};
