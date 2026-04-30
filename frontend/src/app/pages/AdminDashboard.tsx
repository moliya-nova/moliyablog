import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { BarChart2, Users, FileText, MessageCircle } from 'lucide-react';
import { dashboardApi } from '../services/api';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card className="p-6 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
      <div className="p-3 rounded-full" style={{ backgroundColor: `${color}20` }}>
        {icon}
      </div>
    </div>
  </Card>
);

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    userCount: 0,
    articleCount: 0,
    commentCount: 0,
    totalViewCount: 0,
    recentActivities: [] as Array<{
      username: string;
      lastLoginTime?: string;
      createTime?: string;
    }>
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardApi.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error('获取仪表盘数据失败:', err);
        setError('获取数据失败，请刷新页面重试');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">加载中...</p>
                  <p className="text-2xl font-bold mt-1">--</p>
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: '#3b82f620' }}>
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">最近活动</h3>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium">加载中...</p>
                  <p className="text-xs text-gray-500">--</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <p className="text-red-500">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="用户总数" 
          value={dashboardData.userCount.toString()} 
          icon={<Users className="h-6 w-6 text-blue-500" />} 
          color="#3b82f6"
        />
        <StatCard 
          title="文章总数" 
          value={dashboardData.articleCount.toString()} 
          icon={<FileText className="h-6 w-6 text-green-500" />} 
          color="#10b981"
        />
        <StatCard 
          title="评论总数" 
          value={dashboardData.commentCount.toString()} 
          icon={<MessageCircle className="h-6 w-6 text-purple-500" />} 
          color="#8b5cf6"
        />
        <StatCard 
          title="浏览量" 
          value={dashboardData.totalViewCount.toString()} 
          icon={<BarChart2 className="h-6 w-6 text-amber-500" />} 
          color="#f59e0b"
        />
      </div>
      
      {/* 最近活动 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">最近活动</h3>
        <div className="space-y-4">
          {dashboardData.recentActivities.length > 0 ? (
            dashboardData.recentActivities.map((activity, index) => {
              const activityTime = activity.lastLoginTime || activity.createTime || '';
              const activityType = activity.lastLoginTime ? '登录系统' : '注册成功';
              const activityColor = activity.lastLoginTime ? 'bg-blue-500' : 'bg-green-500';
              
              return (
                <div key={index} className="flex items-start">
                  <div className={`w-2 h-2 rounded-full ${activityColor} mt-2 mr-3`}></div>
                  <div>
                    <p className="text-sm font-medium">用户 {activity.username} {activityType}</p>
                    <p className="text-xs text-gray-500">{activityTime}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">暂无活动记录</p>
          )}
        </div>
      </Card>
    </div>
  );
};
