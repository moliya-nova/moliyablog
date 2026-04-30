# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack blog application with:
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Radix UI components
- **Backend**: Spring Boot 3.2 + Java 17 + MyBatis + MySQL + Spring Security + JWT authentication
- **Architecture**: Traditional MVC pattern with RESTful API endpoints and React Router for frontend routing

The application has both public-facing pages (blog posts, home page) and admin functionality (user management, content management, blog writing).

## Development Commands

### Frontend
- `npm install` - Install frontend dependencies
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build production bundle

### Backend
- `mvn spring-boot:run` - Start Spring Boot application
- `mvn test` - Run backend tests
- `mvn clean install` - Build and package the application

### Database
The application uses MySQL with the following configuration (from `application.properties`):
- Database: `bloger`
- Host: `localhost:3306`
- Username: `root`
- Password: `root`

## Code Structure

### Frontend Structure (`frontend/src/app/`)
- **Pages**: Located in `pages/` directory (Home, BlogList, BlogDetail, Login, Register, Admin pages)
- **Components**: 
  - Layout components in `components/` (Layout, AdminLayout, Header, Footer)
  - UI components in `components/ui/` (Radix UI based design system)
  - Authentication components in `components/` (AuthGuard, AuthProvider)
- **Routing**: Defined in `routes.tsx` with three main sections:
  - Public routes (`/`, `/home/*`)
  - Authentication routes (`/login`, `/register`)
  - Admin routes (`/admin/*`)
- **Data**: Static blog posts in `data/blogPosts.ts` (likely to be replaced with API calls)

### Backend Structure (`backend/src/main/java/com/bloger/backend/`)
- **Controllers**: REST API endpoints in `controller/` package (ArticleController, UserController, AuthController, etc.)
- **Services**: Business logic in `service/` and `service/impl/` packages
- **Entities**: JPA entities in `entity/` package (Article, User, Category, Tag, Comment, Page)
- **Mappers**: MyBatis mappers in `mapper/` package with corresponding XML files in `resources/mapper/`
- **Security**: JWT-based authentication with `JwtAuthenticationFilter`, `SecurityConfig`, and `UserDetailsServiceImpl`
- **Configuration**: CORS, JWT utility, and global exception handling

## Key Features

1. **Authentication**: JWT-based login/registration with Spring Security
2. **Blog Management**: Create, read, update, delete blog articles with categories and tags
3. **Admin Dashboard**: Comprehensive admin panel for user management, content management, and blog writing
4. **Rich Text Editing**: Admin blog writer uses react-mde for markdown editing
5. **Responsive Design**: Mobile-first approach with Tailwind CSS and responsive components

## Testing

- Backend tests are located in `backend/src/test/java/`
- Currently only has `PasswordEncodeTest.java` as an example
- No frontend tests currently exist

## Important Notes

- The frontend uses React Router v7 (latest version)
- Backend uses MyBatis XML mappers for database operations
- Authentication is handled via JWT tokens stored in localStorage on the frontend
- File uploads are configured for up to 10MB files
- The application expects a MySQL database to be running locally
- Admin routes are protected by AuthGuard components that check user permissions