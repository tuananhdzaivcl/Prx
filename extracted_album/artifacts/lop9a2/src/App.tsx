import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { MusicPlayer } from "@/components/MusicPlayer";
import { AlbumCover } from "@/components/AlbumCover";
import { useState, useEffect } from "react";

import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Admin from "@/pages/admin";
import Blocked from "@/pages/blocked";

const queryClient = new QueryClient();

const ALBUM_OPENED_KEY = "album_opened_v1";

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const [albumOpened, setAlbumOpened] = useState(() => {
    return sessionStorage.getItem(ALBUM_OPENED_KEY) === "true";
  });

  const handleAlbumOpen = () => {
    sessionStorage.setItem(ALBUM_OPENED_KEY, "true");
    setAlbumOpened(true);
  };

  if (!albumOpened) {
    return <AlbumCover onOpen={handleAlbumOpen} />;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (user?.isBlocked) {
    return (
      <Layout>
        <Switch>
          <Route path="/blocked" component={Blocked} />
          <Route>
            <Blocked />
          </Route>
        </Switch>
      </Layout>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </WouterRouter>
        <MusicPlayer />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
