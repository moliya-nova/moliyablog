import React, { useMemo, useEffect, useState, Component, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import {
  Activity,
  Calendar,
  Target,
  TrendingUp,
  BookOpen,
  Sparkles,
  Flame,
  Zap,
  Star,
  Sun,
  Moon,
} from 'lucide-react';

type Theme = 'light' | 'dark';

// 统计卡片组件
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  color: string;
  delay: number;
  isDark: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, suffix = '', color, delay, isDark }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  const panelBase = isDark
    ? 'bg-[#0a0c18]/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/60'
    : 'bg-white/70 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-lg shadow-black/[0.04]';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={panelBase}
      style={{ padding: '20px' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`text-[11px] tracking-wider uppercase mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
        <p className={`text-2xl font-bold tabular-nums ${isDark ? 'text-white' : 'text-gray-800'}`}>
          {displayValue.toLocaleString()}{suffix}
        </p>
      </div>
    </motion.div>
  );
};

// GitHub 风格热力图组件
const ContributionHeatmap: React.FC<{ data: number[][]; isDark: boolean }> = ({ data, isDark }) => {
  const days = ['日', '一', '二', '三', '四', '五', '六'];

  const getMonthLabels = () => {
    const labels: string[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      labels.push(date.toLocaleDateString('zh-CN', { month: 'short' }));
    }
    return labels;
  };

  const monthLabels = getMonthLabels();

  const getColor = (count: number) => {
    if (count === 0) return isDark ? 'bg-white/[0.04]' : 'bg-gray-100';
    if (count <= 2) return isDark ? 'bg-emerald-900/50' : 'bg-emerald-200';
    if (count <= 5) return isDark ? 'bg-emerald-700/60' : 'bg-emerald-400';
    if (count <= 8) return isDark ? 'bg-emerald-500/70' : 'bg-emerald-500';
    return isDark ? 'bg-emerald-400' : 'bg-emerald-600';
  };

  const totalContributions = data.flat().reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-5">
      {/* 顶部统计 */}
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
          <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>过去一年共发布</span>
          <span className={`text-lg font-bold tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{totalContributions}</span>
          <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>篇文章</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Flame className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
          <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>连续发布</span>
          <span className={`text-lg font-bold tabular-nums ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>12</span>
          <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>天</span>
        </div>
      </div>

      {/* 月份标签 */}
      <div className="flex ml-8">
        {monthLabels.map((month) => (
          <div
            key={month}
            className={`text-[10px] tracking-wider text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
            style={{ width: `${100 / 12}%` }}
          >
            {month}
          </div>
        ))}
      </div>

      {/* 热力图主体 */}
      <div className="flex">
        <div className="flex flex-col gap-[4px] mr-2 flex-shrink-0">
          {days.map((day, i) => (
            <div key={day} className={`h-[14px] flex items-center text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              {i % 2 === 1 ? day : ''}
            </div>
          ))}
        </div>

        <div className="flex gap-[4px] flex-1 min-w-0">
          {data.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[4px] flex-1">
              {week.map((count, dayIndex) => (
                <motion.div
                  key={`${weekIndex}-${dayIndex}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + weekIndex * 0.008 + dayIndex * 0.003 }}
                  className={`aspect-square rounded-[3px] ${getColor(count)} cursor-pointer hover:scale-125 hover:z-10 transition-transform duration-200`}
                  title={`${count} 篇文章`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-between">
        <p className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>悬停查看每日发布数量</p>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>少</span>
          {[
            isDark ? 'bg-white/[0.04]' : 'bg-gray-100',
            isDark ? 'bg-emerald-900/50' : 'bg-emerald-200',
            isDark ? 'bg-emerald-700/60' : 'bg-emerald-400',
            isDark ? 'bg-emerald-500/70' : 'bg-emerald-500',
            isDark ? 'bg-emerald-400' : 'bg-emerald-600',
          ].map((color, i) => (
            <div key={i} className={`w-[14px] h-[14px] rounded-[3px] ${color}`} />
          ))}
          <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>多</span>
        </div>
      </div>
    </div>
  );
};

// 计划卡片组件
interface Plan {
  id: number;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'planned';
  progress: number;
  deadline: string;
  icon: React.ReactNode;
}

const PlanCard: React.FC<{ plan: Plan; index: number; isDark: boolean }> = ({ plan, index, isDark }) => {
  const statusConfig = {
    completed: { label: '已完成', color: isDark ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    'in-progress': { label: '进行中', color: isDark ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' : 'text-blue-600 bg-blue-50 border-blue-200' },
    planned: { label: '计划中', color: isDark ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-purple-600 bg-purple-50 border-purple-200' },
  };

  const config = statusConfig[plan.status];

  const panelBase = isDark
    ? 'bg-[#0a0c18]/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/60'
    : 'bg-white/70 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-lg shadow-black/[0.04]';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.1 }}
      className={panelBase}
      style={{ padding: '16px 20px' }}
    >
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-xl ${isDark ? 'bg-white/[0.04]' : 'bg-gray-50'}`}>
          <div className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>{plan.icon}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <h3 className={`text-sm font-medium ${isDark ? 'text-white/90' : 'text-gray-800'}`}>{plan.title}</h3>
            <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.color}`}>
              {config.label}
            </span>
          </div>
          <p className={`text-[11px] mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{plan.description}</p>
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>进度</span>
              <span className={`font-medium tabular-nums ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{plan.progress}%</span>
            </div>
            <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.04]' : 'bg-gray-100'}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${plan.progress}%` }}
                transition={{ delay: 1.2 + index * 0.15, duration: 0.8 }}
                className={`h-full rounded-full ${isDark ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
              />
            </div>
          </div>
          <div className={`flex items-center gap-1.5 mt-2.5 text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            <Calendar className="w-3 h-3" />
            <span>截止: {plan.deadline}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

class PageErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  state = { hasError: false, error: '' };
  static getDerivedStateFromError(error: Error) { return { hasError: true, error: error.message }; }
  componentDidCatch(error: Error) { console.error('ContributionPage error:', error); }
  render() {
    if (this.state.hasError) {
      return createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: '#f8f9fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="flex flex-col items-center gap-6">
            <p className="text-red-400 text-sm">页面渲染出错</p>
            <p className="text-gray-400 text-xs max-w-xs text-center">{this.state.error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 border border-gray-200 rounded-full text-gray-500 text-xs">刷新页面</button>
          </div>
        </div>,
        document.body
      );
    }
    return this.props.children;
  }
}

// 模拟数据
const generateMockData = () => {
  const contributions = Array.from({ length: 52 }, () =>
    Array.from({ length: 7 }, () => {
      const rand = Math.random();
      if (rand < 0.3) return 0;
      if (rand < 0.6) return Math.floor(Math.random() * 3) + 1;
      if (rand < 0.85) return Math.floor(Math.random() * 5) + 3;
      return Math.floor(Math.random() * 5) + 8;
    })
  );
  return { contributions };
};

const plans: Plan[] = [
  { id: 1, title: '完善博客功能', description: '添加评论系统、文章分类、标签管理', status: 'in-progress', progress: 65, deadline: '2024-06-30', icon: <BookOpen className="w-4 h-4" /> },
  { id: 2, title: '性能优化', description: '提升页面加载速度，优化图片加载', status: 'planned', progress: 0, deadline: '2024-07-15', icon: <Zap className="w-4 h-4" /> },
  { id: 3, title: 'AI 功能增强', description: '改进 AI 助手的回答质量', status: 'in-progress', progress: 40, deadline: '2024-08-01', icon: <Sparkles className="w-4 h-4" /> },
  { id: 4, title: '移动端适配', description: '优化移动端显示效果', status: 'completed', progress: 100, deadline: '2024-05-30', icon: <Star className="w-4 h-4" /> },
];

// 主页面组件
function ContributionPageInner() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('page-theme');
    return (savedTheme as Theme) || 'light';
  });
  const mockData = useMemo(() => generateMockData(), []);
  const isDark = theme === 'dark';

  // 同步主题到 body 和 localStorage
  useEffect(() => {
    document.body.setAttribute('data-contribution-theme', theme);
    localStorage.setItem('page-theme', theme);
    return () => { document.body.removeAttribute('data-contribution-theme'); };
  }, [theme]);

  const bg = isDark ? '#020408' : '#f4f6fa';
  const panelBase = isDark
    ? 'bg-[#0a0c18]/80 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl shadow-black/60'
    : 'bg-white/70 backdrop-blur-2xl border border-black/[0.06] rounded-2xl shadow-lg shadow-black/[0.04]';

  const stats = [
    { icon: <BookOpen className="w-4 h-4" />, label: '总发布文章', value: mockData.contributions.flat().reduce((a, b) => a + b, 0), color: '#10b981' },
    { icon: <Flame className="w-4 h-4" />, label: '连续发布', value: 12, suffix: '天', color: '#f97316' },
    { icon: <TrendingUp className="w-4 h-4" />, label: '本月发布', value: 28, color: '#3b82f6' },
    { icon: <Target className="w-4 h-4" />, label: '年度目标', value: 78, suffix: '%', color: '#8b5cf6' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9990, background: bg }}>
      {/* Background layers - 与知识图谱统一 */}
      {isDark ? (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 60% 80%, rgba(249,115,22,0.06) 0%, transparent 40%)
            `,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "32px 32px", backgroundPosition: "16px 16px",
          }} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { x: 15, y: 25, w: 50, h: 40, color: "16,185,129", opacity: 0.07, dur: 25 },
              { x: 70, y: 10, w: 40, h: 35, color: "59,130,246", opacity: 0.06, dur: 30 },
              { x: 45, y: 60, w: 55, h: 45, color: "249,115,22", opacity: 0.065, dur: 28 },
            ].map((n, i) => (
              <div key={`nebula-${i}`} className="absolute rounded-full" style={{
                left: `${n.x}%`, top: `${n.y}%`, width: `${n.w}%`, height: `${n.h}%`,
                background: `radial-gradient(ellipse, rgba(${n.color},${n.opacity}) 0%, transparent 70%)`,
                filter: "blur(40px)", animation: `graphNebula ${n.dur}s ease-in-out ${i * 3}s infinite`,
              }} />
            ))}
          </div>
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 80 }, (_, i) => {
              const x = (((i * 13 + 7) * 43) % 103) / 103 * 100;
              const y = (((i * 17 + 11) * 53) % 107) / 107 * 100;
              const size = 0.8 + (((i * 3 + 1) * 19) % 17) / 17 * 1.5;
              const dur = 8 + (((i * 7 + 3) * 23) % 31) / 31 * 15;
              const delay = (((i * 5 + 1) * 29) % 41) / 41 * dur;
              const drift = -20 + (((i * 11 + 5) * 37) % 43) / 43 * 40;
              const bright = 0.15 + (((i * 2 + 1) * 41) % 23) / 23 * 0.4;
              return (
                <div key={`dust-${i}`} className="absolute rounded-full" style={{
                  left: `${x}%`, top: `${y}%`, width: size, height: size,
                  background: `rgba(200,220,255,${bright})`,
                  boxShadow: `0 0 ${size * 2}px rgba(180,210,255,${bright * 0.5})`,
                  animation: `graphDust ${dur}s ease-in-out ${delay}s infinite`,
                  "--dust-drift": `${drift}px`,
                } as React.CSSProperties} />
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: `
              radial-gradient(ellipse at 20% 50%, rgba(16,185,129,0.06) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 20%, rgba(59,130,246,0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 60% 80%, rgba(249,115,22,0.03) 0%, transparent 40%),
              linear-gradient(135deg, #f0f2f8 0%, #e8ecf4 50%, #f4f6fa 100%)
            `,
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px", backgroundPosition: "16px 16px",
          }} />
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { x: 15, y: 25, w: 50, h: 40, color: "16,185,129", opacity: 0.04, dur: 25 },
              { x: 70, y: 10, w: 40, h: 35, color: "59,130,246", opacity: 0.03, dur: 30 },
            ].map((n, i) => (
              <div key={`orb-${i}`} className="absolute rounded-full" style={{
                left: `${n.x}%`, top: `${n.y}%`, width: `${n.w}%`, height: `${n.h}%`,
                background: `radial-gradient(ellipse, rgba(${n.color},${n.opacity}) 0%, transparent 70%)`,
                filter: "blur(60px)", animation: `graphNebula ${n.dur}s ease-in-out ${i * 3}s infinite`,
              }} />
            ))}
          </div>
        </>
      )}

      {/* Content */}
      <div className="absolute inset-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Top control bar - 与知识图谱统一 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-2.5 mb-8"
          >
            <div className={panelBase} style={{ padding: '10px 14px' }}>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center w-7 h-7">
                  <Activity className={isDark ? 'text-emerald-400' : 'text-emerald-500'} size={16} />
                  <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-500/10'} animate-ping`} style={{ animationDuration: '3s' }} />
                </div>
                <div className="flex flex-col">
                  <h1 className={`text-sm tracking-[0.15em] ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                    创作足迹
                  </h1>
                  <span className={`text-[9px] tracking-[0.2em] uppercase ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Contribution</span>
                </div>
                <div className="flex-1" />
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${isDark ? 'bg-white/[0.03] border border-white/[0.04]' : 'bg-gray-100/80 border border-gray-200/60'}`}>
                  <div className={`w-1 h-1 rounded-full animate-pulse ${isDark ? 'bg-emerald-400/60' : 'bg-emerald-500'}`} />
                  <span className={`text-[9px] tabular-nums tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {mockData.contributions.flat().reduce((a, b) => a + b, 0)}
                  </span>
                </div>
                {/* Theme toggle - 与知识图谱统一 */}
                <button
                  onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
                  className={`graph-icon-btn ${isDark ? '' : 'graph-icon-btn--active'}`}
                  title={isDark ? '切换亮色' : '切换暗色'}
                >
                  {isDark ? <Sun size={13} /> : <Moon size={13} />}
                </button>
              </div>
            </div>
          </motion.div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.label}
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                color={stat.color}
                delay={0.2 + index * 0.08}
                isDark={isDark}
              />
            ))}
          </div>

          {/* 热力图 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={panelBase}
            style={{ padding: '20px 24px' }}
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className={`p-1.5 rounded-lg ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                <Activity className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
              </div>
              <h2 className={`text-sm font-medium tracking-wider ${isDark ? 'text-white/90' : 'text-gray-800'}`}>发布活跃度</h2>
            </div>
            <ContributionHeatmap data={mockData.contributions} isDark={isDark} />
          </motion.div>

          {/* 页面标题 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-center my-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              <span className={isDark ? 'text-white' : 'text-gray-800'}>我的</span>
              <span className={isDark ? 'text-emerald-400' : 'text-emerald-600'}>创作旅程</span>
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>记录每一天的创作历程，见证成长的轨迹</p>
          </motion.div>

          {/* 计划部分 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className={`p-1.5 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                <Target className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
              </div>
              <h2 className={`text-sm font-medium tracking-wider ${isDark ? 'text-white/90' : 'text-gray-800'}`}>我的计划</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plans.map((plan, index) => (
                <PlanCard key={plan.id} plan={plan} index={index} isDark={isDark} />
              ))}
            </div>
          </motion.div>

          {/* 底部 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center mt-12 pb-6"
          >
            <div className={`inline-flex items-center gap-2 text-[10px] tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
              <Sparkles className="w-3 h-3" />
              <span>每天坚持创作，积少成多</span>
              <Sparkles className="w-3 h-3" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function ContributionPage() {
  return createPortal(
    <PageErrorBoundary>
      <ContributionPageInner />
    </PageErrorBoundary>,
    document.body
  );
}
