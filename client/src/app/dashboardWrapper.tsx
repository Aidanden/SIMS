"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "./(components)/Sidebar";
import { useAppSelector } from "./redux";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/unauthorized', '/forgot-password', '/reset-password'];

  // Check if current path starts with any of the public routes
  // This handles sub-routes and potential trailing slashes
  const isPublicRoute = pathname ? publicRoutes.some(route => {
    const normalizedPath = pathname.toLowerCase().trim();
    const normalizedRoute = route.toLowerCase().trim();
    return normalizedPath === normalizedRoute || normalizedPath.startsWith(`${normalizedRoute}/`);
  }) : false;
  const isStorePortalRoute = pathname?.startsWith('/store-portal');

  // Debug routing in development (تم إبقاؤه للمراقبة فقط - يمكن إزالته لاحقاً)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // console.log ... (تم التعطيل لتنظيف الكونسول)
    }
  }, [pathname, isAuthenticated, isPublicRoute, isStorePortalRoute]);

  useEffect(() => {
    // Only redirect if:
    // 1. Pathname is available
    // 2. We're NOT authenticated
    // 3. It's NOT a public route
    // 4. It's NOT a store portal route
    if (pathname && !isAuthenticated && !isPublicRoute && !isStorePortalRoute) {
      router.push('/login');
    }
  }, [isAuthenticated, isPublicRoute, isStorePortalRoute, router, pathname]);

  // ---------------------------------------------------------------------------
  // RENDER LOGIC
  // ---------------------------------------------------------------------------

  // 1. For public routes or store portal, return content immediately (Layout A)
  // لا نظهر السايد بار أو الناف بار
  if (isPublicRoute || isStorePortalRoute) {
    return (
      <div className={isStorePortalRoute ? "" : "min-h-screen bg-gray-50"}>
        {children}
      </div>
    );
  }

  // 2. Loading State for projected routes (Layout B)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من صلاحيات الوصول...</p>
        </div>
      </div>
    );
  }

  // 3. Main Dashboard Layout (Layout C)
  // نظهر السايد بار والناف بار
  return (
    <div
      dir="rtl"
      className="bg-background-primary text-text-primary w-full min-h-screen"
    >
      <Sidebar />
      <div
        className={`transition-[margin] duration-300 ease-in-out min-h-screen ${isSidebarCollapsed ? "mr-0 md:mr-16" : "mr-0 md:mr-64"
          }`}
      >
        <Navbar />
        <main className="p-6 bg-background-secondary min-h-screen transition-all duration-300">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default DashboardWrapper;
