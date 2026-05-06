# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack blog application with four components:

| Component | Stack | Description |
|-----------|-------|-------------|
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + Radix UI | SPA with React Router v7 |
| **Backend (blog-parent)** | Spring Boot 3.2 + Java 17 + MyBatis + MySQL — multi-module Maven project | REST API with JWT auth |
| **Backend (blog-core)** | Core module: blog CRUD, auth, user management, file uploads | Submodule of blog-parent |
| **Backend (blog-ai)** | AI module: Spring Boot (placeholder for future AI features) | Submodule of blog-parent |
| **AI Assistant** | Python 3.14 + FastAPI + LangChain + ChromaDB | RAG-based blog Q&A service |

The blog has public-facing pages (blog posts, home page, guestbook) and admin functionality (user management, content management, blog writing).

## Development Commands

### Frontend (`frontend/`)
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server
npm run build        # Production build
```

### Backend (`backend/`) — Multi-Module Maven
```bash
mvn clean install     # Build all modules (from backend/)
mvn spring-boot:run   # Start blog-core (from backend/, or -pl blog-core)
mvn test -pl blog-core             # Run blog-core tests
```

> blog-ai 是纯依赖模块，无启动类，不单独运行。最终部署只打包 blog-core 的单个 JAR。

### AI Assistant (`blog-ai-assistant/`)
```bash
uv sync              # Install dependencies
uv run python src/blog_ai/main.py  # Run the service
```

### Database
MySQL configuration (from `application.yml`):
- Database: `bloger`
- Host: `localhost:3306`
- Username: `root`
- Password: `root`

## Architecture

### Frontend (`frontend/src/app/`)
- **Pages**: `pages/` - Home, BlogList, BlogDetail, Login, Register, and admin pages
- **Components**: `components/` - Layout, AdminLayout, Header, Footer; `components/ui/` for Radix UI design system
- **Routing**: `routes.tsx` defines three route groups: public (`/home/*`), auth (`/login`, `/register`), admin (`/admin/*`)
- **State**: React Context for auth (`contexts/AuthContext.tsx`), Zustand stores in `stores/`
- **Services**: API calls in `services/` (AuthService, ArticleService, etc.)
- **Markdown**: Uses `@uiw/react-md-editor` for blog writing (not react-mde)

### Backend — Multi-Module Structure

```
backend/                          # blog-parent (parent POM)
├── blog-core/                    # Existing blog backend code
│   └── src/main/java/com/bloger/backend/
│       ├── controller/           # REST endpoints
│       ├── service/ + impl/      # Business logic
│       ├── entity/               # Domain models (Article, User, etc.)
│       ├── mapper/               # MyBatis mapper interfaces
│       ├── config/               # CORS, JWT, Security config
│       ├── exception/            # Global exception handling
│       └── util/                 # COS utils, validators
└── blog-ai/                      # AI module (placeholder)
    └── src/main/java/com/bloger/ai/
```

- **blog-core**: Controllers, Services, Entities, MyBatis Mappers, Security, COS storage
- **blog-ai**: 普通依赖模块（无启动类），供 blog-core 引入，用于开发 AI 相关功能
- Both modules inherit dependency versions from `blog-parent` POM

### AI Assistant (`blog-agent/src/blog_agent/`)

FastAPI + LangGraph 智能体，RAG 检索增强，ChromaDB 向量存储。

**目录规范：**

| 包 | 职责 | 不允许 |
|----|------|--------|
| `agent/` | Agent 抽象 + graph 编排 + memory + prompt | 不得放 LLM 连接、RAG 检索 |
| `agent/graph/` | LangGraph 节点、边、状态、workflow | 不得有业务逻辑（委托给 Agent） |
| `agent/prompt/` | 提示词常量，按 Agent 分文件 | 不得有函数（只有 `# 常量 = """..."""` ） |
| `llm/` | LLM 连接管理（ChatOpenAI 封装） | 不得持有 prompt、不得拼装上下文 |
| `rag/` | RAG 引擎（向量存储、切分、检索、文档存储） | 不得做提示词拼接（由 rag_agent 完成） |
| `api/` | FastAPI 路由，薄层只做参数校验+调用 | 不得内联 Pydantic 模型，不得写业务逻辑 |
| `models/schemas/` | Pydantic 请求/响应模型（DTO/VO） | 不得放图状态定义 |
| `core/` | 日志、配置、生命周期 | 不得放业务代码 |
| `utils/` | 跨模块通用工具 | 不得放有业务含义的类 |

**Agent 架构：**
```
LLMClient (仅 LLM 连接)
  ├── ChatAgent   → system_prompt + 上下文拼装 + 摘要生成 + 路由分类
  └── RagAgent    → RAG 检索调度 + 文档格式化

AgentWorkflow(chat_agent, rag_agent, memory_manager)
  └── classify → [条件边] → retrieve→llm / llm → summarize → END
```

**编码规范：**
- 函数注释放在 `def` 上方，`#` 风格，不放在函数体内用 `"""docstring"""`
- 提示词每个文件一种，`# =====` 分节，命名常量 `UPPER_CASE`
- `__init__.py` 只做重导出，不放逻辑
- import 路径从 `blog_agent.` 根开始的绝对路径
- 节点闭包通过工厂函数接收 Agent 实例，不直接 import 单例

## Key Features

1. **Authentication**: JWT-based login/registration with Spring Security, tokens in frontend localStorage
2. **Blog Management**: CRUD articles with categories and tags, markdown editing
3. **Admin Dashboard**: User management, content management, blog writing, guestbook, gallery
4. **AI Assistant**: RAG-based Q&A over blog content (separate Python service)
5. **Rich Text Editing**: Blog writer uses `@uiw/react-md-editor`
6. **File Uploads**: Max 10MB, stored in Tencent Cloud COS
7. **Responsive Design**: Mobile-first with Tailwind CSS and Radix UI components

## Testing

- Backend tests: `backend/src/test/java/` - only `PasswordEncodeTest.java` exists
- No frontend tests currently

## Important Notes

- Frontend uses React Router v7 (latest)
- Backend uses MyBatis XML mappers (not JPA as stated in some comments)
- Authentication is JWT-based; admin routes protected by AuthGuard components
- MySQL database must be running locally for backend to function

## Superpower Mode (Auto-Activated)

Every response must apply these enhanced capabilities:

### Deep Context Awareness
Before making ANY change:
- Read the full file being modified (not just the target lines)
- Grep for ALL usages of any function/class/variable being changed
- Check related test files, config files, and type definitions
- Understand the call chain: who calls this, and what does it call

### Proactive Issue Detection
While working on the user's request, silently scan for and report:
- **Security vulnerabilities**: SQL injection, XSS, auth bypass, hardcoded secrets, insecure CORS
- **Performance bottlenecks**: N+1 queries, missing indexes, unbounded loops, memory leaks, missing pagination
- **Code quality issues**: Dead code, unused imports, duplicate logic, inconsistent error handling
- **Missing safeguards**: No input validation, no error boundaries, no loading states, no timeout handling

Report these as a "Proactive Findings" section at the end, ranked by severity (Critical > High > Medium > Low).

### Architecture Intelligence
When suggesting changes, always consider:
- Impact across the full stack (frontend API call -> backend controller -> service -> mapper -> DB)
- Backward compatibility with existing API contracts
- Database migration needs (MyBatis XML changes + SQL schema changes)

### Enhanced Execution Strategy
For complex tasks:
1. **Plan first**: Outline the approach in 3-5 bullet points before coding
2. **Parallelize**: Identify independent subtasks and use parallel tool calls
3. **Verify**: After changes, run type checks / builds to confirm nothing broke
4. **Trace**: For debugging, follow the full request path from UI to DB

### Smart Defaults
- Use existing patterns in the codebase before introducing new ones
- Match the coding style of surrounding code (naming conventions, formatting, error handling)
- Prefer editing existing files over creating new ones
- Prefer existing dependencies over adding new ones

### 规范
- 输出和回答永远使用中文