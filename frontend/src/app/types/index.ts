// 定义API响应和请求的TypeScript接口

// 文章接口
export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  authorId: number;
  authorName: string;
  categoryId: number;
  categoryName: string;
  imageUrl: string;
  readTime: string;
  viewCount: number;
  status: number;
  createTime: string;
  updateTime: string;
  tags?: TagType[];
  // 额外字段用于前端展示
  author?: string;
  date?: string;
  category?: string;
}

// 分类接口
export interface Category {
  id: number;
  name: string;
  description: string;
  sort: number;
  createTime: string;
  updateTime: string;
}

// 标签接口
export interface Tag {
  id: number;
  name: string;
  description: string;
  sort: number;
  createTime: string;
  updateTime: string;
}

export type TagType = Tag;

// 评论接口
export interface Comment {
  id: number;
  articleId: number;
  content: string;
  authorName: string;
  authorEmail: string;
  authorWebsite: string;
  parentId: number | null;
  status: number;
  createTime: string;
  updateTime: string;
  // 额外字段用于前端展示
  author?: string;
}

// 创建评论请求接口
export interface CreateCommentRequest {
  articleId: number;
  content: string;
  authorName: string;
  authorEmail: string;
  authorWebsite?: string;
  parentId?: number | null;
}

// 留言板接口
export interface Guestbook {
  id: number;
  content: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  reply: string;
  replyTime: string;
  status: number;
  sort: number;
  createTime: string;
  updateTime: string;
}

// 用户接口
export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  status: number;
  emailVerified: boolean;
  admin: boolean;
  lastLoginTime: string | null;
  createTime: string;
  updateTime: string;
}

// 登录请求接口
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应接口
export interface LoginResponse {
  token: string;
  user: User;
  isAdmin: boolean;
}

// 页面接口
export interface Page {
  id: number;
  slug: string;
  title: string;
  content: string;
  status: number;
  createTime: string;
  updateTime: string;
}

// About页面模块数据结构
export interface AboutPageData {
  profile: {
    name: string;
    title: string;
    description: string;
    avatar: string;
    socialLinks: {
      github: string;
      linkedin: string;
      twitter: string;
    };
  };
  stats: {
    experience: string;
    projects: string;
    contributions: string;
  };
  skills: {
    frontend: string[];
    backend: string[];
    design: string[];
    other: string[];
  };
  contact: {
    email: string;
    github: string;
  };
  experience: {
    position: string;
    company: string;
    period: string;
    description: string;
    color: string;
  }[];
}

// AI 聊天类型
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface ChatResponse {
  code: number;
  msg: string;
  data?: string;
}