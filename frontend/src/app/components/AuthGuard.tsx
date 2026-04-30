import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // 检查用户是否已登录并且是管理员
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // 检查是否有token和用户信息
    if (!token || !userStr) {
      setIsAuthenticated(false);
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      // 检查用户是否为管理员
      if (!user.admin) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      // 如果解析用户信息失败，重定向到登录页面
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
    }
  }, []);
  
  // 加载中状态
  if (isAuthenticated === null) {
    return null;
  }
  
  // 未认证用户重定向到登录页面
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  // 已认证的管理员用户可以访问管理页面
  return <>{children}</>;
};
