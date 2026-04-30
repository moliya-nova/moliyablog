import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { aiManageApi } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import {
  Power,
  Users,
  Activity,
  Settings,
  Trash2,
  RefreshCw,
  Zap,
  MessageSquare,
} from 'lucide-react';

interface AiStatus {
  enabled: boolean;
  maxConcurrency: number;
  activeConnections: number;
  totalRequests: number;
  message: string;
}

interface AiConfig {
  llm_api_key: string;
  llm_base_url: string;
  llm_model: string;
  chunk_size: number;
  chunk_overlap: number;
  system_prompt: string;
}

interface ActiveThread {
  thread_id: string;
  last_access: number;
  expires_in: number;
}

export function AdminAIManagement() {
  // ========== 状态 ==========
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [threads, setThreads] = useState<ActiveThread[]>([]);
  const [loading, setLoading] = useState(true);

  // 配置编辑状态
  const [editModel, setEditModel] = useState('');
  const [editBaseUrl, setEditBaseUrl] = useState('');
  const [editApiKey, setEditApiKey] = useState('');
  const [editSystemPrompt, setEditSystemPrompt] = useState('');
  const [editMaxConcurrency, setEditMaxConcurrency] = useState(5);
  const [saving, setSaving] = useState(false);

  // ========== 数据加载 ==========
  const fetchAll = async () => {
    try {
      const [statusData, configData] = await Promise.all([
        aiManageApi.getStatus(),
        aiManageApi.getConfig(),
      ]);
      setStatus(statusData);
      setEditMaxConcurrency(statusData.maxConcurrency);
      if (configData?.data) {
        setConfig(configData.data);
        setEditModel(configData.data.llm_model || '');
        setEditBaseUrl(configData.data.llm_base_url || '');
        setEditApiKey('');  // 不回填密钥
        setEditSystemPrompt(configData.data.system_prompt || '');
      }
    } catch (error) {
      toast.error('加载 AI 配置失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchThreads = async () => {
    try {
      const data = await aiManageApi.getActiveThreads();
      if (data?.data) {
        setThreads(data.data);
      }
    } catch {
      // 静默失败
    }
  };

  useEffect(() => {
    fetchAll();
    fetchThreads();
    // 每 30 秒刷新一次状态
    const interval = setInterval(() => {
      fetchAll();
      fetchThreads();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ========== 操作处理 ==========
  const handleToggleStatus = async () => {
    try {
      const data = await aiManageApi.toggleStatus(!status?.enabled);
      setStatus(data);
      toast.success(data.enabled ? 'AI 服务已启用' : 'AI 服务已禁用');
    } catch {
      toast.error('切换状态失败');
    }
  };

  const handleSaveConcurrency = async () => {
    try {
      await aiManageApi.setConcurrency(editMaxConcurrency);
      toast.success(`最大并发数已设置为 ${editMaxConcurrency}`);
      fetchAll();
    } catch {
      toast.error('设置并发数失败');
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const updateData: any = {};
      if (editModel) updateData.llm_model = editModel;
      if (editBaseUrl) updateData.llm_base_url = editBaseUrl;
      if (editApiKey) updateData.llm_api_key = editApiKey;
      if (editSystemPrompt) updateData.system_prompt = editSystemPrompt;

      if (Object.keys(updateData).length === 0) {
        toast.error('没有需要更新的配置');
        return;
      }

      await aiManageApi.updateConfig(updateData);
      toast.success('AI 配置已更新并生效');
      setEditApiKey('');
      fetchAll();
    } catch {
      toast.error('更新配置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleClearAllMemory = async () => {
    try {
      await aiManageApi.clearAllMemory();
      toast.success('所有会话记忆已清除');
      fetchThreads();
    } catch {
      toast.error('清除记忆失败');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI 管理</h1>
        <p className="text-muted-foreground mt-1">管理 AI 智能体的状态、并发、配置和会话</p>
      </div>

      {/* 状态卡片 + 并发卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 服务状态 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Power className="w-4 h-4" />
                服务状态
              </CardTitle>
              <CardDescription>控制 AI 服务的启用和禁用</CardDescription>
            </div>
            <Badge variant={status?.enabled ? 'default' : 'destructive'}>
              {status?.enabled ? '运行中' : '已禁用'}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{status?.message}</span>
              <Switch
                checked={status?.enabled ?? true}
                onCheckedChange={handleToggleStatus}
              />
            </div>
          </CardContent>
        </Card>

        {/* 并发控制 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                并发控制
              </CardTitle>
              <CardDescription>限制同时使用 AI 的人数</CardDescription>
            </div>
            <Badge variant="outline">
              可用: {status?.maxConcurrency ?? 0}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <Label htmlFor="max-concurrency" className="text-xs">最大并发数</Label>
                <Input
                  id="max-concurrency"
                  type="number"
                  min={1}
                  max={100}
                  value={editMaxConcurrency}
                  onChange={(e) => setEditMaxConcurrency(Number(e.target.value))}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSaveConcurrency} size="sm">保存</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 统计卡片 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4" />
              运行统计
            </CardTitle>
            <CardDescription>AI 服务的实时运行数据</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => { fetchAll(); fetchThreads(); }}>
            <RefreshCw className="w-3.5 h-3.5 mr-1" />
            刷新
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Zap className="w-5 h-5 mx-auto text-yellow-500 mb-1" />
              <div className="text-2xl font-bold">{status?.totalRequests ?? 0}</div>
              <div className="text-xs text-muted-foreground">累计请求</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <Users className="w-5 h-5 mx-auto text-blue-500 mb-1" />
              <div className="text-2xl font-bold">{status?.activeConnections ?? 0}</div>
              <div className="text-xs text-muted-foreground">活跃连接</div>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <MessageSquare className="w-5 h-5 mx-auto text-green-500 mb-1" />
              <div className="text-2xl font-bold">{threads.length}</div>
              <div className="text-xs text-muted-foreground">活跃会话</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 配置卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            模型配置
          </CardTitle>
          <CardDescription>
            修改 AI 模型配置，保存后立即生效（热重载）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="llm-model">模型名称</Label>
              <Input
                id="llm-model"
                value={editModel}
                onChange={(e) => setEditModel(e.target.value)}
                placeholder="deepseek-chat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="llm-base-url">API 地址</Label>
              <Input
                id="llm-base-url"
                value={editBaseUrl}
                onChange={(e) => setEditBaseUrl(e.target.value)}
                placeholder="https://api.deepseek.com/v1"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="llm-api-key">API 密钥</Label>
            <Input
              id="llm-api-key"
              type="password"
              value={editApiKey}
              onChange={(e) => setEditApiKey(e.target.value)}
              placeholder="留空则不更新，当前: ****"
            />
            <p className="text-xs text-muted-foreground">
              当前密钥: {config?.llm_api_key || '未配置'}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="system-prompt">系统提示词</Label>
            <Textarea
              id="system-prompt"
              value={editSystemPrompt}
              onChange={(e) => setEditSystemPrompt(e.target.value)}
              placeholder="AI 助手的角色设定..."
              rows={4}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={saving}>
              {saving ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 会话记忆管理 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              会话记忆
            </CardTitle>
            <CardDescription>
              管理 AI 的对话记忆，15 分钟无活动自动过期
            </CardDescription>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearAllMemory}
            disabled={threads.length === 0}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            清除全部
          </Button>
        </CardHeader>
        <CardContent>
          {threads.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无活跃会话</p>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.thread_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <span className="font-mono text-sm">{thread.thread_id}</span>
                    <span className="text-xs text-muted-foreground ml-3">
                      剩余 {Math.round(thread.expires_in)}秒
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    活跃
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
