import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  BarChart2,
  Users,
  FileText,
  MessageCircle,
  Activity,
  Eye,
} from 'lucide-react';
import { dashboardApi } from '../services/api';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'motion/react';

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
      {/* 装饰性背景 */}
      <div
        className="absolute -top-4 -right-4 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity duration-300"
        style={{ color }}
      >
        {icon}
      </div>

      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
          </div>
          <div className="p-4 rounded-2xl" style={{ backgroundColor: `${color}15` }}>
            <div style={{ color }}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// 模拟数据生成
const generateMockData = () => {
  // 过去 7 天的趋势数据
  const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return {
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      articles: Math.floor(Math.random() * 10) + 5,
      comments: Math.floor(Math.random() * 30) + 10,
      views: Math.floor(Math.random() * 500) + 200,
    };
  });

  // 分类统计
  const categoryStats = [
    { name: '技术', value: 35, color: '#3b82f6' },
    { name: '生活', value: 25, color: '#10b981' },
    { name: '随笔', value: 20, color: '#8b5cf6' },
    { name: '教程', value: 15, color: '#f59e0b' },
    { name: '其他', value: 5, color: '#6b7280' },
  ];

  return { weeklyTrend, categoryStats };
};

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
    }>,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mockData = useMemo(() => generateMockData(), []);

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

  // 骨架屏加载状态
  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="p-8 max-w-md text-center">
          <div className="text-red-500 mb-4">
            <Activity className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold mb-2">加载失败</h3>
          <p className="text-muted-foreground">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="用户总数"
          value={dashboardData.userCount.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
          color="#3b82f6"
          delay={0.1}
        />
        <StatCard
          title="文章总数"
          value={dashboardData.articleCount.toLocaleString()}
          icon={<FileText className="h-6 w-6" />}
          color="#10b981"
          delay={0.2}
        />
        <StatCard
          title="评论总数"
          value={dashboardData.commentCount.toLocaleString()}
          icon={<MessageCircle className="h-6 w-6" />}
          color="#8b5cf6"
          delay={0.3}
        />
        <StatCard
          title="总浏览量"
          value={dashboardData.totalViewCount.toLocaleString()}
          icon={<Eye className="h-6 w-6" />}
          color="#f59e0b"
          delay={0.4}
        />
      </div>

      {/* 趋势图和分类饼图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 7 天趋势 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-emerald-500" />
                近 7 天趋势
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={mockData.weeklyTrend}>
                  <defs>
                    <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="articles"
                    name="文章"
                    stroke="#10b981"
                    fill="url(#colorArticles)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="comments"
                    name="评论"
                    stroke="#8b5cf6"
                    fill="url(#colorComments)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#8b5cf6' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* 文章分类统计 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-blue-500" />
                文章分类分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="50%" height={250}>
                  <PieChart>
                    <Pie
                      data={mockData.categoryStats}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={8}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={800}
                    >
                      {mockData.categoryStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-4 flex-1">
                  {mockData.categoryStats.map((category, index) => (
                    <motion.div
                      key={category.name}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium flex-1">{category.name}</span>
                      <span className="text-sm font-semibold text-foreground">{category.value}%</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 最近活动 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-amber-500" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.slice(0, 6).map((activity, index) => {
                  const activityTime = activity.lastLoginTime || activity.createTime || '';
                  const activityType = activity.lastLoginTime ? '登录系统' : '注册成功';
                  const isLogin = !!activity.lastLoginTime;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + index * 0.05 }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${isLogin ? 'bg-blue-500' : 'bg-emerald-500'} ring-4 ${isLogin ? 'ring-blue-500/20' : 'ring-emerald-500/20'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{activity.username}</span>
                          <span className="text-muted-foreground"> {activityType}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{activityTime}</p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">暂无活动记录</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
