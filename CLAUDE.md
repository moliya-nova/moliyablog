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

### AI Assistant (`blog-ai-assistant/src/blog_ai/`)
- FastAPI app with LangGraph-based agent for RAG over blog content
- ChromaDB for vector storage of blog articles
- Entry point: `blog_ai_assistant:main`

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
