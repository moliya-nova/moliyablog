import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Background } from "./Background";
import { PageTransition } from "./PageTransition";
import { ChatFloatProvider } from "./ChatFloat";

export function Layout() {
  const location = useLocation();

  return (
    <ChatFloatProvider>
      <div className="relative min-h-screen">
        <Background />
        <div className="min-h-screen flex flex-col">
          <Sidebar />
          <main className="flex-1 pl-16 overflow-y-auto">
            <div key={location.pathname} className="relative">
              <PageTransition>
                <Outlet />
              </PageTransition>
            </div>
          </main>
        </div>
      </div>
    </ChatFloatProvider>
  );
}
