import { useState, useEffect, useCallback } from "react";
import { Link2, Globe, Mail, Send, User, ExternalLink, LayoutGrid, List, Search } from "lucide-react";
import { friendLinkApi } from "../services/api";
import { FriendLink, FriendLinkApply } from "../types";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Label } from "../components/ui/label";

export function FriendsPage() {
  const [friendLinks, setFriendLinks] = useState<FriendLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({
    name: "",
    url: "",
    avatar: "",
    description: "",
    email: "",
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadFriendLinks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await friendLinkApi.getFriendLinks();
      setFriendLinks(data);
    } catch (error) {
      console.error("获取友链失败:", error);
      toast.error("加载友链失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFriendLinks();
  }, [loadFriendLinks]);

  // 筛选友链
  const filteredLinks = friendLinks.filter(link => {
    const matchesSearch = searchQuery === "" ||
      link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleSubmitApply = async () => {
    if (!applyForm.name || !applyForm.url) {
      toast.error("请填写网站名称和链接");
      return;
    }

    try {
      setSubmitting(true);
      await friendLinkApi.submitApply({
        ...applyForm,
        id: 0,
        status: 0,
        adminReply: "",
        createTime: "",
        updateTime: "",
      });
      toast.success("申请已提交，请等待审核");
      setApplyDialogOpen(false);
      setApplyForm({ name: "", url: "", avatar: "", description: "", email: "", reason: "" });
    } catch (error) {
      console.error("提交申请失败:", error);
      toast.error("提交失败，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  // 获取卡片样式类名
  const getCardStyleClass = (cardStyle: string) => {
    switch (cardStyle) {
      case 'gradient':
        return 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200';
      case 'minimal':
        return 'bg-gray-50 border-gray-200 shadow-sm';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const renderGridView = (links: FriendLink[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {links.map((link, index) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Card className={`h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] overflow-hidden ${getCardStyleClass(link.cardStyle)}`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {link.avatar ? (
                      <img
                        src={link.avatar}
                        alt={link.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:rotate-[360deg]"
                      />
                    ) : (
                      <Globe className="w-8 h-8 text-blue-500" />
                    )}
                  </div>
                  {/* 状态指示器 */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                      link.isAlive === 1 ? "bg-green-500" : "bg-red-500"
                    }`}
                    title={link.isAlive === 1 ? "站点正常" : "站点不可达"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                    {link.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {link.description || "暂无简介"}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
              {link.category && link.category !== "默认" && (
                <Badge variant="secondary" className="mt-4 text-xs">
                  {link.category}
                </Badge>
              )}
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );

  const renderListView = (links: FriendLink[]) => (
    <div className="space-y-4">
      {links.map((link, index) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Card className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${getCardStyleClass(link.cardStyle)}`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                    {link.avatar ? (
                      <img
                        src={link.avatar}
                        alt={link.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:rotate-[360deg]"
                      />
                    ) : (
                      <Globe className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                      link.isAlive === 1 ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {link.name}
                    </h3>
                    {link.category && link.category !== "默认" && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {link.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 truncate">
                    {link.description || "暂无简介"}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-400 hidden sm:block">{link.url}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );

  return (
    <div className="relative z-10">
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 头部区域 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 font-buding" style={{ fontFamily: "'字魂布丁体', cursive" }}>友情链接</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              这里汇聚了来自各个领域的优秀博客，欢迎访问交流
            </p>
          </div>

          {/* 友链内容卡片 */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg">
            {/* 工具栏 */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>共 {friendLinks.length} 个友链</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  {friendLinks.filter(l => l.isAlive === 1).length} 个在线
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="搜索友链..."
                    className="pl-8 w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setApplyDialogOpen(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  申请友链
                </Button>
              </div>
            </div>

            {/* 友链内容 */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="h-32 animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredLinks.length === 0 ? (
              <div className="text-center py-16">
                <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery ? "没有找到匹配的友链" : "暂无友链"}
                </h3>
                <p className="text-gray-500">
                  {searchQuery ? "尝试使用其他搜索词" : "敬请期待"}
                </p>
              </div>
            ) : (
              <div>
                {viewMode === "grid" ? renderGridView(filteredLinks) : renderListView(filteredLinks)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 友链申请对话框 */}
      <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>申请友链</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">网站名称 *</Label>
              <Input
                id="name"
                value={applyForm.name}
                onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                placeholder="请输入网站名称"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">网站链接 *</Label>
              <Input
                id="url"
                type="url"
                value={applyForm.url}
                onChange={(e) => setApplyForm({ ...applyForm, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="avatar">头像/Logo链接</Label>
              <Input
                id="avatar"
                value={applyForm.avatar}
                onChange={(e) => setApplyForm({ ...applyForm, avatar: e.target.value })}
                placeholder="https://example.com/avatar.png"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">网站简介</Label>
              <Textarea
                id="description"
                value={applyForm.description}
                onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })}
                placeholder="简单介绍一下你的网站"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">联系邮箱</Label>
              <Input
                id="email"
                type="email"
                value={applyForm.email}
                onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">申请理由</Label>
              <Textarea
                id="reason"
                value={applyForm.reason}
                onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                placeholder="为什么想和我交换友链？"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setApplyDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitApply} disabled={submitting}>
              {submitting ? "提交中..." : "提交申请"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
