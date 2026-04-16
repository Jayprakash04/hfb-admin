"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import Footer from "./Footer";

const PUBLIC_ROUTES = ["/login", "/signup"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Redirect unauthenticated users to login (for protected routes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicRoute) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, isPublicRoute, router]);

  // Redirect authenticated users away from login/signup
  useEffect(() => {
    if (!isLoading && isAuthenticated && isPublicRoute) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, isPublicRoute, router]);

  // Public pages (login/signup): render children only, no chrome
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected pages while loading auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-amber-brand border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated on a protected page — show nothing while redirect happens
  if (!isAuthenticated) {
    return null;
  }

  // Authenticated: show full dashboard chrome
  return (
    <>
      <Sidebar />
      <TopBar />
      {children}
      <Footer />
    </>
  );
}
