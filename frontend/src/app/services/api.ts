import { Article, Category, TagType, Comment, CreateCommentRequest, User, LoginRequest, LoginResponse, Page, ChatResponse, Guestbook } from '../types';

const API_BASE_URL = '/api';

// 基础请求方法
async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    console.log('发起API请求:', `${API_BASE_URL}${url}`);
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };
    
    // 如果body是FormData，不要设置Content-Type，让浏览器自动处理
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    console.log('API响应状态:', response.status, response.statusText);
    if (!response.ok) {
      // 尝试从响应体中提取后端返回的错误信息
      try {
        const errorBody = await response.json();
        const errorMsg = errorBody.message || errorBody.msg || `API请求失败: ${response.status}`;
        throw new Error(errorMsg);
      } catch (e) {
        // 如果无法解析响应体，使用默认错误信息
        if (e instanceof Error && !e.message.startsWith('API请求失败')) {
          throw e;
        }
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
    }

    // 检查响应体是否为空
    const contentType = response.headers.get('content-type');
    if (response.status === 204) {
      console.log('API响应数据: 空响应');
      return {} as T;
    }

    // 处理不同类型的响应
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('API响应数据:', data);
      return data;
    } else {
      // 对于非JSON响应（如字符串），直接返回文本
      const data = await response.text();
      console.log('API响应数据:', data);
      return data as unknown as T;
    }
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

// 文章相关API
export const articleApi = {
  // 获取文章列表（已发布）
  getArticles: () => fetchApi<Article[]>('/articles'),

  // 分页获取文章列表
  getArticlesPage: (page: number, size: number) => fetchApi<{ content: Article[]; totalElements: number; totalPages: number }>(`/articles/paged?page=${page}&size=${size}`),
  
  // 获取所有文章（包括草稿）
  getArticlesAll: () => fetchApi<Article[]>('/articles/all'),
  
  // 根据分类获取文章
  getArticlesByCategory: (categoryId: number) => fetchApi<Article[]>(`/articles/category/${categoryId}`),
  
  // 根据标签获取文章
  getArticlesByTag: (tagId: number) => fetchApi<Article[]>(`/articles/tag/${tagId}`),
  
  // 获取文章详情
  getArticleById: (id: number) => fetchApi<Article>(`/articles/${id}`),
  
  // 上传markdown文件
  uploadMarkdown: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchApi<string>('/articles/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // 上传图片到COS
  uploadImage: async (file: File): Promise<string> => {

    const signResponse = await fetchApi<{
      url: string;
      key: string;
      cosUrl: string;
    }>(`/files/cos/sign?type=images&filename=${encodeURIComponent(file.name)}`);

    const { url, key } = signResponse;

    const uploadResponse = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('上传失败，响应内容:', errorText);
      throw new Error('上传失败');
    }
    return key;
  },

  // 创建文章
  createArticle: (article: Article) => fetchApi<void>('/articles', {
    method: 'POST',
    body: JSON.stringify(article),
  }),
  
  // 更新文章
  updateArticle: (id: number, article: Article) => fetchApi<void>(`/articles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(article),
  }),
  
  // 删除文章
  deleteArticle: (id: number) => fetchApi<void>(`/articles/${id}`, {
    method: 'DELETE',
  }),
};

// 分类相关API
export const categoryApi = {
  // 获取分类列表
  getCategories: () => fetchApi<Category[]>('/categories'),

  // 获取分类详情
  getCategoryById: (id: number) => fetchApi<Category>(`/categories/${id}`),

  // 创建分类
  createCategory: (category: Partial<Category>) => fetchApi<void>('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  }),

  // 更新分类
  updateCategory: (id: number, category: Partial<Category>) => fetchApi<void>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  }),

  // 删除分类
  deleteCategory: (id: number) => fetchApi<void>(`/categories/${id}`, {
    method: 'DELETE',
  }),
};

// 标签相关API
export const tagApi = {
  // 获取标签列表
  getTags: () => fetchApi<TagType[]>('/tags'),
  
  // 搜索标签
  searchTags: (name: string) => fetchApi<TagType[]>(`/tags/search?name=${name}`),
  
  // 获取文章的标签
  getTagsByArticleId: (articleId: number) => fetchApi<TagType[]>(`/tags/article/${articleId}`),
  
  // 获取标签详情
  getTagById: (id: number) => fetchApi<TagType>(`/tags/${id}`),
  
  // 创建标签
  createTag: (tag: Partial<TagType>) => fetchApi<TagType>('/tags', {
    method: 'POST',
    body: JSON.stringify(tag),
  }),

  // 更新标签
  updateTag: (id: number, tag: Partial<TagType>) => fetchApi<void>(`/tags/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tag),
  }),
  
  // 删除标签
  deleteTag: (id: number) => fetchApi<void>(`/tags/${id}`, {
    method: 'DELETE',
  }),
};

// 评论相关API
export const commentApi = {
  // 获取评论列表
  getComments: () => fetchApi<Comment[]>('/comments'),

  // 获取文章的评论
  getCommentsByArticleId: (articleId: number) => fetchApi<Comment[]>(`/comments/article/${articleId}`),

  // 获取评论详情
  getCommentById: (id: number) => fetchApi<Comment>(`/comments/${id}`),

  // 创建评论
  createComment: (comment: CreateCommentRequest) => fetchApi<Comment>('/comments', {
    method: 'POST',
    body: JSON.stringify(comment),
  }),
};

// 留言板相关API
export const guestbookApi = {
  // 获取留言列表
  getGuestbook: () => fetchApi<Guestbook[]>('/guestbook/public'),

  // 获取所有留言（包括未审核的）
  getGuestbookAll: () => fetchApi<Guestbook[]>('/guestbook'),

  // 获取留言数量
  getGuestbookCount: () => fetchApi<number>('/guestbook/count'),

  // 获取留言详情
  getGuestbookById: (id: number) => fetchApi<Guestbook>(`/guestbook/${id}`),

  // 创建留言
  createGuestbook: (guestbook: Guestbook) => fetchApi<void>('/guestbook', {
    method: 'POST',
    body: JSON.stringify(guestbook),
  }),

  // 更新留言
  updateGuestbook: (id: number, guestbook: Guestbook) => fetchApi<void>(`/guestbook/${id}`, {
    method: 'PUT',
    body: JSON.stringify(guestbook),
  }),

  // 回复留言
  replyGuestbook: (id: number, reply: string) => fetchApi<void>(`/guestbook/${id}/reply`, {
    method: 'POST',
    body: JSON.stringify({ reply }),
  }),

  // 删除留言
  deleteGuestbook: (id: number) => fetchApi<void>(`/guestbook/${id}`, {
    method: 'DELETE',
  }),
};

// 文件相关API
export const fileApi = {
  // 获取COS上传签名
  getCosSign: (type: string, filename: string, folder?: string) => {
    let url = `/files/cos/sign?type=${type}&filename=${encodeURIComponent(filename)}`;
    if (folder) {
      url += `&folder=${encodeURIComponent(folder)}`;
    }
    return fetchApi<{
      url: string;
      key: string;
      cosUrl: string;
    }>(url);
  },

  // 获取COS读取临时URL
  getCosReadUrl: (key: string) => fetchApi<{
    url: string;
    key: string;
  }>(`/files/cos/read?key=${encodeURIComponent(key)}`),

  // 获取COS对象列表
  listCosObjects: (prefix: string = '') => fetchApi<Array<{
    type: 'folder' | 'file';
    key: string;
    name: string;
    size?: number;
    lastModified?: string;
    cosUrl?: string;
  }>>(`/files/cos/list?prefix=${encodeURIComponent(prefix)}`),

  // 上传文件到COS
  uploadToCos: (url: string, file: File) => {
    return fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  // 获取顶级目录列表
  getRootDirectories: () => fetchApi<Array<{
    id: number;
    name: string;
    path: string;
    parentId: number | null;
    imageCount: number;
  }>>('/files/directories'),

  // 获取子目录列表
  getChildDirectories: (parentId: number) => fetchApi<Array<{
    id: number;
    name: string;
    path: string;
    parentId: number | null;
    imageCount: number;
  }>>(`/files/directories/${parentId}/children`),

  // 获取目录下图片（分页）
  getDirectoryImages: (directoryId: number, page: number = 1, size: number = 50) => fetchApi<{
    images: Array<{
      id: number;
      directoryId: number;
      cosKey: string;
      filename: string;
      size: number;
      cdnUrl: string;
      createTime: string;
    }>;
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }>(`/files/directories/${directoryId}/images?page=${page}&size=${size}`),

  // 上传图片到服务器（通过后端转发到COS）
  uploadImage: (file: File, directory: string = 'images') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('directory', directory);
    return fetchApi<{
      id: number;
      key: string;
      cdnUrl: string;
      filename: string;
    }>('/files/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // 删除图片
  deleteImage: (id: number) => fetchApi<void>(`/files/images/${id}`, {
    method: 'DELETE',
  }),

  // 同步COS历史数据
  syncFromCos: () => fetchApi<{
    syncing: boolean;
    progress: string;
    totalFiles: number;
    processedFiles: number;
  }>('/files/sync', {
    method: 'POST',
  }),

  // 获取同步进度
  getSyncProgress: () => fetchApi<{
    syncing: boolean;
    progress: string;
    totalFiles: number;
    processedFiles: number;
  }>('/files/sync/progress'),

  // ========== 图库管理相关 ==========

  // 获取图库目录树
  getGalleryTree: () => fetchApi<Array<{
    id: number;
    name: string;
    path: string;
    parentId: number | null;
    imageCount: number;
  }>>('/gallery/tree'),

  // 获取指定目录下的文件和文件夹
  getGalleryItems: (prefix: string) => fetchApi<Array<{
    type: 'folder' | 'file';
    key: string;
    name: string;
    size?: number;
    cosUrl?: string;
  }>>(`/gallery/list?prefix=${encodeURIComponent(prefix)}`),

  // 图库上传图片
  galleryUploadImage: async (file: File, folder: string): Promise<{ key: string; cdnUrl: string }> => {
    // 1. 获取预签名URL（带目录路径）
    const signResponse = await fetchApi<{
      url: string;
      key: string;
      cosUrl: string;
    }>(`/files/cos/sign?type=images&folder=${encodeURIComponent(folder)}&filename=${encodeURIComponent(file.name)}`);

    const { url, key } = signResponse;

    // 2. 直传到COS
    await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    // 3. 将元数据保存到数据库（不重新上传文件）
    await fetchApi<{
      id: number;
      key: string;
      cdnUrl: string;
      filename: string;
    }>('/files/save', {
      method: 'POST',
      body: JSON.stringify({
        key,
        filename: file.name,
        size: file.size,
        directory: folder,
      }),
    });

    return { key, cdnUrl: 'https://cdn.moliya.love/' + key };
  },

  // 保存图片元数据（前端直传COS后入库）
  saveMetadata: (key: string, filename: string, size: number, directory: string) => fetchApi<{
    id: number;
    key: string;
    cdnUrl: string;
    filename: string;
  }>('/files/save', {
    method: 'POST',
    body: JSON.stringify({ key, filename, size, directory }),
  }),

  // 图库删除图片
  galleryDeleteImage: (key: string) => fetchApi<void>(`/gallery/delete?key=${encodeURIComponent(key)}`, {
    method: 'DELETE',
  }),

  // 图库批量删除
  galleryDeleteImages: (keys: string[]) => fetchApi<void>('/gallery/delete/batch', {
    method: 'DELETE',
    body: JSON.stringify(keys),
  }),

  // 图库移动图片
  galleryMoveImage: (sourceKey: string, destinationKey: string) => fetchApi<void>(
    `/gallery/move?sourceKey=${encodeURIComponent(sourceKey)}&destinationKey=${encodeURIComponent(destinationKey)}`,
    { method: 'POST' }
  ),

  // 图库重命名
  galleryRenameImage: (oldKey: string, newKey: string) => fetchApi<void>(
    `/gallery/rename?oldKey=${encodeURIComponent(oldKey)}&newKey=${encodeURIComponent(newKey)}`,
    { method: 'POST' }
  ),

  // 图库创建文件夹
  galleryCreateFolder: (folderKey: string) => fetchApi<void>(
    `/gallery/folder/create?folderKey=${encodeURIComponent(folderKey)}`,
    { method: 'POST' }
  ),
};

// 用户相关API
export const userApi = {
  // 登录
  login: (loginData: LoginRequest) => fetchApi<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData),
  }),
  
  // 注册
  register: (username: string, email: string, password: string, avatar?: string) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    if (avatar) {
      formData.append('avatar', avatar);
    }
    return fetchApi<void>('/auth/register', {
      method: 'POST',
      body: formData,
    });
  },
  
  // 获取当前用户信息
  getCurrentUser: () => fetchApi<User>('/auth/me'),
  
  // 登出
  logout: () => fetchApi<void>('/auth/logout', {
    method: 'POST',
  }),
  
  // 获取用户列表
  getUsers: () => fetchApi<User[]>('/users'),
  
  // 获取用户详情
  getUserById: (id: number) => fetchApi<User>(`/users/${id}`),
  
  // 更新用户信息
  updateUser: (id: number, user: User) => fetchApi<void>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  }),
  
  // 创建用户
  createUser: (user: User & { password: string }) => fetchApi<void>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  }),

  // 删除用户
  deleteUser: (id: number) => fetchApi<void>(`/users/${id}`, {
    method: 'DELETE',
  }),
};

// 页面相关API
export const pageApi = {
  // 获取页面列表
  getPages: () => fetchApi<Page[]>('/pages'),
  
  // 获取页面详情
  getPageById: (id: number) => fetchApi<Page>(`/pages/${id}`),
  
  // 根据slug获取页面
  getPageBySlug: (slug: string) => fetchApi<Page>(`/pages/slug/${slug}`),
  
  // 创建页面
  createPage: (page: Page) => fetchApi<void>('/pages', {
    method: 'POST',
    body: JSON.stringify(page),
  }),
  
  // 更新页面
  updatePage: (id: number, page: Page) => fetchApi<void>(`/pages/${id}`, {
    method: 'PUT',
    body: JSON.stringify(page),
  }),
  
  // 删除页面
  deletePage: (id: number) => fetchApi<void>(`/pages/${id}`, {
    method: 'DELETE',
  }),
};

// 仪表盘相关API
export const dashboardApi = {
  // 获取仪表盘数据
  getDashboardData: () => fetchApi<{
    userCount: number;
    articleCount: number;
    commentCount: number;
    totalViewCount: number;
    recentActivities: Array<{
      username: string;
      lastLoginTime?: string;
      createTime?: string;
    }>;
  }>('/dashboard'),
};

// 轮播图相关API
export const carouselApi = {
  // 获取轮播图列表
  getCarouselSlides: () => fetchApi<any[]>('/carousel-slides'),
  
  // 创建轮播图
  createCarouselSlide: (slide: any) => fetchApi<void>('/carousel-slides', {
    method: 'POST',
    body: JSON.stringify(slide),
  }),
  
  // 更新轮播图
  updateCarouselSlide: (id: number, slide: any) => fetchApi<void>(`/carousel-slides/${id}`, {
    method: 'PUT',
    body: JSON.stringify(slide),
  }),
  
  // 删除轮播图
  deleteCarouselSlide: (id: number) => fetchApi<void>(`/carousel-slides/${id}`, {
    method: 'DELETE',
  }),
};

// 网站设置相关API
export const siteSettingsApi = {
  // 获取背景设置
  getBackgroundSettings: () => fetchApi<string>('/site-settings/background'),

  // 保存背景设置
  saveBackgroundSettings: (settings: string) => fetchApi<void>('/site-settings/background', {
    method: 'PUT',
    body: settings,
  }),

  // 获取网站设置
  getSiteSettings: (key: string) => fetchApi<string>(`/site-settings/${key}`),

  // 保存网站设置
  saveSiteSettings: (key: string, value: string) => fetchApi<void>(`/site-settings/${key}`, {
    method: 'PUT',
    body: value,
  }),
};

// 网站统计相关API
export const siteStatsApi = {
  // 获取网站统计
  getSiteStats: () => fetchApi<{
    articleCount: number;
    categoryCount: number;
    tagCount: number;
    totalViewCount: number;
    commentCount: number;
    guestbookCount: number;
  }>('/site-stats'),
};

// AI 聊天相关API
export const chatApi = {
  // ==================== 新增：流式 SSE 请求（完全贴合你的风格） ====================
  streamMessage: async (
    message: string,
    onChunk: (data: ChatResponse) => void,
    threadId: string = "default"
  ): Promise<void> => {
    const token = localStorage.getItem('token');
    const url = `${API_BASE_URL}/ai/chat`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: JSON.stringify({ message, thread_id: threadId }),
    });

    if (!response.ok) {
      throw new Error(`流式请求失败: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('当前浏览器不支持流式读取');

    const decoder = new TextDecoder('utf-8');
    let done = false;
    let lineBuffer = "";  // 缓冲跨 chunk 的不完整行

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        lineBuffer += chunk;

        // 按换行符分割，最后一段可能不完整，保留在 buffer 中
        const lines = lineBuffer.split('\n');
        lineBuffer = lines.pop() || "";  // 最后一段不完整，留到下次拼接

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          // SSE 规范允许 "data:" 或 "data: "，兼容两种格式
          if (trimmed.startsWith('data:')) {
            try {
              const jsonStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed.slice(5);
              const json = JSON.parse(jsonStr);
              onChunk(json);
            } catch (e) {
              console.error('流式解析失败', e);
            }
          }
        }
      }
    }

    // 流结束后处理 buffer 中剩余的最后一行
    if (lineBuffer.trim()) {
      const trimmed = lineBuffer.trim();
      if (trimmed.startsWith('data:')) {
        try {
          const jsonStr = trimmed.startsWith('data: ') ? trimmed.slice(6) : trimmed.slice(5);
          const json = JSON.parse(jsonStr);
          onChunk(json);
        } catch (e) {
          console.error('流式解析失败', e);
        }
      }
    }
  },

  // 清除指定会话的临时记忆
  deleteMemory: async (threadId: string): Promise<void> => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/ai/chat/memory/${threadId}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
  },
};

// 关于页面相关API
export const aboutPageApi = {
  // 获取关于页面数据
  getAboutPage: () => fetchApi<any>('/about-page'),
  
  // 更新关于页面数据
  updateAboutPage: (data: any) => fetchApi<void>('/about-page', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

// AI 管理相关API
export const aiManageApi = {
  // 获取AI状态
  getStatus: () => fetchApi<{
    enabled: boolean;
    maxConcurrency: number;
    activeConnections: number;
    totalRequests: number;
    message: string;
  }>('/ai/status'),

  // 切换启用/禁用
  toggleStatus: (enabled?: boolean) => fetchApi<any>(
    `/ai/status${enabled !== undefined ? `?enabled=${enabled}` : ''}`,
    { method: 'PUT' }
  ),

  // 获取并发设置
  getConcurrency: () => fetchApi<{
    maxConcurrency: number;
    availablePermits: number;
  }>('/ai/concurrency'),

  // 设置最大并发数
  setConcurrency: (maxConcurrency: number) => fetchApi<any>('/ai/concurrency', {
    method: 'PUT',
    body: JSON.stringify({ maxConcurrency }),
  }),

  // 获取AI配置
  getConfig: () => fetchApi<any>('/ai/config'),

  // 更新AI配置
  updateConfig: (config: {
    llmApiKey?: string;
    llmBaseUrl?: string;
    llmModel?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    systemPrompt?: string;
  }) => fetchApi<any>('/ai/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  }),

  // 获取统计信息
  getStats: () => fetchApi<any>('/ai/stats'),

  // 获取活跃线程列表
  getActiveThreads: () => fetchApi<any>('/ai/threads'),

  // 清除所有记忆
  clearAllMemory: () => fetchApi<any>('/ai/memory', {
    method: 'DELETE',
  }),
};
