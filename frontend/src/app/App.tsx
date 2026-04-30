import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { MotionConfig } from "motion/react";
import { Toaster } from "./components/ui/sonner";
import { MusicPlayerProvider } from "./components/MusicPlayer";
import { SmoothScrollProvider } from "./providers/SmoothScrollProvider";

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>
        <MusicPlayerProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <Toaster />
          </AuthProvider>
        </MusicPlayerProvider>
      </SmoothScrollProvider>
    </MotionConfig>
  );
}
