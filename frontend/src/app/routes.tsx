import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";
import { Home } from "./pages/Home";
import { Welcome } from "./pages/Welcome";
import { BlogList } from "./pages/BlogList";
import { BlogDetail } from "./pages/BlogDetail";
import { About } from "./pages/About";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { NotFound } from "./pages/NotFound";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminPermissions } from "./pages/AdminPermissions";
import { AdminContent } from "./pages/AdminContent";
import { AdminPages } from "./pages/AdminPages";
import { AdminBlogManager } from "./pages/AdminBlogManager";
import { AdminBlogWriter } from "./pages/AdminBlogWriter";
import { GuestbookPage } from "./pages/GuestbookPage";
import { ChatPage } from "./pages/ChatPage";
import { KnowledgeGraph } from "./pages/KnowledgeGraph";
import { AdminGuestbook } from "./pages/AdminGuestbook";
import { AdminGallery } from "./pages/AdminGallery";
import { AdminFieldManagement } from "./pages/AdminFieldManagement";
import { AdminAIManagement } from "./pages/AdminAIManagement";
import { FriendsPage } from "./pages/FriendsPage";
import { AdminFriendLinks } from "./pages/AdminFriendLinks";
import { ContributionPage } from "./pages/ContributionPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/home",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "blog", element: <BlogList /> },
      { path: "blog/:id", element: <BlogDetail /> },
      { path: "about", element: <About /> },
      { path: "guestbook", element: <GuestbookPage /> },
      { path: "friends", element: <FriendsPage /> },
      { path: "chat", element: <ChatPage /> },
      { path: "graph", element: <KnowledgeGraph /> },
      { path: "contributions", element: <ContributionPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "users", element: <AdminUsers /> },
      { path: "permissions", element: <AdminPermissions /> },
      { path: "blog", element: <AdminBlogManager /> },
      { path: "blog-writer", element: <AdminBlogWriter /> },
      { path: "content", element: <AdminContent /> },
      { path: "pages", element: <AdminPages /> },
      { path: "gallery", element: <AdminGallery /> },
      { path: "guestbook", element: <AdminGuestbook /> },
      { path: "friend-links", element: <AdminFriendLinks /> },
      { path: "fields", element: <AdminFieldManagement /> },
      { path: "ai", element: <AdminAIManagement /> },
    ],
  },
]);